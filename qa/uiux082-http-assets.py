"""Conferência de caminhos relativos da publicação em /mapaderiscoslaboratorio/."""
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from tempfile import TemporaryDirectory
from threading import Thread
from urllib.request import urlopen
import re, shutil, os
root=Path(__file__).resolve().parents[1]
with TemporaryDirectory() as tmp:
    path=Path(tmp)/'mapaderiscoslaboratorio'
    shutil.copytree(root,path,ignore=shutil.ignore_patterns('qa','tests','__pycache__'))
    class Static(SimpleHTTPRequestHandler):
        def __init__(self,*a,**kw):super().__init__(*a,directory=tmp,**kw)
        def log_message(self,*a):pass
    server=ThreadingHTTPServer(('127.0.0.1',0),Static)
    t=Thread(target=server.serve_forever,daemon=True);t.start()
    try:
        script=(root/'sw.js').read_text()
        items=re.findall(r"'((?:\./)[^']+)'",script.split('const SHELL_PATHS = [',1)[1].split('];',1)[0])
        assert len(items)>=26
        base=f'http://127.0.0.1:{server.server_port}/mapaderiscoslaboratorio/'
        for rel in items+['./sw.js']:
            with urlopen(base+rel[2:],timeout=5) as res:
                assert res.status == 200,rel
                assert res.read(),rel
        print(f'UIUX-0.8.2 — HTTP sob subpasta: {len(items)+1}/{len(items)+1} recursos OK')
    finally:
        server.shutdown();server.server_close()
