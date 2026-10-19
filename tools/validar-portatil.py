#!/usr/bin/env python3
"""Teste sem internet: integridade de ZIP, servidor localhost e superfície HTTP."""
from pathlib import Path
import hashlib
import json
import os
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent.parent
PACKAGE = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / 'Mapa-de-Riscos-Portatil-Offline-UIUX-0.9.0.zip'
assert PACKAGE.is_file(), PACKAGE
assert zipfile.is_zipfile(PACKAGE)
with tempfile.TemporaryDirectory(prefix='uiux084-') as folder:
    target = Path(folder)
    with zipfile.ZipFile(PACKAGE) as z:
        assert z.testzip() is None
        # Não permitir path traversal no ZIP.
        for path in z.namelist():
            assert not path.startswith('/') and '..' not in Path(path).parts
        z.extractall(target)
    hashes = (target / 'CHECKSUMS-SHA256.txt').read_text(encoding='utf-8').splitlines()
    for line in hashes:
        sha, rel = line.split('  ', 1)
        assert hashlib.sha256((target / rel).read_bytes()).hexdigest() == sha, rel
    manifest = json.loads((target / 'manifest.webmanifest').read_text(encoding='utf-8'))
    assert manifest['display'] == 'standalone'
    assert manifest['id'] == '/mapaderiscoslaboratorio/'
    assert (target / manifest['start_url']).is_dir()
    for icon in manifest['icons']:
        assert (target / icon['src']).is_file()
    # Escolhe porta efêmera só no ambiente QA, nunca na distribuição para o usuário.
    with socket.socket() as tmp:
        tmp.bind(('127.0.0.1', 0)); port = tmp.getsockname()[1]
    server = subprocess.Popen([sys.executable, str(target / 'portable/servidor.py'), '--no-browser', '--port', str(port)],
                              stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    base = f'http://127.0.0.1:{port}'
    app = base + '/mapaderiscoslaboratorio'
    try:
        for n in range(50):
            try:
                with urllib.request.urlopen(app + '/', timeout=2) as r:
                    assert r.status == 200
                    assert b'Mapa de Riscos' in r.read()
                    assert 'text/html' in r.headers['Content-Type']
                break
            except Exception:
                if server.poll() is not None:
                    raise RuntimeError('Servidor encerrou antes do teste')
                time.sleep(.1)
        else:
            raise RuntimeError('Servidor não iniciou')
        assets = [x.strip() for x in (target/'CHECKSUMS-SHA256.txt').read_text().splitlines() if x.strip()]
        served = []
        for row in assets:
            name = row.split('  ', 1)[1]
            if not (name.startswith(('js/', 'css/', 'assets/')) or name in ('manifest.webmanifest', 'sw.js', 'index.html')):
                continue
            with urllib.request.urlopen(app + '/' + name, timeout=5) as r:
                assert r.status == 200, name
                assert r.read() == (target/name).read_bytes(), name
                served.append(name)
        assert len(served) >= 25, len(served)
        for bad in ['/', '/index.html', '/sw.js', '/manifest.webmanifest',
                    '/portable/servidor.py','/LEIA-ME-OFFLINE.md',
                    '/mapaderiscoslaboratorio/../../etc/passwd',
                    '/mapaderiscoslaboratorio/assets/',
                    '/mapaderiscoslaboratorio/api/salvar',
                    '/mapaderiscoslaboratorio/project.json']:
            try:
                urllib.request.urlopen(base + bad, timeout=4)
                raise AssertionError('Recurso não deveria ser exposto: '+bad)
            except urllib.error.HTTPError as e:
                assert e.code in (403, 404), (bad, e.code)
        req = urllib.request.Request(app+'/js/mapa.js',method='HEAD')
        with urllib.request.urlopen(req,timeout=4) as r:
            assert r.status==200
            assert int(r.headers['Content-Length']) == (target/'js/mapa.js').stat().st_size
        print(f'PORTABLE_TEST_OK checksums={len(hashes)} served_assets={len(served)} safety_checks=10 local_port={port}')
    finally:
        server.terminate()
        try: server.communicate(timeout=6)
        except subprocess.TimeoutExpired: server.kill(); server.communicate()
