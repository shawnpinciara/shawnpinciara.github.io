#!/usr/bin/env bash
# Prepara il sito per il deploy su Cloudflare.
#
# Il sito e' gia' statico: non c'e' nessun passaggio di "compilazione".
# Questo script copia nel sito esattamente i file del checkout, escludendo
# la cartella .git e qualsiasi file non versionato.
#
# Produce la cartella dist/, che e' la radice del sito pubblicato
# (vedi wrangler.jsonc -> assets.directory).
set -euo pipefail

rm -rf dist
mkdir -p dist

# 1) Preferenza: esporta il commit esatto con git archive
# 2) Fallback: copia il checkout escludendo .git (se git non e' utilizzabile
#    nell'ambiente di build, es. per problemi di ownership)
if git archive HEAD > /tmp/site.tar 2>/dev/null; then
  tar -xf /tmp/site.tar -C dist
else
  rm -rf dist
  mkdir -p dist
  tar -cf - --exclude='./.git' --exclude='./dist' . | tar -x -C dist
fi

echo "dist pronto: $(find dist -type f | wc -l | tr -d ' ') file, $(du -sh dist | cut -f1)"
