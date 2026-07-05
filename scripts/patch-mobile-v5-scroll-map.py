#!/usr/bin/env python3
"""Chart scroll like homepage (pass-through), fixed map iframe height."""

from __future__ import annotations

import sys
from pathlib import Path

JS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist/assets/index-DijleoXU.js")
CSS_PATH = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("dist/assets/index-b2ecBo4-.css")

RESIZE_OLD = (
    'if(l){const d=parseFloat(l.style.height)||l.height,o=l.id==="archive-embed",'
    'w=l.id==="public-obcina-widget-iframe",k=l.id==="archive-map-iframe",'
    'I=o?i.data.height:Math.max(w?400:k?520:320,i.data.height);'
    'if(Math.abs(d-I)<2)return;l.style.height=`${I}px`;l.setAttribute("scrolling","no");'
    'l.style.overflow="hidden";'
    'if(k&&window.matchMedia("(max-width:899px)").matches&&l.contentWindow)'
    'l.contentWindow.postMessage({type:"strele-map-visible"},"*")}'
)

RESIZE_NEW = (
    'if(l){const d=parseFloat(l.style.height)||l.height,o=l.id==="archive-embed",'
    'w=l.id==="public-obcina-widget-iframe",k=l.id==="archive-map-iframe",'
    'mob=window.matchMedia("(max-width:899px)").matches,'
    'I=o?i.data.height:k?mob?480:560:w?Math.max(400,i.data.height):Math.max(320,i.data.height);'
    'if(Math.abs(d-I)<2)return;l.style.height=`${I}px`;l.setAttribute("scrolling","no");'
    'l.style.overflow="hidden"}'
)

# Remove postMessage strele-map-visible from resize if still present in alternate form
RESIZE_ALT = (
    'if(k&&window.matchMedia("(max-width:899px)").matches&&l.contentWindow)'
    'l.contentWindow.postMessage({type:"strele-map-visible"},"*")}'
)

CSS_MARKER = "/* —— chart scroll pass-through (like homepage preview) —— */"
CSS_APPEND = """
/* —— chart scroll pass-through (like homepage preview) —— */
#archive-embed-full{pointer-events:none;touch-action:pan-y}
.archive-charts-embed-wrap--full{touch-action:pan-y}
#archive-embed{pointer-events:auto}
"""

MARKER_IOS = "/* —— mobile ios fixes —— */"


def patch_js(js: str) -> str:
    if RESIZE_OLD in js:
        js = js.replace(RESIZE_OLD, RESIZE_NEW, 1)
    elif RESIZE_NEW.split("mob?480:560")[0] in js:
        print("JS resize already patched")
    else:
        raise SystemExit("embed resize handler not found")
    js = js.replace(RESIZE_ALT, "", 1)
    return js


def patch_css(css: str) -> str:
    if CSS_MARKER in css:
        print("CSS already patched")
        return css
    # Remove chart iframe internal scroll rules from v4 if present
    css = css.replace(
        ".archive-charts-embed{overflow:hidden!important;display:block;touch-action:pan-y}",
        ".archive-charts-embed{overflow:hidden!important;display:block}",
        1,
    )
    return css.rstrip() + CSS_APPEND


def main() -> None:
    js = patch_js(JS_PATH.read_text(encoding="utf-8"))
    css = patch_css(CSS_PATH.read_text(encoding="utf-8"))
    JS_PATH.write_text(js, encoding="utf-8")
    CSS_PATH.write_text(css, encoding="utf-8")
    print("Patched", JS_PATH, "and", CSS_PATH)


if __name__ == "__main__":
    main()
