#!/bin/sh
set -eu
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if command -v python3 >/dev/null 2>&1; then
  exec python3 "$DIR/servidor.py"
elif command -v python >/dev/null 2>&1; then
  exec python "$DIR/servidor.py"
else
  echo "Python 3 não encontrado. Para Linux/macOS, o servidor portátil requer Python 3 instalado." >&2
  exit 1
fi
