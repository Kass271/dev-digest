#!/usr/bin/env bash
# Convert <outDir>/raw.webm into <destDir>/demo.mp4 + demo.gif.
# Usage: to-media.sh <outDir> <destDir>   (outDir relative to the skill, destDir to the repo)
set -euo pipefail
SKILL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT="$(git -C "$SKILL" rev-parse --show-toplevel)"
case "$1" in /*) SRC="$1" ;; *) SRC="$SKILL/$1" ;; esac
case "$2" in /*) DEST="$2" ;; *) DEST="$ROOT/$2" ;; esac
mkdir -p "$DEST"
ffmpeg -y -loglevel error -i "$SRC/raw.webm" -c:v libx264 -pix_fmt yuv420p -crf 26 -movflags +faststart "$DEST/demo.mp4"
ffmpeg -y -loglevel error -i "$SRC/raw.webm" \
  -vf "fps=8,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer" \
  "$DEST/demo.gif"
ls -lh "$DEST"/demo.mp4 "$DEST"/demo.gif
