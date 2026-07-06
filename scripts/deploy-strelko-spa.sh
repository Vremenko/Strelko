#!/usr/bin/env bash
# Deploy Strelko SPA (dist/) v tekoči nginx container.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTAINER="${STRELKO_CONTAINER:-stormapi-strelko-1}"
VERSION="${STRELKO_CACHE_VERSION:-$(date +%Y%m%d%H%M)}"
HTML="$ROOT/dist/index.html"
ASSETS="$ROOT/dist/assets"

if [[ ! -f "$HTML" ]]; then
  echo "Missing $HTML — run: npm run build" >&2
  exit 1
fi

if [[ ! -d "$ASSETS" ]]; then
  echo "Missing $ASSETS" >&2
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

docker cp "$ASSETS/." "$CONTAINER:/usr/share/nginx/html/assets/"
docker cp "$HTML" "$CONTAINER:/usr/share/nginx/html/index.html"
if [[ -f "$ROOT/dist/favicon.svg" ]]; then
  docker cp "$ROOT/dist/favicon.svg" "$CONTAINER:/usr/share/nginx/html/favicon.svg"
fi
if [[ -d "$ROOT/dist/widget" ]]; then
  docker cp "$ROOT/dist/widget/." "$CONTAINER:/usr/share/nginx/html/widget/"
fi

echo "Deployed SPA to $CONTAINER"
