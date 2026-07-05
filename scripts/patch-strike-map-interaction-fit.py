#!/usr/bin/env python3
"""Strike map: disable accidental pan/wheel; fit full search circle to viewport."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

MAP_OLD = (
    "const d=Dt.map(p,{zoomControl:!1,scrollWheelZoom:!0,preferCanvas:!mob,worldCopyJump:!1});"
)
MAP_NEW = (
    "const d=Dt.map(p,{zoomControl:!1,scrollWheelZoom:!1,dragging:!1,touchZoom:!1,"
    "doubleClickZoom:!1,boxZoom:!1,keyboard:!1,tap:!1,preferCanvas:!mob,worldCopyJump:!1});"
)

CW_OLD = (
    "function cw(t,e,i,l,u,p,d){try{const o=Number(d)>0?Number(d):10;let w=e.getBounds();"
    "w.extend(Dt.circle([i,l],{radius:o*1e3}).getBounds());w.isValid()||(w=Dt.circle([i,l],{radius:o*1e3}).getBounds());"
    "t.fitBounds(w.pad(.2),{animate:!1,maxZoom:15})}catch{try{t.setView([i,l],Math.min(p??11,15),{animate:!1})}catch{}}}"
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
    changed = False

    if MAP_OLD in s:
        s = s.replace(MAP_OLD, MAP_NEW, 1)
        print("patched: map interaction options")
        changed = True
    elif MAP_NEW.split("dragging")[0] in s:
        print("skip: map interaction already patched")
    else:
        raise SystemExit("map creation pattern not found")

    if CW_OLD in s:
        s = s.replace(CW_OLD, CW_NEW, 1)
        print("patched: cw circle fitBounds")
        changed = True
    elif "paddingTopLeft:[x,y]" in s:
        print("skip: cw already patched")
    else:
        raise SystemExit("cw pattern not found")

    if changed:
        JS.write_text(s)
    print("done")


if __name__ == "__main__":
    main()
