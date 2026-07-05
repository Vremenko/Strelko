#!/usr/bin/env python3
"""Mobile touch hover: forward chart-hover on touchstart/touchmove."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

OLD = (
    "function streleInitEmbedTap(){if(window.__streleEmbedTap)return;window.__streleEmbedTap=1;"
    "var t=null,e=0,i=0,l=!1;document.addEventListener(\"touchstart\",function(u){if(u.touches.length!==1)return;"
    "var p=u.touches[0].clientX,d=u.touches[0].clientY;if(streleDaysOverlayHit(p,d))return;"
    "t=streleEmbedAtPoint(p,d);if(!t)return;e=p;i=d;l=!1},{passive:!0});"
    "document.addEventListener(\"touchmove\",function(u){if(!t||u.touches.length!==1)return;"
    "(Math.abs(u.touches[0].clientX-e)>10||Math.abs(u.touches[0].clientY-i)>10)&&(l=!0)},{passive:!0});"
    "document.addEventListener(\"touchend\",function(u){if(!t||l){t=null;return}var p=u.changedTouches[0].clientX,"
    "d=u.changedTouches[0].clientY,o=t.getBoundingClientRect();if(p<o.left||p>o.right||d<o.top||d>o.bottom||"
    "streleDaysOverlayHit(p,d)){t=null;return}streleForwardChartTap(t,p,d),st=Date.now(),t=null},{passive:!0});"
    "var st=0;document.addEventListener(\"click\",function(u){if(Date.now()-st<500)return;"
    "if(streleDaysOverlayHit(u.clientX,u.clientY))return;var p=streleEmbedAtPoint(u.clientX,u.clientY);"
    "p&&streleForwardChartTap(p,u.clientX,u.clientY)});var hf=null,hraf=0,hx=0,hy=0;"
    "document.addEventListener(\"mousemove\",function(u){if(streleDaysOverlayHit(u.clientX,u.clientY)){"
    'if(hf){hf.contentWindow.postMessage({type:"strele-embed-chart-leave"},"*");hf=null}return}'
    "var p=streleEmbedAtPoint(u.clientX,u.clientY);if(!p){if(hf){hf.contentWindow.postMessage"
    '({type:"strele-embed-chart-leave"},"*");hf=null}return}hf=p,hx=u.clientX,hy=u.clientY,hraf||(hraf='
    'requestAnimationFrame(function(){hraf=0,hf&&hf.contentWindow&&hf.contentWindow.postMessage'
    '({type:"strele-embed-chart-hover",clientX:hx,clientY:hy},"*")}))},{passive:!0})}'
)

NEW = (
    "function streleInitEmbedTap(){if(window.__streleEmbedTap)return;window.__streleEmbedTap=1;"
    "var tf=null,tx=0,ty=0,ts=!1,st=0,hf=null,hraf=0,hx=0,hy=0;"
    "function hAt(f,x,y){f&&f.contentWindow&&f.contentWindow.postMessage({type:\"strele-embed-chart-hover\",clientX:x,clientY:y},\"*\")}"
    "function hLeave(f){f&&f.contentWindow&&f.contentWindow.postMessage({type:\"strele-embed-chart-leave\"},\"*\")}"
    "function hSched(f,x,y){hf=f,hx=x,hy=y,hraf||(hraf=requestAnimationFrame(function(){hraf=0,hAt(hf,hx,hy)}))}"
    "document.addEventListener(\"touchstart\",function(u){if(u.touches.length!==1)return;var x=u.touches[0].clientX,"
    "y=u.touches[0].clientY;if(streleDaysOverlayHit(x,y))return;var f=streleEmbedAtPoint(x,y);if(!f)return;"
    "tf=f,tx=x,ty=y,ts=!1,hSched(f,x,y)},{passive:!0});"
    "document.addEventListener(\"touchmove\",function(u){if(!tf||u.touches.length!==1)return;var x=u.touches[0].clientX,"
    "y=u.touches[0].clientY;if(Math.abs(x-tx)>14||Math.abs(y-ty)>14){if(!ts){ts=!0,hLeave(tf)}return}hSched(tf,x,y)},{passive:!0});"
    "document.addEventListener(\"touchend\",function(u){if(!tf)return;var f=tf,x=u.changedTouches[0].clientX,y=u.changedTouches[0].clientY;"
    "hLeave(f);if(!ts){var r=f.getBoundingClientRect();if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom&&!streleDaysOverlayHit(x,y)){"
    "streleForwardChartTap(f,x,y),st=Date.now()}}tf=null,ts=!1},{passive:!0});"
    "document.addEventListener(\"click\",function(u){if(Date.now()-st<500)return;if(streleDaysOverlayHit(u.clientX,u.clientY))return;"
    "var f=streleEmbedAtPoint(u.clientX,u.clientY);f&&streleForwardChartTap(f,u.clientX,u.clientY)});"
    "document.addEventListener(\"mousemove\",function(u){if(streleDaysOverlayHit(u.clientX,u.clientY)){if(hf){hLeave(hf);hf=null}return}"
    "var f=streleEmbedAtPoint(u.clientX,u.clientY);if(!f){if(hf){hLeave(hf);hf=null}return}hSched(f,u.clientX,u.clientY)},{passive:!0})}"
)


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    if OLD not in js:
        if "hSched(tf,x,y)" in js:
            print("Touch hover already present")
            return
        raise SystemExit("streleInitEmbedTap anchor not found")
    js = js.replace(OLD, NEW, 1)
    JS.write_text(js, encoding="utf-8")
    print("Mobile touch hover on touchstart/touchmove")


if __name__ == "__main__":
    main()
