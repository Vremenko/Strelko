#!/usr/bin/env python3
"""Fix mobile scroll jank, iOS menu, map iframe — production bundle patches."""

from __future__ import annotations

import re
import sys
from pathlib import Path

JS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist/assets/index-DijleoXU.js")
CSS_PATH = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("dist/assets/index-b2ecBo4-.css")

# Remove debug instrumentation (causes jank on every render)
DEBUG_PATTERNS = [
    re.compile(r"/\* #region agent log \*/fetch\([^;]+;\)/\* #endregion \*/", re.DOTALL),
    re.compile(
        r'/\* #region agent log \*/fetch\(\'http://localhost:7377/ingest/[^\)]+\)\.catch\(\(\)=>\{\}\);/\* #endregion \*/'
    ),
]

WHEEL_OLD = 'if(((p=i.data)==null?void 0:p.type)==="strele-embed-wheel"){const l=[document.getElementById("archive-embed"),document.getElementById("archive-embed-full")].find(d=>d&&d.contentWindow===i.source);l&&window.scrollBy({top:i.data.deltaY||0,left:i.data.deltaX||0,behavior:"auto"});return}'
WHEEL_NEW = 'if(((p=i.data)==null?void 0:p.type)==="strele-embed-wheel"){if(window.matchMedia("(max-width:899px)").matches)return;const l=[document.getElementById("archive-embed"),document.getElementById("archive-embed-full")].find(d=>d&&d.contentWindow===i.source);l&&window.scrollBy({top:i.data.deltaY||0,left:i.data.deltaX||0,behavior:"auto"});return}'

RESIZE_NEW = (
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

U2_OLD = (
    'o.loading="lazy",o.setAttribute("scrolling","no"),o.style.overflow="hidden",'
    '(w=i.querySelector(".archive-charts-placeholder"))==null||w.remove(),i.appendChild(o)};'
    'if(!("IntersectionObserver"in window)){p();return}const d=new IntersectionObserver'
)

U2_NEW = (
    'o.loading=window.matchMedia("(max-width:899px)").matches?"eager":"lazy",'
    'window.matchMedia("(max-width:899px)").matches?(o.setAttribute("scrolling","yes"),o.style.overflow="auto",o.style.webkitOverflowScrolling="touch"):(o.setAttribute("scrolling","no"),o.style.overflow="hidden"),'
    '(w=i.querySelector(".archive-charts-placeholder"))==null||w.remove(),i.appendChild(o)};'
    'if(window.matchMedia("(max-width:899px)").matches||!("IntersectionObserver"in window)){p();return}const d=new IntersectionObserver'
)

AB_OLD = (
    'p.loading="lazy",p.setAttribute("scrolling","no"),p.style.overflow="hidden",'
    '(d=i.querySelector(".archive-charts-placeholder"))==null||d.remove(),i.appendChild(p)};'
    'if(!("IntersectionObserver"in window)){l();return}const u=new IntersectionObserver'
)

AB_NEW = (
    'p.loading="eager",p.setAttribute("scrolling","no"),p.style.overflow="hidden",'
    'p.height=window.matchMedia("(max-width:899px)").matches?"480":"560",'
    'p.onload=function(){p.contentWindow&&p.contentWindow.postMessage({type:"strele-map-visible"},"*")},'
    '(d=i.querySelector(".archive-charts-placeholder"))==null||d.remove(),i.appendChild(p)};'
    'if(window.matchMedia("(max-width:899px)").matches||!("IntersectionObserver"in window)){l();return}const u=new IntersectionObserver'
)

RESIZE_OLD = "if(l){const d=parseFloat(l.style.height)||l.height,o=l.id===\"archive-embed\",w=l.id===\"public-obcina-widget-iframe\",k=l.id===\"archive-map-iframe\",I=o?i.data.height:Math.max(w?400:k?520:320,i.data.height);if(Math.abs(d-I)<2)return;l.style.height=`${I}px`}"

CSS_MARKER = "/* —— mobile ios fixes —— */"
CSS_APPEND = """
/* —— mobile ios fixes —— */
@media(max-width:899px){
body.site-nav-open{overflow:hidden;position:fixed;width:100%;height:100%;touch-action:none}
.site-nav-drawer{z-index:200}
.site-nav-drawer__panel{max-height:min(88dvh,100%);-webkit-overflow-scrolling:touch}
.site-header__bar{position:relative;z-index:10}
.archive-charts-embed,.archive-map-iframe{overflow:auto!important;-webkit-overflow-scrolling:touch}
.archive-map-wrap{min-height:480px}
}
"""


def strip_debug(js: str) -> str:
    for pat in DEBUG_PATTERNS:
        js = pat.sub("", js)
    return js


def patch_js(js: str) -> str:
    js = strip_debug(js)
    if WHEEL_OLD in js:
        js = js.replace(WHEEL_OLD, WHEEL_NEW, 1)
    if RESIZE_OLD not in js:
        raise SystemExit("embed resize handler not found")
    js = js.replace(RESIZE_OLD, RESIZE_NEW, 1)
    if U2_OLD not in js:
        raise SystemExit("U2 iframe block not found")
    js = js.replace(U2_OLD, U2_NEW, 1)
    if AB_OLD not in js:
        raise SystemExit("aB iframe block not found")
    js = js.replace(AB_OLD, AB_NEW, 1)
    return js


def patch_css(css: str) -> str:
    if CSS_MARKER in css:
        return css
    return css.rstrip() + CSS_APPEND


def main() -> None:
    js = patch_js(JS_PATH.read_text(encoding="utf-8"))
    css = patch_css(CSS_PATH.read_text(encoding="utf-8"))
    JS_PATH.write_text(js, encoding="utf-8")
    CSS_PATH.write_text(css, encoding="utf-8")
    print("Patched", JS_PATH, "and", CSS_PATH)


if __name__ == "__main__":
    main()
