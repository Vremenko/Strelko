#!/usr/bin/env bash
# Deploy patched dist + bust browser cache (same hashed filenames, nginx no-cache for /assets/).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTAINER="${STRELKO_CONTAINER:-stormapi-strelko-1}"
OBCINE_CONTAINER="${OBCINE_CONTAINER:-strele2-obcine-public-1}"
VERSION="$(date +%Y%m%d%H%M)"
HTML="$ROOT/dist/index.html"

if [[ ! -f "$HTML" ]]; then
  echo "Missing $HTML" >&2
  exit 1
fi

python3 - "$HTML" "$VERSION" <<'PY'
import re, sys
path, ver = sys.argv[1], sys.argv[2]
text = open(path, encoding="utf-8").read()
text = re.sub(r'(\/assets/index-[^"?]+\.(?:js|css))\?v=[^"]*', r'\1', text)
text = re.sub(r'(\/assets/index-[^"?]+\.(?:js|css))(?=")', rf'\1?v={ver}', text)
open(path, "w", encoding="utf-8").write(text)
PY

echo "Cache bust ?v=$VERSION in dist/index.html"

docker cp "$ROOT/dist/assets/index-DijleoXU.js" "$CONTAINER:/usr/share/nginx/html/assets/"
docker cp "$ROOT/dist/assets/index-b2ecBo4-.css" "$CONTAINER:/usr/share/nginx/html/assets/"
docker cp "$HTML" "$CONTAINER:/usr/share/nginx/html/index.html"

if docker ps --format '{{.Names}}' | grep -qx "$OBCINE_CONTAINER"; then
  STRELE2_PUBLIC="${STRELE2_PUBLIC:-$(dirname "$ROOT")/strele2/web/public}"
  for f in "$STRELE2_PUBLIC/embed.html" "$STRELE2_PUBLIC/map-embed.html" "$STRELE2_PUBLIC/obcina-widget.html"; do
    if [[ -f "$f" ]]; then
      docker cp "$f" "$OBCINE_CONTAINER:/app/web/public/$(basename "$f")"
    fi
  done
  STRELE2_WEB="${STRELE2_WEB:-$(dirname "$ROOT")/strele2/web}"
  for f in "$STRELE2_WEB/charts-shared.css" "$STRELE2_WEB/brand.css"; do
    if [[ -f "$f" ]]; then
      docker cp "$f" "$OBCINE_CONTAINER:/app/web/$(basename "$f")"
    fi
  done
  echo "Updated embed files on $OBCINE_CONTAINER (from $STRELE2_PUBLIC)"
fi

echo "Deployed to $CONTAINER (reload nginx if you changed strelko-nginx.conf)"
