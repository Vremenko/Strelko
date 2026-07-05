#!/usr/bin/env python3
"""Telemach-style zoom: mobile pinch, desktop Ctrl+wheel + hint overlay."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"
CSS = Path(__file__).resolve().parents[1] / "dist/assets/index-b2ecBo4-.css"

HELPER = (
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

MAP_OLD = (
    "const d=Dt.map(p,{zoomControl:!1,scrollWheelZoom:!1,dragging:!1,touchZoom:!1,doubleClickZoom:!1,boxZoom:!1,keyboard:!1,tap:!1,preferCanvas:!mob,worldCopyJump:!1});"
)

MAP_NEW = (
    "const d=Dt.map(p,{zoomControl:!1,scrollWheelZoom:!1,dragging:!1,touchZoom:mob,doubleClickZoom:!1,boxZoom:!1,keyboard:!1,tap:!0,preferCanvas:!mob,worldCopyJump:!1});"
)

BIND_OLD = "d._streleEl=p,d.setView([e,i],mob?10:11,{animate:!1}),mob?nDMobile(d):nD(d),"
BIND_NEW = "d._streleEl=p,d.setView([e,i],mob?10:11,{animate:!1}),streleBindMapZoomGestures(d,p),mob?nDMobile(d):nD(d),"

XP_OLD = 'refresh_sec:"600",v:"6"'
XP_NEW = 'refresh_sec:"600",v:"7"'

CSS_SNIPPET = (
    "#strike-map{position:relative}"
    ".strele-map-wheel-hint{position:absolute;inset:0;z-index:1100;display:flex;align-items:center;"
    "justify-content:center;background:rgba(0,0,0,.45);color:#fff;font-size:clamp(.85rem,2.5vw,1rem);"
    "text-align:center;padding:1.5rem;pointer-events:none;line-height:1.45;font-family:var(--font)}"
)


def main() -> None:
    s = JS.read_text()
    anchor = "function uD("
    if "function streleBindMapZoomGestures(" not in s:
        if anchor not in s:
            raise SystemExit("uD anchor not found")
        s = s.replace(anchor, HELPER + anchor, 1)
        print("patched: streleBindMapZoomGestures helper")
    else:
        print("skip: helper")

    if MAP_OLD in s:
        s = s.replace(MAP_OLD, MAP_NEW, 1)
        print("patched: uD map options")
    elif "touchZoom:mob" in s:
        print("skip: map options")
    else:
        raise SystemExit("map options not found")

    if BIND_OLD in s:
        s = s.replace(BIND_OLD, BIND_NEW, 1)
        print("patched: bind gestures in uD")
    elif "streleBindMapZoomGestures(d,p)" in s:
        print("skip: bind in uD")
    else:
        raise SystemExit("bind site not found")

    if XP_OLD in s:
        s = s.replace(XP_OLD, XP_NEW, 1)
        print("patched: map-embed cache v7")
    else:
        print("skip: XP version")

    JS.write_text(s)

    css = CSS.read_text()
    if ".strele-map-wheel-hint" not in css:
        CSS.write_text(css + CSS_SNIPPET)
        print("patched: wheel hint CSS")
    else:
        print("skip: CSS")

    print("done")


if __name__ == "__main__":
    main()
