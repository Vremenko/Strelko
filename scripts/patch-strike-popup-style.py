#!/usr/bin/env python3
"""Strike map popup: ob-tooltip vzor (kot map-embed občine)."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist/assets/index-DijleoXU.js"
CSS = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "dist/assets/index-b2ecBo4-.css"

MARKER = "/* —— strike map popup (ob-tooltip) —— */"

CD_PLAIN = (
    'function cD(t){return`<strong>Strela</strong><br>${IS(t.ts_utc)}<br>~${a0(t.distance_km)}`}'
)
CD_V1 = (
    'function cD(t){return`<div class="strele-strike-tooltip"><strong>Strela</strong><br>'
    "${IS(t.ts_utc)}<br>~${a0(t.distance_km)}</div>`}"
)
CD_BROKEN = (
    'function cD(t){return`<div class="strele-strike-tooltip"><strong>Strela</strong> '
    "~${a0(t.distance_km)}<br>${ca(t.ts_utc)}, ${IS(t.ts_utc)}</div>`}"
)
CD_FINAL = (
    'function cD(t){return`<div class="strele-strike-tooltip"><strong>Strela</strong> '
    "~${a0(t.distance_km)}<br>${IS(t.ts_utc)}</div>`}"
)

BIND_OLD = "d.bindPopup(cD(p))"
BIND_NEW = 'd.bindPopup(cD(p),{className:"strele-strike-popup-shell"})'

HOME_OLD = '.bindPopup("<strong>Vaša lokacija</strong>")'
HOME_NEW = (
    '.bindPopup(\'<div class="strele-strike-tooltip"><strong>Vaša lokacija</strong></div>\','
    '{className:"strele-strike-popup-shell"})'
)

CSS_SNIPPET = """
/* —— strike map popup (ob-tooltip) —— */
#strike-map .leaflet-popup.strele-strike-popup-shell .leaflet-popup-content-wrapper{
  background:transparent;border:none;box-shadow:none;padding:0}
#strike-map .leaflet-popup.strele-strike-popup-shell .leaflet-popup-content{margin:0;padding:0}
#strike-map .strele-strike-tooltip{
  background:#333333;color:var(--text);border:none;border-radius:8px;
  padding:.45rem .7rem;font-family:var(--font);font-size:.85rem;line-height:1.4;white-space:nowrap}
#strike-map .strele-strike-tooltip strong{color:var(--accent)}
#strike-map .leaflet-popup.strele-strike-popup-shell .leaflet-popup-tip{background:#333333;box-shadow:none}
#strike-map .leaflet-popup.strele-strike-popup-shell .leaflet-popup-close-button{
  color:var(--muted);font-size:18px;padding:4px 6px 0 0;width:auto;height:auto}
#strike-map .leaflet-popup.strele-strike-popup-shell .leaflet-popup-close-button:hover{color:var(--text)}
"""


def patch_css(css: str) -> str:
    if MARKER in css:
        head, _, after = css.partition(MARKER)
        next_block = after.find("\n/* ——")
        tail = after[next_block:] if next_block >= 0 else ""
        return head.rstrip() + CSS_SNIPPET + tail
    return css.rstrip() + CSS_SNIPPET


def main() -> None:
    js = JS.read_text(encoding="utf-8")

    if CD_FINAL in js:
        print("JS: cD already up to date")
    else:
        for old, label in (
            (CD_BROKEN, "double-date"),
            (CD_V1, "v1 layout"),
            (CD_PLAIN, "plain"),
        ):
            if old in js:
                js = js.replace(old, CD_FINAL, 1)
                print(f"JS: cD → two-line layout (from {label})")
                break
        else:
            raise SystemExit("cD pattern not found")

    if BIND_NEW in js:
        print("JS: strike bindPopup already patched")
    elif BIND_OLD in js:
        js = js.replace(BIND_OLD, BIND_NEW, 1)
        print("JS: strike bindPopup className")
    else:
        raise SystemExit("uw bindPopup pattern not found")

    if HOME_NEW in js:
        print("JS: home bindPopup already patched")
    elif HOME_OLD in js:
        js = js.replace(HOME_OLD, HOME_NEW, 1)
        print("JS: home bindPopup className")
    else:
        raise SystemExit("home bindPopup pattern not found")

    JS.write_text(js, encoding="utf-8")
    CSS.write_text(patch_css(CSS.read_text(encoding="utf-8")), encoding="utf-8")
    print("CSS: strike popup ob-tooltip styles")


if __name__ == "__main__":
    main()
