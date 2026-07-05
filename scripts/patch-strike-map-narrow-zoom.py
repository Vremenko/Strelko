#!/usr/bin/env python3
"""Strike map: extra zoom-out padding on narrow viewports for full circle."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

CW_OLD = (
    "function cw(t,e,i,l,u,p,d){try{const o=Number(d)>0?Number(d):10;"
    "let w=Dt.circle([i,l],{radius:o*1e3}).getBounds();"
    "if(e&&e.getBounds){const b=e.getBounds();b.isValid()&&(w=w.extend(b))}"
    "const m=t.getSize(),x=Math.max(24,Math.round(m.x*.08)),y=Math.max(24,Math.round(m.y*.1));"
    "t.fitBounds(w,{animate:!1,maxZoom:15,paddingTopLeft:[x,y],paddingBottomRight:[x,y+32]})"
    "}catch{try{t.setView([i,l],Math.min(p??11,15),{animate:!1})}catch{}}}"
)

CW_NEW = (
    "function cw(t,e,i,l,u,p,d){try{const o=Number(d)>0?Number(d):10;"
    "let w=Dt.circle([i,l],{radius:o*1e3}).getBounds();"
    "if(e&&e.getBounds){const b=e.getBounds();b.isValid()&&(w=w.extend(b))}"
    "const m=t.getSize(),W=m.x,n=W<400?.18:W<520?.15:W<720?.12:.08,"
    "x=Math.max(36,Math.round(W*n)),y=Math.max(28,Math.round(m.y*(W<520?.13:.1)));"
    "t.fitBounds(w,{animate:!1,maxZoom:15,paddingTopLeft:[x,y],paddingBottomRight:[x,y+40]});"
    "if(W<520){const z=t.getZoom(),f=Math.max(t.getMinZoom(),z-(W<400?2:1));"
    "z>f&&t.setZoom(f,{animate:!1})}"
    "}catch{try{t.setView([i,l],Math.min(p??11,15),{animate:!1})}catch{}}}"
)


def main() -> None:
    s = JS.read_text()
    if CW_OLD in s:
        s = s.replace(CW_OLD, CW_NEW, 1)
        JS.write_text(s)
        print("patched: cw narrow-screen zoom-out")
    elif "W<400?1.25:1" in s:
        print("skip: already patched")
    else:
        raise SystemExit("cw pattern not found")
    print("done")


if __name__ == "__main__":
    main()
