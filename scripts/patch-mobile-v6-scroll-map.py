#!/usr/bin/env python3
"""Unified chart scroll pass-through, dynamic map iframe height."""

from __future__ import annotations

import sys
from pathlib import Path

JS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist/assets/index-DijleoXU.js")
CSS_PATH = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("dist/assets/index-b2ecBo4-.css")

# v5 fixed map height
RESIZE_V5 = (
    'if(l){const d=parseFloat(l.style.height)||l.height,o=l.id==="archive-embed",'
    'w=l.id==="public-obcina-widget-iframe",k=l.id==="archive-map-iframe",'
    'mob=window.matchMedia("(max-width:899px)").matches,'
    'I=o?i.data.height:k?mob?480:560:w?Math.max(400,i.data.height):Math.max(320,i.data.height);'
    'if(Math.abs(d-I)<2)return;l.style.height=`${I}px`;l.setAttribute("scrolling","no");'
    'l.style.overflow="hidden"}'
)

# original unpatched
RESIZE_ORIG = (
    'if(l){const d=parseFloat(l.style.height)||l.height,o=l.id==="archive-embed",'
    'w=l.id==="public-obcina-widget-iframe",k=l.id==="archive-map-iframe",'
    'I=o?i.data.height:Math.max(w?400:k?520:320,i.data.height);'
    'if(Math.abs(d-I)<2)return;l.style.height=`${I}px`;l.setAttribute("scrolling","no");'
    'l.style.overflow="hidden";'
    'if(k&&window.matchMedia("(max-width:899px)").matches&&l.contentWindow)'
    'l.contentWindow.postMessage({type:"strele-map-visible"},"*")}'
)

RESIZE_V6 = (
    'if(l){const d=parseFloat(l.style.height)||l.height,o=l.id==="archive-embed",'
    'w=l.id==="public-obcina-widget-iframe",k=l.id==="archive-map-iframe",'
    'I=o?i.data.height:k?i.data.height:w?Math.max(400,i.data.height):Math.max(320,i.data.height);'
    'if(Math.abs(d-I)<2)return;l.style.height=`${I}px`;l.setAttribute("scrolling","no");'
    'l.style.overflow="hidden"}'
)

CSS_OLD_V5 = """/* —— chart scroll pass-through (like homepage preview) —— */
#archive-embed-full{pointer-events:none;touch-action:pan-y}
.archive-charts-embed-wrap--full{touch-action:pan-y}
#archive-embed{pointer-events:auto}
"""

CSS_V6 = """/* —— chart scroll pass-through (all embeds) —— */
#archive-embed-full,#archive-embed{pointer-events:none;touch-action:pan-y}
.archive-charts-embed-wrap,.archive-charts-embed-wrap--full{touch-action:pan-y}
.archive-map-wrap{min-height:0!important}
.archive-map-iframe{min-height:0!important;height:auto}
"""


def patch_js(js: str) -> str:
    if RESIZE_V5 in js:
        js = js.replace(RESIZE_V5, RESIZE_V6, 1)
    elif RESIZE_ORIG in js:
        js = js.replace(RESIZE_ORIG, RESIZE_V6, 1)
    elif RESIZE_V6.split("k?i.data.height")[0] in js:
        print("JS resize already v6")
    else:
        raise SystemExit("embed resize handler not found")
    return js


def patch_css(css: str) -> str:
    if "/* —— chart scroll pass-through (all embeds) —— */" in css:
        print("CSS already v6")
        return css
    if CSS_OLD_V5.strip() in css:
        css = css.replace(CSS_OLD_V5.strip(), CSS_V6.strip(), 1)
    else:
        css = css.replace(
            ".archive-map-wrap{min-height:480px}",
            ".archive-map-wrap{min-height:0!important}",
            1,
        )
        css = css.rstrip() + "\n" + CSS_V6
    # strip legacy conflicting min-heights
    css = css.replace(".archive-map-iframe{display:block;width:100%;border:none;min-height:760px}", "")
    css = css.replace(".archive-map-wrap{border-radius:12px;background:#1a1a1a;overflow:hidden;min-height:540px}", "")
    css = css.replace(".archive-map-wrap{min-height:440px}", "")
    css = css.replace(".archive-map-iframe{min-height:580px}", "")
    return css


def main() -> None:
    js = patch_js(JS_PATH.read_text(encoding="utf-8"))
    css = patch_css(CSS_PATH.read_text(encoding="utf-8"))
    JS_PATH.write_text(js, encoding="utf-8")
    CSS_PATH.write_text(css, encoding="utf-8")
    print("Patched", JS_PATH, "and", CSS_PATH)


if __name__ == "__main__":
    main()
