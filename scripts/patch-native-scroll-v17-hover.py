#!/usr/bin/env python3
"""Forward mousemove to embed for hover tooltips."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

OLD = (
    'document.addEventListener("click",function(u){if(streleDaysOverlayHit(u.clientX,u.clientY))return;'
    'var p=streleEmbedAtPoint(u.clientX,u.clientY);p&&streleForwardChartTap(p,u.clientX,u.clientY)})}'
)

NEW = (
    'document.addEventListener("click",function(u){if(streleDaysOverlayHit(u.clientX,u.clientY))return;'
    'var p=streleEmbedAtPoint(u.clientX,u.clientY);p&&streleForwardChartTap(p,u.clientX,u.clientY)});'
    'var hf=null,hraf=0,hx=0,hy=0;document.addEventListener("mousemove",function(u){'
    'if(streleDaysOverlayHit(u.clientX,u.clientY)){if(hf){hf.contentWindow.postMessage({type:"strele-embed-chart-leave"},"*");hf=null}return}'
    'var p=streleEmbedAtPoint(u.clientX,u.clientY);if(!p){if(hf){hf.contentWindow.postMessage({type:"strele-embed-chart-leave"},"*");hf=null}return}'
    'hf=p,hx=u.clientX,hy=u.clientY,hraf||(hraf=requestAnimationFrame(function(){hraf=0,'
    'hf&&hf.contentWindow&&hf.contentWindow.postMessage({type:"strele-embed-chart-hover",clientX:hx,clientY:hy},"*")}))},{passive:!0})}'
)


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    if OLD not in js:
        if "strele-embed-chart-hover" in js:
            print("Hover forward already present")
            return
        raise SystemExit("streleInitEmbedTap anchor not found")
    js = js.replace(OLD, NEW, 1)
    JS.write_text(js, encoding="utf-8")
    print("Added mousemove hover forward")


if __name__ == "__main__":
    main()
