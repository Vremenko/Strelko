#!/usr/bin/env bash
# Deploy Strelko SPA (dist/) v tekoči nginx container.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTAINER="${STRELKO_CONTAINER:-stormapi-strelko-1}"
VERSION="${STRELKO_CACHE_VERSION:-$(date +%Y%m%d%H%M)}"
HTML="$ROOT/dist/index.html"
ASSETS="$ROOT/dist/assets"

# Bind-mount nginx conf (StormAPI): če manjka/je mapa, docker cp na vsebnik pade.
NGINX_CONF="${STRELKO_NGINX_CONF:-$(dirname "$ROOT")/StormAPI/docker/strelko-nginx.conf}"
if [ ! -f "$NGINX_CONF" ]; then
  echo "Napaka: $NGINX_CONF ne obstaja ali ni običajna datoteka." >&2
  echo "Deploy je prekinjen, da Docker na manjkajoči poti ne ustvari praznega direktorija." >&2
  exit 1
fi
if [ ! -s "$NGINX_CONF" ]; then
  echo "Napaka: $NGINX_CONF je prazna datoteka." >&2
  exit 1
fi

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

echo "Cache bust ?v=$VERSION v dist/index.html"

# Enak cache-bust na prerenderanih podstraneh
while IFS= read -r -d '' prerendered; do
  python3 - "$prerendered" "$VERSION" <<'PY'
import re, sys
path, ver = sys.argv[1], sys.argv[2]
text = open(path, encoding="utf-8").read()
text = re.sub(r'(\/assets/index-[^"?]+\.(?:js|css))\?v=[^"]*', r'\1', text)
text = re.sub(r'(\/assets/index-[^"?]+\.(?:js|css))(?=")', rf'\1?v={ver}', text)
open(path, "w", encoding="utf-8").write(text)
PY
done < <(find "$ROOT/dist" -mindepth 2 -name index.html -not -path '*/widget/*' -print0)

docker cp "$ASSETS/." "$CONTAINER:/usr/share/nginx/html/assets/"
docker cp "$HTML" "$CONTAINER:/usr/share/nginx/html/index.html"

# Prerenderane podstrani (npr. cenik/index.html) za SEO / crawlerje
while IFS= read -r -d '' prerendered; do
  rel="${prerendered#$ROOT/dist/}"
  dir=$(dirname "$rel")
  docker exec "$CONTAINER" mkdir -p "/usr/share/nginx/html/$dir"
  docker cp "$prerendered" "$CONTAINER:/usr/share/nginx/html/$rel"
done < <(find "$ROOT/dist" -mindepth 2 -name index.html -not -path '*/widget/*' -print0)
if [[ -f "$ROOT/dist/robots.txt" ]]; then
  docker cp "$ROOT/dist/robots.txt" "$CONTAINER:/usr/share/nginx/html/robots.txt"
fi
if [[ -f "$ROOT/dist/sitemap.xml" ]]; then
  docker cp "$ROOT/dist/sitemap.xml" "$CONTAINER:/usr/share/nginx/html/sitemap.xml"
fi
if [[ -f "$ROOT/dist/favicon.png" ]]; then
  docker cp "$ROOT/dist/favicon.png" "$CONTAINER:/usr/share/nginx/html/favicon.png"
fi
if [[ -f "$ROOT/dist/favicon.svg" ]]; then
  docker cp "$ROOT/dist/favicon.svg" "$CONTAINER:/usr/share/nginx/html/favicon.svg"
fi
if [[ -f "$ROOT/dist/og-image.png" ]]; then
  docker cp "$ROOT/dist/og-image.png" "$CONTAINER:/usr/share/nginx/html/og-image.png"
fi
if [[ -d "$ROOT/dist/og" ]]; then
  docker exec "$CONTAINER" mkdir -p /usr/share/nginx/html/og
  docker cp "$ROOT/dist/og/." "$CONTAINER:/usr/share/nginx/html/og/"
fi
if [[ -d "$ROOT/dist/pwa" ]]; then
  docker exec "$CONTAINER" mkdir -p /usr/share/nginx/html/pwa
  docker cp "$ROOT/dist/pwa/." "$CONTAINER:/usr/share/nginx/html/pwa/"
fi
if [[ -f "$ROOT/dist/site.webmanifest" ]]; then
  docker cp "$ROOT/dist/site.webmanifest" "$CONTAINER:/usr/share/nginx/html/site.webmanifest"
fi
if [[ -d "$ROOT/dist/widget" ]]; then
  docker cp "$ROOT/dist/widget/." "$CONTAINER:/usr/share/nginx/html/widget/"
fi

echo "Deployed SPA to $CONTAINER"
