#!/usr/bin/env python3
"""Suppress ghost click after touch tap on chart iframes."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

OLD = (
    'streleForwardChartTap(t,p,d);t=null},{passive:!0});document.addEventListener("click",function(u){'
    'if(streleDaysOverlayHit(u.clientX,u.clientY))return;var p=streleEmbedAtPoint(u.clientX,u.clientY);'
    'p&&streleForwardChartTap(p,u.clientX,u.clientY)});'
)

NEW = (
    'streleForwardChartTap(t,p,d),st=Date.now(),t=null},{passive:!0});var st=0;'
    'document.addEventListener("click",function(u){if(Date.now()-st<500)return;'
    'if(streleDaysOverlayHit(u.clientX,u.clientY))return;var p=streleEmbedAtPoint(u.clientX,u.clientY);'
    'p&&streleForwardChartTap(p,u.clientX,u.clientY)});'
)


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    if OLD not in js:
        if "var st=0" in js and "Date.now()-st<500" in js:
            print("Ghost click guard already present")
            return
        raise SystemExit("streleInitEmbedTap click anchor not found")
    js = js.replace(OLD, NEW, 1)
    JS.write_text(js, encoding="utf-8")
    print("Added ghost-click guard after touch tap")


if __name__ == "__main__":
    main()
