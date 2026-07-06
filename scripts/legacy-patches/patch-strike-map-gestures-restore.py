#!/usr/bin/env python3
"""Strike map: mobile pinch; desktop Ctrl+wheel, Ctrl+drag pan, hint (kot map-embed)."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist/assets/index-DijleoXU.js"
CSS = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "dist/assets/index-b2ecBo4-.css"

HELPER = (
    'function streleBindMapZoomGestures(t,e){if(!t||!e)return;'
    'const mob=typeof window!="undefined"&&window.matchMedia("(max-width:899px)").matches;'
    'if(mob){try{t.touchZoom.enable()}catch{}return}'
    'const hintMsg="Ctrl + kolesce ali vlečenje miške";'
    'let hT=null,hEl=null;'
    'const hide=()=>{hT&&(clearTimeout(hT),hT=null),hEl&&hEl.parentNode&&(hEl.parentNode.removeChild(hEl),hEl=null)};'
    'const show=()=>{hide();if(!e.isConnected)return;hEl=document.createElement("div");'
    'hEl.className="strele-map-wheel-hint";hEl.textContent=hintMsg;e.appendChild(hEl);hT=setTimeout(hide,2800)};'
    'const container=t.getContainer();let panning=!1,lastX=0,lastY=0,ctrlDown=!1;'
    'const ctrlZoom=ev=>ctrlDown||!!(ev.ctrlKey||ev.metaKey||ev.getModifierState&&ev.getModifierState("Control"));'
    'const wheelZoomStep=ev=>{let dy=ev.deltaY;if(ev.deltaMode===WheelEvent.DOM_DELTA_LINE)dy*=20;'
    'else if(ev.deltaMode===WheelEvent.DOM_DELTA_PAGE)dy*=1200;else if(Math.abs(dy)<4)dy*=20;return-dy/120};'
    'const endPan=()=>{panning=!1};'
    'window.addEventListener("keydown",ev=>{ev.key==="Control"&&(ctrlDown=!0)},!0);'
    'window.addEventListener("keyup",ev=>{ev.key==="Control"&&(ctrlDown=!1)},!0);'
    'window.addEventListener("blur",()=>{ctrlDown=!1});'
    'container.addEventListener("mousedown",ev=>{if(ctrlZoom(ev)&&ev.button===0){hide();panning=!0;'
    'lastX=ev.clientX;lastY=ev.clientY;ev.preventDefault()}});'
    'window.addEventListener("mousemove",ev=>{if(!panning)return;const dx=ev.clientX-lastX,dy=ev.clientY-lastY;'
    'lastX=ev.clientX;lastY=ev.clientY;t.panBy([-dx,-dy],{animate:!1})});'
    'window.addEventListener("mouseup",endPan);'
    'container.addEventListener("wheel",ev=>{if(ctrlZoom(ev)){hide();ev.preventDefault();ev.stopPropagation();'
    'const step=wheelZoomStep(ev);if(!step)return;const next=t.getZoom()+step;'
    't.setZoom(Math.min(t.getMaxZoom(),Math.max(t.getMinZoom(),next)),{animate:!1})}else show()},'
    '{passive:!1,capture:!0})}'
)

HELPER_OLD = (
    'function streleBindMapZoomGestures(t,e){if(!t||!e)return;'
    'const mob=typeof window!="undefined"&&window.matchMedia("(max-width:899px)").matches;'
    'if(mob){try{t.touchZoom.enable()}catch{}return}'
    'let hT=null,hEl=null;const hide=()=>{hT&&(clearTimeout(hT),hT=null),hEl&&hEl.parentNode&&(hEl.parentNode.removeChild(hEl),hEl=null)};'
    'const show=()=>{hide();if(!e.isConnected)return;hEl=document.createElement("div");'
    'hEl.className="strele-map-wheel-hint";'
    'hEl.textContent="Zemljevid povečate tako, da držite tipko Ctrl in vrtite kolesce na miški.";'
    'e.appendChild(hEl);hT=setTimeout(hide,2800)};'
    't.getContainer().addEventListener("wheel",ev=>{'
    'if(ev.ctrlKey){hide();ev.preventDefault();const z=t.getZoom()+(ev.deltaY>0?-1:1),'
    'lo=typeof t.getMinZoom=="function"?t.getMinZoom():1,hi=typeof t.getMaxZoom=="function"?t.getMaxZoom():15;'
    't.setZoom(Math.min(hi,Math.max(lo,z)),{animate:!1})}else show()},'
    '{passive:!1})}'
)

MAP_OLD = "const d=Dt.map(p,{zoomControl:!1,scrollWheelZoom:!0,preferCanvas:!0,worldCopyJump:!1});"

MAP_NEW = (
    "const mob=typeof window!=\"undefined\"&&window.matchMedia(\"(max-width:899px)\").matches;"
    "const d=Dt.map(p,{zoomControl:!1,scrollWheelZoom:!1,dragging:!1,touchZoom:mob,"
    "doubleClickZoom:!1,boxZoom:!1,keyboard:!1,tap:!0,preferCanvas:!mob,worldCopyJump:!1});"
)

VIEW_OLD = "d.setView([e,i],11,{animate:!1}),nD(d),"
VIEW_NEW = "d.setView([e,i],mob?10:11,{animate:!1}),streleBindMapZoomGestures(d,p),nD(d),"

CSS_SNIPPET = """
/* —— strike map zoom gestures —— */
#strike-map{position:relative}
.strele-map-wheel-hint{position:absolute;inset:0;z-index:1100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);color:#fff;font-size:clamp(.85rem,2.5vw,1rem);text-align:center;padding:1.5rem;pointer-events:none;line-height:1.45;font-family:var(--font)}
@media(max-width:899px){#strike-map{touch-action:pan-x pan-y pinch-zoom}}
"""

MARKER = "/* —— strike map zoom gestures —— */"


def patch_css(css: str) -> str:
    if MARKER in css:
        head = css.split(MARKER)[0].rstrip()
        return head + CSS_SNIPPET
    return css.rstrip() + CSS_SNIPPET


def patch_helper(js: str) -> str:
    if HELPER in js:
        print("JS: streleBindMapZoomGestures already up to date")
        return js
    if HELPER_OLD in js:
        js = js.replace(HELPER_OLD, HELPER, 1)
        print("JS: updated streleBindMapZoomGestures (pan + hint)")
        return js
    anchor = "function uD("
    if anchor not in js:
        raise SystemExit("uD anchor not found")
    js = js.replace(anchor, HELPER + anchor, 1)
    print("JS: added streleBindMapZoomGestures")
    return js


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    js = patch_helper(js)

    if MAP_OLD in js:
        js = js.replace(MAP_OLD, MAP_NEW, 1)
        print("JS: disabled wheel/drag; mobile pinch only")
    elif "touchZoom:mob" in js and "scrollWheelZoom:!1" in js:
        print("JS: map options already patched")
    else:
        raise SystemExit("uD map options pattern not found")

    if VIEW_OLD in js:
        js = js.replace(VIEW_OLD, VIEW_NEW, 1)
        print("JS: bind zoom gestures in uD")
    elif "streleBindMapZoomGestures(d,p)" in js:
        print("JS: gesture bind already in uD")
    else:
        raise SystemExit("uD setView bind pattern not found")

    JS.write_text(js, encoding="utf-8")
    CSS.write_text(patch_css(CSS.read_text(encoding="utf-8")), encoding="utf-8")
    print("CSS: wheel hint + strike-map touch-action")


if __name__ == "__main__":
    main()
