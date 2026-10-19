#!/usr/bin/env python3
"""Gera ZIP portátil autocontido usando SOMENTE ativos do app shell.

Usage: python3 tools/montar-portatil.py [output.zip]
Não copia projetos JSON de usuário nem scripts de backend legado.
"""
from pathlib import Path
import hashlib
import re
import sys
import zipfile

ROOT = Path(__file__).resolve().parent.parent
DEST = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / 'Mapa-de-Riscos-Portatil-Offline-UIUX-0.9.0.zip'
SW = (ROOT / 'sw.js').read_text(encoding='utf-8')
match = re.search(r'const SHELL_PATHS\s*=\s*\[([^\]]+)\]', SW, flags=re.S)
if not match:
    raise SystemExit('Não foi possível identificar SHELL_PATHS em sw.js')
assets = set()
for path in re.findall(r"['\"](\./[^'\"]*)['\"]", match.group(1)):
    assets.add('index.html' if path == './' else path.removeprefix('./'))
assets.update({
    'sw.js', 'index.html', 'manifest.webmanifest', 'LEIA-ME-OFFLINE.md',
    'portable/iniciar.cmd', 'portable/iniciar.sh',
    'portable/servidor.py', 'portable/servidor-windows.ps1'
})
files = sorted(assets)
missing = [p for p in files if not (ROOT / p).is_file()]
if missing:
    raise SystemExit(f'Arquivos obrigatórios ausentes: {missing}')
contents = {p: (ROOT / p).read_bytes() for p in files}
checksums = '\n'.join(f'{hashlib.sha256(contents[p]).hexdigest()}  {p}' for p in files) + '\n'
contents['CHECKSUMS-SHA256.txt'] = checksums.encode('utf-8')
DEST.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(DEST, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for name, content in sorted(contents.items()):
        info = zipfile.ZipInfo(name, date_time=(2026, 10, 18, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        if name.endswith('.sh') or name.endswith('.py'):
            info.external_attr = (0o100755 << 16)
        z.writestr(info, content)
with zipfile.ZipFile(DEST) as z:
    assert z.testzip() is None
    assert set(z.namelist()) == set(contents)
print(f'PORTABLE_OK {DEST} files={len(contents)} bytes={DEST.stat().st_size}')
