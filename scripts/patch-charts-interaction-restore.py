#!/usr/bin/env python3
"""Restore chart iframe interaction (tooltips, days picker) on current dist bundle."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist/assets/index-DijleoXU.js"
CSS = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "dist/assets/index-b2ecBo4-.css"

MARKER = "/* —— chart interaction restore —— */"

CHART_HELPERS = r"""function streleEmbedAtPoint(t,e){for(var i of["archive-embed-full","archive-embed"]){var l=document.getElementById(i);if(!l)continue;var u=l.getBoundingClientRect();if(t>=u.left&&t<=u.right&&e>=u.top&&e<=u.bottom)return l}return null}function streleDaysOverlayHit(t,e){var i=document.getElementById("stat-days-overlay")||document.getElementById("stat-days-hit");if(!i||i.hidden)return!1;var l=i.getBoundingClientRect();return t>=l.left&&t<=l.right&&e>=l.top&&e<=l.bottom}function streleForwardChartTap(t,e,i){if(!t||!t.contentWindow)return;t.contentWindow.postMessage({type:"strele-embed-chart-tap",clientX:e,clientY:i},"*")}function streleInitEmbedTap(){if(window.__streleEmbedTap)return;window.__streleEmbedTap=1;function hAt(f,x,y){f&&f.contentWindow&&f.contentWindow.postMessage({type:"strele-embed-chart-hover",clientX:x,clientY:y},"*")}function hLeave(f){f&&f.contentWindow&&f.contentWindow.postMessage({type:"strele-embed-chart-leave"},"*")}function hSched(f,x,y){hf=f,hx=x,hy=y,hraf||(hraf=requestAnimationFrame(function(){hraf=0,hAt(hf,hx,hy)}))}function skipChartUi(n){return n&&(n.closest(".stat-days-overlay")||n.closest("#stat-days-hit"))}var tf=null,tx=0,ty=0,st=0,hf=null,hraf=0,hx=0,hy=0;document.addEventListener("touchstart",function(u){if(u.touches.length!==1)return;var x=u.touches[0].clientX,y=u.touches[0].clientY;if(skipChartUi(u.target)||streleDaysOverlayHit(x,y))return;var f=streleEmbedAtPoint(x,y);if(!f)return;tf=f,tx=x,ty=y,hSched(f,x,y)},{passive:!0});document.addEventListener("touchmove",function(u){if(!tf||u.touches.length!==1)return;var x=u.touches[0].clientX,y=u.touches[0].clientY;var f=streleEmbedAtPoint(x,y);if(!f||f!==tf){hLeave(tf);tf=null;return}hSched(tf,x,y)},{passive:!0});document.addEventListener("touchend",function(u){if(!tf)return;var f=tf,x=u.changedTouches[0].clientX,y=u.changedTouches[0].clientY;hLeave(f);var mv=Math.hypot(x-tx,y-ty);if(mv<=18){var r=f.getBoundingClientRect();if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom&&!streleDaysOverlayHit(x,y)&&!skipChartUi(u.target)){streleForwardChartTap(f,x,y),st=Date.now()}}tf=null},{passive:!0});document.addEventListener("click",function(u){if(Date.now()-st<500||skipChartUi(u.target))return;if(streleDaysOverlayHit(u.clientX,u.clientY))return;var f=streleEmbedAtPoint(u.clientX,u.clientY);f&&streleForwardChartTap(f,u.clientX,u.clientY)});document.addEventListener("mousemove",function(u){if(skipChartUi(u.target)||streleDaysOverlayHit(u.clientX,u.clientY)){if(hf){hLeave(hf);hf=null}return}var f=streleEmbedAtPoint(u.clientX,u.clientY);if(!f){if(hf){hLeave(hf);hf=null}return}hSched(f,u.clientX,u.clientY)},{passive:!0})}function streleInitDaysOverlay(){if(window.__streleDaysOverlay)return;window.__streleDaysOverlay=1;var t=null,e=null,i=null,I=null;function m(){return window.matchMedia("(max-width:899px)").matches}function a(l){var w=l.parentElement;if(!w)return null;w.classList.add("archive-charts-embed-wrap--overlay-host");if(m()){t=w.querySelector("#stat-days-overlay");if(!t){t=document.createElement("div");t.id="stat-days-overlay",t.className="stat-days-overlay",t.hidden=!0,t.innerHTML='<select id="stat-days-overlay-select" aria-label="Obdobje"><option value="7">7 dni</option><option value="14">14 dni</option><option value="30">30 dni</option><option value="90">90 dni</option></select>',w.insertBefore(t,l)}e=t.querySelector("select");var h=w.querySelector("#stat-days-hit");h&&(h.hidden=!0)}else{t=w.querySelector("#stat-days-hit");if(!t){t=document.createElement("button");t.type="button",t.id="stat-days-hit",t.className="stat-days-hit",t.hidden=!0,t.setAttribute("aria-label","Obdobje"),w.insertBefore(t,l)}e=null;var o=w.querySelector("#stat-days-overlay");o&&(o.hidden=!0)}return t}function o(){if(!t||t.hidden)return;t.style.top=rt+"px",t.style.left=rl+"px",t.style.width=rw+"px",t.style.height=rh+"px"}var rt=0,rl=0,rw=0,rh=0;function u(){i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-request-days-rect"},"*")}document.addEventListener("change",function(p){var d=p.target;if(!d||d.id!=="stat-days-overlay-select")return;i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-set-days",days:Number(d.value)},"*")},!0);document.addEventListener("click",function(p){if(m())return;var d=p.target;if(!d||d.id!=="stat-days-hit")return;p.preventDefault(),p.stopPropagation(),i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-open-days"},"*")},!0);document.addEventListener("touchend",function(p){if(m())return;var d=p.target;if(!d||d.id!=="stat-days-hit")return;p.preventDefault(),i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-open-days"},"*")},!0);window.addEventListener("message",function(p){var R=p.data;if(!R||typeof R!=="object")return;if(R.type==="strele-embed-resize"){var F=[document.getElementById("archive-embed"),document.getElementById("archive-embed-full")].find(function(V){return V&&V.contentWindow===p.source});if(F){i=F,a(F);clearTimeout(I),I=setTimeout(u,60)}return}if(R.type!=="strele-embed-days-rect")return;var l=[document.getElementById("archive-embed"),document.getElementById("archive-embed-full")].find(function(V){return V&&V.contentWindow===p.source});if(!l){t&&(t.hidden=!0);return}i=l;if(!a(l)){t&&(t.hidden=!0);return}rt=+R.top||0,rl=+R.left||0,rw=+R.width||0,rh=+R.height||0;if(!rw||!rh){t.hidden=!0;return}t.hidden=!1;var y=String(R.days||30);e&&e.value!==y&&(e.value=y),o()});window.addEventListener("scroll",function(){o()},{passive:!0});window.addEventListener("resize",function(){clearTimeout(I),I=setTimeout(function(){i&&a(i),o(),u()},40)},{passive:!0})}"""

TOOLBAR_RE = re.compile(
    r'\s*<div class="stat-embed-toolbar stat-embed-toolbar--mobile">.*?</div>\s*',
    re.DOTALL,
)

CSS_BLOCK = """
/* —— chart interaction restore —— */
.archive-charts-embed-wrap--overlay-host{position:relative}
.stat-days-overlay{position:absolute;z-index:20;pointer-events:auto;margin:0;padding:0;box-sizing:border-box}
.stat-days-overlay select{width:100%;height:100%;box-sizing:border-box;font:inherit;font-size:.8125rem;padding:.15rem 1.75rem .15rem .45rem;border-radius:8px;border:1px solid var(--border);background-color:var(--bg-deep);color:var(--text);min-height:32px;cursor:pointer;-webkit-tap-highlight-color:transparent;-webkit-appearance:none;-moz-appearance:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23f2f2f2' d='M6 8L2 4h8z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 8px center}
.stat-days-hit{position:absolute;z-index:20;pointer-events:auto;margin:0;padding:0;border:0;opacity:0;cursor:pointer;background:transparent;min-height:36px;-webkit-tap-highlight-color:transparent}
"""

ZI_CALL = "OB(),streleInitEmbedTap(),streleInitDaysOverlay(),oe.view===\"landing\""


def strip_helpers(js: str) -> str:
    start = js.find("function streleEmbedAtPoint(")
    end = js.find("function zi(){")
    if start < 0 or end <= start:
        return js
    return js[:start] + js[end:]


def strip_toolbar(js: str) -> str:
    return TOOLBAR_RE.sub("", js)


def patch_css(css: str) -> str:
    if MARKER in css:
        head = css.split(MARKER)[0].rstrip()
        return head + CSS_BLOCK
    return css.rstrip() + CSS_BLOCK


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    css = CSS.read_text(encoding="utf-8")

    if "stat-embed-toolbar--mobile" in js:
        js = strip_toolbar(js)
        print("JS: removed misplaced mobile toolbar above charts")

    js = js.replace("streleBindDaysToolbar(),", "")

    if "function streleEmbedAtPoint(" in js:
        js = strip_helpers(js)
        print("JS: replaced chart interaction helpers")
    js = js.replace("function zi(){", CHART_HELPERS + "function zi(){", 1)

    if ZI_CALL not in js:
        raise SystemExit("zi chart init anchor not found")
    print("JS: days overlay on chart toolbar position")

    JS.write_text(js, encoding="utf-8")
    CSS.write_text(patch_css(css), encoding="utf-8")
    print("CSS: stat-days-overlay at iframe daysSelect rect")


if __name__ == "__main__":
    main()
