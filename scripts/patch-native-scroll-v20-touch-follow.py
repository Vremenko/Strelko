#!/usr/bin/env python3
"""Fix mobile tooltip follow: always hover on touchmove, tap only on short press."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

OLD = (
    "var tf=null,tx=0,ty=0,ts=!1,st=0,hf=null,hraf=0,hx=0,hy=0;"
    'document.addEventListener("touchstart",function(u){if(u.touches.length!==1)return;var x=u.touches[0].clientX,'
    "y=u.touches[0].clientY;if(streleDaysOverlayHit(x,y))return;var f=streleEmbedAtPoint(x,y);if(!f)return;"
    "tf=f,tx=x,ty=y,ts=!1,hSched(f,x,y)},{passive:!0});"
    'document.addEventListener("touchmove",function(u){if(!tf||u.touches.length!==1)return;var x=u.touches[0].clientX,'
    "y=u.touches[0].clientY;if(Math.abs(x-tx)>14||Math.abs(y-ty)>14){if(!ts){ts=!0,hLeave(tf)}return}hSched(tf,x,y)},{passive:!0});"
    'document.addEventListener("touchend",function(u){if(!tf)return;var f=tf,x=u.changedTouches[0].clientX,y=u.changedTouches[0].clientY;'
    "hLeave(f);if(!ts){var r=f.getBoundingClientRect();if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom&&!streleDaysOverlayHit(x,y)){"
    'streleForwardChartTap(f,x,y),st=Date.now()}}tf=null,ts=!1},{passive:!0});'
)

NEW = (
    "var tf=null,tx=0,ty=0,st=0,hf=null,hraf=0,hx=0,hy=0;"
    'document.addEventListener("touchstart",function(u){if(u.touches.length!==1)return;var x=u.touches[0].clientX,'
    "y=u.touches[0].clientY;if(streleDaysOverlayHit(x,y))return;var f=streleEmbedAtPoint(x,y);if(!f)return;"
    "tf=f,tx=x,ty=y,hSched(f,x,y)},{passive:!0});"
    'document.addEventListener("touchmove",function(u){if(!tf||u.touches.length!==1)return;var x=u.touches[0].clientX,'
    "y=u.touches[0].clientY;var f=streleEmbedAtPoint(x,y);if(!f||f!==tf){hLeave(tf);tf=null;return}hSched(tf,x,y)},{passive:!0});"
    'document.addEventListener("touchend",function(u){if(!tf)return;var f=tf,x=u.changedTouches[0].clientX,y=u.changedTouches[0].clientY;'
    "hLeave(f);var mv=Math.hypot(x-tx,y-ty);if(mv<=18){var r=f.getBoundingClientRect();"
    "if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom&&!streleDaysOverlayHit(x,y)){"
    'streleForwardChartTap(f,x,y),st=Date.now()}}tf=null},{passive:!0});'
)


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    if OLD not in js:
        if "Math.hypot(x-tx,y-ty)" in js and "ts=!1" not in js[js.find("function streleInitEmbedTap"):js.find("function streleInitDaysOverlay")]:
            print("Touch follow already fixed")
            return
        raise SystemExit("touch handler anchor not found")
    js = js.replace(OLD, NEW, 1)
    JS.write_text(js, encoding="utf-8")
    print("Touchmove always forwards hover")


if __name__ == "__main__":
    main()
