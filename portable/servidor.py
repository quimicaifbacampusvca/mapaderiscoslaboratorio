#!/usr/bin/env python3
"""Servidor de arquivos local do Mapa de Riscos, sem bibliotecas externas.

Executado apenas em 127.0.0.1; não fornece API para ler/escrever projetos.
O navegador mantém os projetos em seu próprio armazenamento por origem.
"""
from __future__ import annotations

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Timer
from urllib.parse import unquote, urlsplit
import webbrowser

ROOT = Path(__file__).resolve().parent.parent
ALLOWED_SUFFIXES = {'.html', '.css', '.js', '.json', '.webmanifest', '.svg', '.png'}
APP_PATH = '/mapaderiscoslaboratorio/'


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def app_relative(self):
        """Remove the PWA-specific URL prefix; reject unrelated paths."""
        path = unquote(urlsplit(self.path).path)
        if not path.startswith(APP_PATH) or '\\' in path or '\x00' in path:
            return None
        relative = path[len(APP_PATH):]
        segments = relative.split('/')
        if any(x in ('.', '..') or x.startswith('.') for x in segments if x):
            return None
        return '/' + relative

    def is_allowed(self):
        relative = self.app_relative()
        if relative is None:
            return False
        if relative in ('/', '/index.html'):
            return True
        if not relative.startswith(('/js/', '/css/', '/assets/')) and relative not in ('/sw.js', '/manifest.webmanifest'):
            return False
        candidate = (ROOT / relative.lstrip('/')).resolve()
        try:
            candidate.relative_to(ROOT)
        except ValueError:
            return False
        return candidate.suffix.lower() in ALLOWED_SUFFIXES and candidate.is_file()

    def translate_path(self, path):
        relative = self.app_relative()
        if relative is None:
            return str(ROOT / '__not_available__')
        return str(ROOT / (relative.lstrip('/') or 'index.html'))

    def do_GET(self):
        if not self.is_allowed():
            self.send_error(404, 'Arquivo não distribuído')
            return
        super().do_GET()

    def do_HEAD(self):
        if not self.is_allowed():
            self.send_error(404, 'Arquivo não distribuído')
            return
        super().do_HEAD()

    def list_directory(self, path):
        self.send_error(403, 'Listagem desativada')
        return None

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def guess_type(self, path):
        if str(path).endswith('.webmanifest'):
            return 'application/manifest+json'
        if str(path).endswith('.js'):
            return 'text/javascript; charset=utf-8'
        return super().guess_type(path)


def main():
    parser = argparse.ArgumentParser(description='Mapa de Riscos — distribuição portátil local')
    parser.add_argument('--port', type=int, default=8765, help='Padrão 8765; mesma origem dos projetos anteriores. Use porta diferente somente com backup JSON.')
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args()
    if not 0 <= args.port <= 65535:
        parser.error('Porta inválida')
    try:
        server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    except OSError as exc:
        raise SystemExit(f'Não foi possível abrir a porta {args.port}: {exc}. Feche outra cópia antes de tentar novamente.')
    port = server.server_address[1]
    url = f'http://127.0.0.1:{port}{APP_PATH}'
    print(f'\nMapa de Riscos — modo portátil\nAcesse: {url}\nServidor local; não compartilha projetos pela rede.\nPressione Ctrl+C para encerrar.\n', flush=True)
    if not args.no_browser:
        Timer(0.8, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever(poll_interval=0.2)
    except KeyboardInterrupt:
        print('\nServidor encerrado.', flush=True)
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
