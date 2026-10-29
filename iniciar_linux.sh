#!/bin/sh
cd "$(dirname "$0")" || exit 1
printf 'StudioWeb disponivel em http://localhost:8765\n'
python3 -m http.server 8765
