#!/usr/bin/env python3
"""Strike map: refit circle after layout; use real container width for zoom."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

CW_OLD = (
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

CW_NEW = (
    "function cw(t,e,i,l,u,p,d){try{t.invalidateSize(!0);"
    "const C=t.getContainer(),R=C.getBoundingClientRect(),S=t.getSize(),"
    "W=Math.round(R.width>0?R.width:S.x),H=Math.round(R.height>0?R.height:S.y),"
    "o=Number(d)>0?Number(d):10,w=Dt.circle([i,l],{radius:o*1e3}).getBounds().pad(W<520?.16:.08),"
    "x=Math.max(52,Math.round(W*(W<380?.2:W<520?.17:.1))),y=Math.max(40,Math.round(H*.12));"
    "t.fitBounds(w,{animate:!1,maxZoom:15,paddingTopLeft:[x,y],paddingBottomRight:[x,y+48]});"
    "if(W<520){const z=t.getZoom(),dz=W<380?3:W<480?2:1,f=Math.max(t.getMinZoom(),z-dz);"
    "f<z&&t.setZoom(f,{animate:!1})}"
    "}catch{try{t.setView([i,l],Math.min(p??11,15),{animate:!1})}catch{}}}"
)

LD_CALLBACK_OLD = (
    "return lD(d,e,i,l,k=>{cw(d,w,e,i,u.length,k,l),p._mapFitted=!0}),p._updateStrikes="
)

LD_CALLBACK_NEW = (
    "const streleRefitMap=()=>{d.invalidateSize(!0),cw(d,w,e,i,u.length,d._searchMinZoom,l),p._mapFitted=!0};"
    "return lD(d,e,i,l,k=>{streleRefitMap(),requestAnimationFrame(()=>{streleRefitMap()}),"
    "setTimeout(streleRefitMap,200)}),p._updateStrikes="
)

ENSURE_OLD = (
    "function streleEnsureResultsMap(){if(oe.view!==\"results\"||!oe.searchResult)return;"
    "const t=document.getElementById(\"strike-map\");if(t&&t._leafletMap){t._leafletMap.invalidateSize(!0);return}"
    "const e=()=>{const i=document.getElementById(\"strike-map\");if(!i)return;const l=i.getBoundingClientRect();"
    "if(l.width<20||l.height<20){requestAnimationFrame(e);return}streleMountResultsMapSync();"
    "const u=i._leafletMap;u&&requestAnimationFrame(()=>{u.invalidateSize(!0);u.fire(\"resize\")})};requestAnimationFrame(e)}"
)

ENSURE_NEW = (
    "function streleEnsureResultsMap(){if(oe.view!==\"results\"||!oe.searchResult)return;"
    "const t=document.getElementById(\"strike-map\");"
    "if(t&&t._leafletMap){t._leafletMap.invalidateSize(!0);"
    "const k=oe.mapStrikeCache.period||oe.searchResult.strikes||[];"
    "t._updateStrikes&&requestAnimationFrame(()=>t._updateStrikes(k,{refit:!0}));return}"
    "const e=()=>{const i=document.getElementById(\"strike-map\");if(!i)return;const l=i.getBoundingClientRect();"
    "if(l.width<20||l.height<20){requestAnimationFrame(e);return}streleMountResultsMapSync();"
    "const u=i._leafletMap,k=oe.mapStrikeCache.period||oe.searchResult.strikes||[];"
    "u&&requestAnimationFrame(()=>{u.invalidateSize(!0),u.fire(\"resize\"),"
    "i._updateStrikes&&setTimeout(()=>i._updateStrikes(k,{refit:!0}),200)})};requestAnimationFrame(e)}"
)


def main() -> None:
    s = JS.read_text()
    n = 0
    for old, new, label in [
        (CW_OLD, CW_NEW, "cw"),
        (LD_CALLBACK_OLD, LD_CALLBACK_NEW, "lD deferred refit"),
        (ENSURE_OLD, ENSURE_NEW, "streleEnsureResultsMap refit"),
    ]:
        if old in s:
            s = s.replace(old, new, 1)
            print(f"patched: {label}")
            n += 1
        elif new[:40] in s:
            print(f"skip: {label}")
        else:
            raise SystemExit(f"pattern not found: {label}")
    if n:
        JS.write_text(s)
    print("done")


if __name__ == "__main__":
    main()
