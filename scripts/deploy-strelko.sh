#!/usr/bin/env bash
# Deploy Strelko dist. Privzeto SAMO SPA (ne dotika embed grafov).
# Za strele2 embed:  bash deploy-strelko.sh --with-embed
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SYNC_EMBED=0
[[ "${1:-}" == "--with-embed" ]] && SYNC_EMBED=1

bash "$ROOT/scripts/deploy-strelko-spa.sh"

if [[ "$SYNC_EMBED" -eq 0 ]]; then
  exit 0
fi

OBCINE_CONTAINER="${OBCINE_CONTAINER:-strele2-obcine-public-1}"
if ! docker ps --format '{{.Names}}' | grep -qx "$OBCINE_CONTAINER"; then
  echo "Embed sync: $OBCINE_CONTAINER not running, skip" >&2
  exit 0
fi

STRELE2_PUBLIC="${STRELE2_PUBLIC:-$(dirname "$ROOT")/strele2/web/public}"
STRELE2_WEB="${STRELE2_WEB:-$(dirname "$ROOT")/strele2/web}"

_obcine_cp() {
  local src="$1" dest="$2"
  if [[ ! -s "$src" ]]; then
    echo "WARN: skip empty or missing $src" >&2
    return 1
  fi
  docker cp "$src" "$OBCINE_CONTAINER:$dest"
}

WIDGET_HTML="$STRELE2_PUBLIC/obcina-widget.html"
if [[ ! -s "$WIDGET_HTML" && -f "$STRELE2_PUBLIC/obcina-embed.html" ]]; then
  cp "$STRELE2_PUBLIC/obcina-embed.html" "$WIDGET_HTML"
  echo "Restored empty obcina-widget.html from obcina-embed.html"
fi

for f in "$STRELE2_PUBLIC/embed.html" "$STRELE2_PUBLIC/map-embed.html" "$STRELE2_PUBLIC/obcina-widget.html"; do
  [[ -f "$f" ]] && _obcine_cp "$f" "/app/web/public/$(basename "$f")" || true
done
# MapLibre slog (strelko-dark.json): kontejner ima bind-mount na strele2.
# NE uporabljaj docker cp za styles/ — neuspešen cp je že pustil 0-byte datoteko
# in s tem ugasnil zemljevidno podlogo na /statistika#zemljevid.
STYLE_DARK="$STRELE2_PUBLIC/styles/strelko-dark.json"
if [[ ! -s "$STYLE_DARK" ]]; then
  echo "ERROR: manjka ali je prazna $STYLE_DARK (potrebna za map-embed podlogo)" >&2
  exit 1
fi
# hitro preveri, da ni očitno pokvarjen JSON
if ! python3 -c "import json,sys; d=json.load(open(sys.argv[1])); assert d.get('sources')" "$STYLE_DARK"; then
  echo "ERROR: neveljaven MapLibre slog $STYLE_DARK" >&2
  exit 1
fi
echo "Map style OK: $STYLE_DARK ($(wc -c < "$STYLE_DARK") bytes)"
for f in "$STRELE2_WEB/charts-shared.css" "$STRELE2_WEB/brand.css"; do
  [[ -f "$f" ]] && _obcine_cp "$f" "/app/web/$(basename "$f")" || true
done
echo "Embed sync done on $OBCINE_CONTAINER"
