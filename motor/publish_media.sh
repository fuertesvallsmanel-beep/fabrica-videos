#!/usr/bin/env bash
# Puja els fitxers multimèdia d'un lot a la branca òrfena "media" (sobreescrita cada vegada,
# perquè el repositori no creixi) i imprimeix les URL públiques que vidIQ pot importar.
# Ús: motor/publish_media.sh fitxer1.mp4 fitxer2.jpg ...
set -euo pipefail
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OWNER_REPO="fuertesvallsmanel-beep/fabrica-videos"
FILES=(); for f in "$@"; do FILES+=("$(realpath "$f")"); done
TMP="$(mktemp -d)"
cd "$TMP"
git init -q -b media
for f in "${FILES[@]}"; do cp "$f" .; done
git add -A
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -qm "media $(date -u +%Y-%m-%dT%H:%MZ)"
git remote add origin "$(git -C "$REPO_DIR" remote get-url origin)"
git push -q -f origin media
for f in "${FILES[@]}"; do echo "https://raw.githubusercontent.com/${OWNER_REPO}/media/$(basename "$f")"; done
rm -rf "$TMP"
