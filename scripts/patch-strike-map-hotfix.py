#!/usr/bin/env python3
"""Hotfix: strike map not loading (Yz null, mob detect, safe fitBounds)."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

REPLACEMENTS = [
    (
        'function Yz(){try{const t=localStorage.getItem(zS);return t?lw(JSON.parse(t)):null}catch{return lw(null)}}',
        'function Yz(){try{const t=localStorage.getItem(zS);return t?lw(JSON.parse(t)):lw(null)}catch{return lw(null)}}',
        "Yz null fallback",
    ),
    (
        "const mob=window.matchMedia(\"(max-width:899px)\").matches||navigator.maxTouchPoints>0;",
        "const mob=window.matchMedia(\"(max-width:899px)\").matches;",
        "mob detect width only",
    ),
    (
        "function cw(t,e,i,l,u,p,d){let o=e.getBounds();d>0&&o.extend(Dt.circle([i,l],{radius:d*1e3}).getBounds());o.isValid()||(o=Dt.circle([i,l],{radius:d*1e3}).getBounds());const b=o.pad(.18),m=t.getSize(),g=Math.max(32,Math.min(m.x,m.y)*.1);t.fitBounds(b,{animate:!1,maxZoom:15,paddingTopLeft:[g,g],paddingBottomRight:[g,g+24]})}",
        "function cw(t,e,i,l,u,p,d){try{const o=Number(d)>0?Number(d):10;let w=e.getBounds();w.extend(Dt.circle([i,l],{radius:o*1e3}).getBounds());w.isValid()||(w=Dt.circle([i,l],{radius:o*1e3}).getBounds());t.fitBounds(w.pad(.2),{animate:!1,maxZoom:15})}catch{try{t.setView([i,l],Math.min(p??11,15),{animate:!1})}catch{}}}",
        "cw safe fitBounds",
    ),
]

NDMOBILE_OLD = (
    "const u={baseLayer:tl,mapTheme:\"dark\",labelsOn:!0,bordersLayer:null,krajiMeje:Dt.layerGroup(),"
    "krajiMejeDark:null,krajiMejeLight:null,meteoinfoBase:null,satellite:null},p=Yz();"
    "u.satellite=Xz(),u.meteoinfoBase=streleMobB(),u.krajiMejeDark=streleMobL(Oz),u.krajiMejeLight=streleMobL(Fz),"
    "u.baseLayer=p.baseLayer,u.mapTheme=p.mapTheme,u.labelsOn=p.labelsOn,"
)

NDMOBILE_NEW = (
    "const u={baseLayer:tl,mapTheme:\"dark\",labelsOn:!0,bordersLayer:null,krajiMeje:Dt.layerGroup(),"
    "krajiMejeDark:null,krajiMejeLight:null,meteoinfoBase:null,satellite:null},p=Yz()||{baseLayer:tl,mapTheme:\"dark\",labelsOn:!0};"
    "u.satellite=Xz(),u.meteoinfoBase=streleMobB(),u.krajiMejeDark=streleMobL(Oz),u.krajiMejeLight=streleMobL(Fz),"
    "u.baseLayer=p.baseLayer,u.mapTheme=p.mapTheme,u.labelsOn=p.labelsOn,"
)

def main() -> None:
    s = JS.read_text()
    for old, new, label in REPLACEMENTS:
        if old not in s:
            if new.split("(")[0] in s and label == "cw safe fitBounds":
                print(f"skip {label} (already applied)")
                continue
            raise SystemExit(f"pattern not found: {label}")
        s = s.replace(old, new, 1)
        print(f"patched: {label}")

    if NDMOBILE_OLD in s:
        s = s.replace(NDMOBILE_OLD, NDMOBILE_NEW, 1)
        print("patched: nDMobile p fallback")

    JS.write_text(s)
    print("done")


if __name__ == "__main__":
    main()
