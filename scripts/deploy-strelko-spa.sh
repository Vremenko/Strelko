#!/usr/bin/env bash
# Deploy samo Strelko SPA (dist/) — NE dotika strele2 embed datotek za grafe.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTAINER="${STRELKO_CONTAINER:-stormapi-strelko-1}"
VERSION="${STRELKO_CACHE_VERSION:-$(date +%Y%m%d%H%M)}"
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

echo "Deployed SPA only to $CONTAINER (brez embed sync)"
