#!/usr/bin/env python3
"""Fix strike circle zoom: fitBounds, size-sync retries, block Gz reset, lower fallback."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

CW_OLD = (
    "function cw(t,e,i,l,u,p,d){try{t.invalidateSize(!0);const mob=typeof window!=\"undefined\"&&window.matchMedia(\"(max-width:899px)\").matches,o=Number(d)>0?Number(d):10,b=Dt.circle([i,l],{radius:o*1e3}).getBounds().pad(mob?.18:.1),W=Math.max(1,t.getSize().x),H=Math.max(1,t.getSize().y),px=Math.max(80,Math.round(W*(mob?.24:.14))),py=Math.max(60,Math.round(H*(mob?.18:.1)));let z=t.getBoundsZoom(b,!1,Dt.point(px,py));Number.isFinite(z)||(z=11);if(mob){const latR=i*Math.PI/180,Rm=o*1e3,aw=Math.max(100,W-2*px);for(let z2=z;z2>=1;z2--){const mpp=40075016.686*Math.cos(latR)/(256*Math.pow(2,z2));if(2*Rm/mpp<=aw*.85){z=Math.min(z,z2);break}}z=Math.max(1,z-2)}z=Math.min(15,Math.max(1,z));try{t.setMaxBounds(null)}catch{}t.setView(Dt.latLng(i,l),z,{animate:!1})}catch{try{t.setView([i,l],Math.min(p??11,15),{animate:!1})}catch{}}}"
)

CW_NEW = (
    "function cw(t,e,i,l,u,p,d){try{const mob=typeof window!=\"undefined\"&&window.matchMedia(\"(max-width:899px)\").matches,"
    "host=t._streleEl||t.getContainer(),o=Number(d)>0?Number(d):10,"
    "b=Dt.circle([i,l],{radius:o*1e3}).getBounds().pad(mob?0.22:0.12);"
    "t.invalidateSize(!0);const rr=host.getBoundingClientRect(),W=Math.max(1,Math.round(rr.width)),H=Math.max(1,Math.round(rr.height));"
    "if(W<20||H<20)return;const px=Math.max(72,Math.round(W*(mob?0.22:0.12))),py=Math.max(56,Math.round(H*(mob?0.16:0.1)));"
    "try{t.setMaxBounds(null)}catch{}"
    "t.fitBounds(b,{animate:!1,maxZoom:15,paddingTopLeft:[px,py],paddingBottomRight:[px,py+48]});"
    "let z=t.getZoom();mob&&(z=Math.max(1,z-3));z=Math.min(15,Math.max(1,z));"
    "t.setView(Dt.latLng(i,l),z,{animate:!1});host.setAttribute(\"data-strele-zoom\",String(z))}"
    "catch{try{t.setView([i,l],mob?8:Math.min(p??11,15),{animate:!1})}catch{}}}"
)

GZ_OLD = "function Gz(t){if(!t||typeof t.setMaxBoundsViscosity!=\"function\"||t._searchMinZoom==null||t._applyingSearchLimits)return;"
GZ_NEW = "function Gz(t){if(!t||t._streleEl||typeof t.setMaxBoundsViscosity!=\"function\"||t._searchMinZoom==null||t._applyingSearchLimits)return;"

UD_SETVIEW_OLD = "p._mapFitted=!1,d.setView([e,i],11,{animate:!1}),mob?nDMobile(d):nD(d),"
UD_SETVIEW_NEW = "p._mapFitted=!1,d._streleEl=p,d.setView([e,i],mob?8:11,{animate:!1}),mob?nDMobile(d):nD(d),"

DUP_OLD = "const w=uw(o,u,e,i);d._streleEl=p;const streleRefitMap"
DUP_NEW = "const w=uw(o,u,e,i);const streleRefitMap"

REFIT_OLD = (
    "return lD(d,e,i,l,()=>{streleRefitMap(),requestAnimationFrame(streleRefitMap),setTimeout(streleRefitMap,250),setTimeout(streleRefitMap,700)}),"
)

REFIT_NEW = (
    "return lD(d,e,i,l,()=>{streleRefitMap(),requestAnimationFrame(streleRefitMap),setTimeout(streleRefitMap,150),"
    "setTimeout(streleRefitMap,400),setTimeout(streleRefitMap,900),setTimeout(streleRefitMap,1500)}),"
)


def main() -> None:
    s = JS.read_text()
    for old, new, label in [
        (CW_OLD, CW_NEW, "cw fitBounds"),
        (GZ_OLD, GZ_NEW, "Gz skip strike map"),
        (UD_SETVIEW_OLD, UD_SETVIEW_NEW, "uD early _streleEl + zoom 8"),
        (DUP_OLD, DUP_NEW, "uD dedupe _streleEl"),
        (REFIT_OLD, REFIT_NEW, "more refit retries"),
    ]:
        if old in s:
            s = s.replace(old, new, 1)
            print(f"patched: {label}")
        elif new[:35] in s:
            print(f"skip: {label}")
        else:
            raise SystemExit(f"pattern not found: {label}")
    JS.write_text(s)
    print("done")


if __name__ == "__main__":
    main()
