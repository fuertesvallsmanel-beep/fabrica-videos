#!/usr/bin/env bash
# Comprimeix un vídeo perquè càpiga a la branca «media» de GitHub (límit dur de 100 MB per fitxer)
# i a vidiq_video_upload (≤ 299 MB). Dues passades H.264 amb bitrate calculat per a ~90 MB.
# El render surt a CRF 20 (≈ 7 Mbps, ~380 MB per a 7 min): sense això la pujada falla.
# Ús: motor/comprimir.sh videos/NNN/video.mp4 [MB_objectiu=90]  → videos/NNN/video_web.mp4
set -euo pipefail
IN="$1"; MB="${2:-90}"
OUT="${IN%.mp4}_web.mp4"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
# kbps de vídeo = (MB·8·1024 / durada) − 192 kbps d'àudio, entre 900 i 6000
VK=$(python3 -c "print(max(900, min(6000, int($MB*8*1024/$DUR - 192))))")
LOG="$(mktemp -d)/pass"
ffmpeg -y -loglevel error -i "$IN" -map 0:v -c:v libx264 -preset medium -tune animation -b:v ${VK}k \
  -maxrate $((VK*2))k -bufsize $((VK*4))k -pix_fmt yuv420p -pass 1 -passlogfile "$LOG" -an -f null /dev/null
ffmpeg -y -loglevel error -i "$IN" -map 0:v -map 0:a -c:v libx264 -preset medium -tune animation -b:v ${VK}k \
  -maxrate $((VK*2))k -bufsize $((VK*4))k -pix_fmt yuv420p -pass 2 -passlogfile "$LOG" -c:a copy -movflags +faststart "$OUT"
echo "$OUT $(du -m "$OUT" | cut -f1) MB (vídeo ${VK} kbps)"
