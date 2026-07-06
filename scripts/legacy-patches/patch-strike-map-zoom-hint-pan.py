#!/usr/bin/env python3
"""Map hint + Ctrl+wheel fine zoom + Ctrl+drag pan."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

NEW = (
    'function streleBindMapZoomGestures(t,e){if(!t||!e)return;const mob=typeof window!="undefined"&&window.matchMedia("(max-width:899px)").matches;'
    'if(mob){try{t.touchZoom.enable()}catch{}return}'
    'const msg="Ctrl + kolesce ali vlečenje miške";'
    'let hT=null,hEl=null;const hide=()=>{hT&&(clearTimeout(hT),hT=null),hEl&&hEl.parentNode&&(hEl.parentNode.removeChild(hEl),hEl=null)};'
    'const show=()=>{hide();if(!e.isConnected)return;hEl=document.createElement("div");hEl.className="strele-map-wheel-hint";hEl.textContent=msg;e.appendChild(hEl);hT=setTimeout(hide,2800)};'
    'const c=t.getContainer();let panOn=!1,lx=0,ly=0,ctrlDn=!1;'
    'const ctrlZ=ev=>ctrlDn||!!(ev.ctrlKey||ev.metaKey||ev.getModifierState&&ev.getModifierState("Control"));'
    'const wStep=ev=>{let dy=ev.deltaY;ev.deltaMode===1?dy*=20:ev.deltaMode===2?dy*=1200:Math.abs(dy)<4&&(dy*=20);return-dy/120};'
    'const endPan=()=>{panOn=!1};'
    'window.addEventListener("keydown",ev=>{ev.key==="Control"&&(ctrlDn=!0)},!0);'
    'window.addEventListener("keyup",ev=>{ev.key==="Control"&&(ctrlDn=!1)},!0);'
    'window.addEventListener("blur",()=>{ctrlDn=!1});'
    'c.addEventListener("mousedown",ev=>{if(ctrlZ(ev)&&ev.button===0){hide();panOn=!0;lx=ev.clientX;ly=ev.clientY;ev.preventDefault()}});'
    'window.addEventListener("mousemove",ev=>{if(!panOn)return;const dx=ev.clientX-lx,dy=ev.clientY-ly;lx=ev.clientX;ly=ev.clientY;t.panBy([-dx,-dy],{animate:!1})});'
    'window.addEventListener("mouseup",endPan);'
    'c.addEventListener("wheel",ev=>{if(ctrlZ(ev)){hide();ev.preventDefault();ev.stopPropagation();const st=wStep(ev);if(!st)return;const z=t.getZoom()+st,lo=typeof t.getMinZoom=="function"?t.getMinZoom():1,hi=typeof t.getMaxZoom=="function"?t.getMaxZoom():15;t.setZoom(Math.min(hi,Math.max(lo,z)),{animate:!1})}else show()},{passive:!1,capture:!0})}'
)


def main() -> None:
    s = JS.read_text()
    start = s.find("function streleBindMapZoomGestures(")
    if start < 0:
        raise SystemExit("streleBindMapZoomGestures not found")
    end = s.find("function uD(", start)
    if end <= start:
        raise SystemExit("function end not found")
    if s[start:end] == NEW:
        print("skip: already patched")
        return
    s = s[:start] + NEW + s[end:]
    JS.write_text(s)
    print("patched: streleBindMapZoomGestures")


if __name__ == "__main__":
    main()
