#!/usr/bin/env python3
"""Allow vertical page scroll when touching charts on mobile (Chart.js touch fix)."""

from __future__ import annotations

import sys
from pathlib import Path

JS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist/assets/index-DijleoXU.js")
CSS_PATH = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("dist/assets/index-b2ecBo4-.css")

L3_OLD = (
    "options:{responsive:!0,maintainAspectRatio:!1,layout:{padding:{top:h(4),right:h(o?4:8)}},"
    "plugins:{legend:{display:!1},tooltip:{intersect:!1,"
)
L3_NEW = (
    "options:{events:o?[]:void 0,responsive:!0,maintainAspectRatio:!1,layout:{padding:{top:h(4),right:h(o?4:8)}},"
    "plugins:{legend:{display:!1},tooltip:{enabled:!o,intersect:!1,"
)

SYNC_OLD = "const opt=Jm.options;opt.layout.padding={top:h(4),right:h(o?4:8)};"
SYNC_NEW = (
    "const opt=Jm.options;opt.events=o?[]:void 0;opt.plugins.tooltip.enabled=!o;"
    'Jm.canvas&&(Jm.canvas.style.pointerEvents=o?"none":"auto");'
    "opt.layout.padding={top:h(4),right:h(o?4:8)};"
)

WRAP_OLD = 'w&&(w.style.height=`${h(o?210:240)}px`),Jm=new ao(u,{'
WRAP_NEW = (
    'w&&(w.style.height=`${h(o?210:240)}px`,w.style.touchAction="pan-y"),'
    'u.style.touchAction="pan-y",u.style.pointerEvents=o?"none":"auto",Jm=new ao(u,{'
)

CSS_MARKER = "/* —— chart mobile scroll —— */"
CSS_APPEND = """
/* —— chart mobile scroll —— */
@media(max-width:639px){
.chart-wrap,.hourly-chart-wrap,.hourly-chart-wrap canvas,.chart-wrap canvas{touch-action:pan-y}
.hourly-chart-wrap canvas,.chart-wrap canvas{pointer-events:none}
}
"""


def patch_js(js: str) -> str:
    if L3_NEW.split("events:o?[]")[0] in js and "events:o?[]" in js:
        print("JS already patched")
    else:
        if L3_OLD not in js:
            raise SystemExit("L3 chart options block not found")
        js = js.replace(L3_OLD, L3_NEW, 1)
        if WRAP_OLD not in js:
            raise SystemExit("L3 wrap block not found")
        js = js.replace(WRAP_OLD, WRAP_NEW, 1)
        if SYNC_OLD not in js:
            raise SystemExit("strelkoSyncHourlyVisuals block not found")
        js = js.replace(SYNC_OLD, SYNC_NEW, 1)
        print("Patched L3 hourly chart")
    return js


def patch_css(css: str) -> str:
    if CSS_MARKER in css:
        print("CSS already patched")
        return css
    return css.rstrip() + CSS_APPEND


def main() -> None:
    js = JS_PATH.read_text(encoding="utf-8")
    css = CSS_PATH.read_text(encoding="utf-8")
    js = patch_js(js)
    css = patch_css(css)
    JS_PATH.write_text(js, encoding="utf-8")
    CSS_PATH.write_text(css, encoding="utf-8")
    print("Patched", JS_PATH, "and", CSS_PATH)


if __name__ == "__main__":
    main()
