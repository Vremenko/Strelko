#!/usr/bin/env python3
"""Single page scroll: full-height chart iframe, no nested iframe scroll."""

from __future__ import annotations

import sys
from pathlib import Path

JS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist/assets/index-DijleoXU.js")
CSS_PATH = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("dist/assets/index-b2ecBo4-.css")

RESIZE_OLD = (
    'if(l){const d=parseFloat(l.style.height)||l.height,o=l.id==="archive-embed",'
    'w=l.id==="public-obcina-widget-iframe",k=l.id==="archive-map-iframe",'
    'chart=l.id==="archive-embed-full"||l.id==="archive-embed",'
    'mob=window.matchMedia("(max-width:899px)").matches,'
    'I=o?i.data.height:Math.max(w?400:k?520:320,i.data.height);'
    'if(mob&&chart){const cap=Math.round(window.innerHeight*0.82);I=Math.min(I,cap);'
    'l.setAttribute("scrolling","yes");l.style.overflow="auto";l.style.webkitOverflowScrolling="touch"}'
    'if(Math.abs(d-I)<2)return;l.style.height=`${I}px`;'
    'if(k&&mob&&l.contentWindow)l.contentWindow.postMessage({type:"strele-map-visible"},"*")}'
)

RESIZE_NEW = (
    'if(l){const d=parseFloat(l.style.height)||l.height,o=l.id==="archive-embed",'
    'w=l.id==="public-obcina-widget-iframe",k=l.id==="archive-map-iframe",'
    'I=o?i.data.height:Math.max(w?400:k?520:320,i.data.height);'
    'if(Math.abs(d-I)<2)return;l.style.height=`${I}px`;'
    'l.setAttribute("scrolling","no");l.style.overflow="hidden";'
    'if(k&&window.matchMedia("(max-width:899px)").matches&&l.contentWindow)'
    'l.contentWindow.postMessage({type:"strele-map-visible"},"*")}'
)

U2_OLD = (
    'o.loading=window.matchMedia("(max-width:899px)").matches?"eager":"lazy",'
    'window.matchMedia("(max-width:899px)").matches?(o.setAttribute("scrolling","yes"),o.style.overflow="auto",o.style.webkitOverflowScrolling="touch"):(o.setAttribute("scrolling","no"),o.style.overflow="hidden"),'
)

U2_NEW = (
    'o.loading=window.matchMedia("(max-width:899px)").matches?"eager":"lazy",'
    'o.setAttribute("scrolling","no"),o.style.overflow="hidden",'
)

CSS_OLD = ".archive-charts-embed,.archive-map-iframe{overflow:auto!important;-webkit-overflow-scrolling:touch}"
CSS_NEW = ".archive-charts-embed{overflow:hidden!important;display:block;touch-action:pan-y}.archive-map-iframe{overflow:hidden!important;display:block}"

MARKER = "/* —— single scroll charts —— */"
CSS_APPEND = """
/* —— single scroll charts —— */
@media(max-width:899px){
.archive-charts-embed-wrap--full,.archive-charts-embed-wrap{overflow:visible}
}
"""


def patch_js(js: str) -> str:
    if RESIZE_OLD not in js:
        raise SystemExit("resize handler (v3) not found")
    js = js.replace(RESIZE_OLD, RESIZE_NEW, 1)
    if U2_OLD not in js:
        raise SystemExit("U2 iframe block not found")
    js = js.replace(U2_OLD, U2_NEW, 1)
    return js


def patch_css(css: str) -> str:
    if CSS_OLD in css:
        css = css.replace(CSS_OLD, CSS_NEW, 1)
    if MARKER not in css:
        css = css.rstrip() + CSS_APPEND
    return css


def main() -> None:
    js = patch_js(JS_PATH.read_text(encoding="utf-8"))
    css = patch_css(CSS_PATH.read_text(encoding="utf-8"))
    JS_PATH.write_text(js, encoding="utf-8")
    CSS_PATH.write_text(css, encoding="utf-8")
    print("Patched", JS_PATH, "and", CSS_PATH)


if __name__ == "__main__":
    main()
