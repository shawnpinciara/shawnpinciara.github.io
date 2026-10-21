#!/usr/bin/env bash
# Prepara il sito per il deploy su Cloudflare.
#
# Il sito e' gia' statico: non c'e' nessun passaggio di build ("compilazione").
# Questo script copia nel sito esattamente i file versionati nel repo,
# escludendo tutto il resto (cartella .git, file di sistema macOS, ecc).
#
# Uso:
#   bash build.sh          -> genera la cartella dist/ (la radice del sito)
set -euo pipefail

rm -rf dist
mkdir -p dist
git archive HEAD | tar -x -C dist

echo "dist pronto: $(find dist -type f | wc -l | tr -d ' ') file, $(du -sh dist | cut -f1)"
