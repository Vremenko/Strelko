#!/usr/bin/env python3
"""Fix clipped search circle: no tight maxBounds on mobile; width-based zoom."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

CW_OLD = (
    "function cw(t,e,i,l,u,p,d){try{t.invalidateSize(!0);const C=t.getContainer(),R=C.getBoundingClientRect(),S=t.getSize(),"
    "W=Math.max(1,Math.round(R.width>0?R.width:S.x)),H=Math.max(1,Math.round(R.height>0?R.height:S.y)),"
    "o=Number(d)>0?Number(d):10,Rm=o*1e3,latR=i*Math.PI/180,"
    "padX=Math.max(72,Math.round(W*.18)),padY=Math.max(52,Math.round(H*.14)),"
    "availW=W-2*padX,availH=H-2*padY-40,z=18;for(;z>=1;z--){const mpp=40075016.686*Math.cos(latR)/(256*Math.pow(2,z)),"
    "dPx=2*Rm/mpp;if(dPx<=availW&&dPx<=availH)break}"
    "W<520&&(z=Math.max(1,z-1)),W<420&&(z=Math.max(1,z-1)),W<360&&(z=Math.max(1,z-1));"
    "z=Math.min(15,Math.max(1,z));t.setView(Dt.latLng(i,l),z,{animate:!1})"
    "}catch{try{t.setView([i,l],Math.min(p??11,15),{animate:!1})}catch{}}}"
)

CW_NEW = (
    "function cw(t,e,i,l,u,p,d){try{t.invalidateSize(!0);"
    "const H0=t._streleEl||t.getContainer(),R=H0.getBoundingClientRect(),"
    "W=Math.max(1,Math.round(R.width||t.getSize().x)),H=Math.max(1,Math.round(R.height||t.getSize().y)),"
    "o=Number(d)>0?Number(d):10,Rm=o*1e3,latR=i*Math.PI/180,"
    "padX=Math.max(56,Math.round(W*.14)),padY=Math.max(44,Math.round(H*.1)),availW=Math.max(80,W-2*padX),z=18;"
    "for(;z>=1;z--){const mpp=40075016.686*Math.cos(latR)/(256*Math.pow(2,z));if(2*Rm/mpp<=availW)break}"
    "W<720&&(z=Math.max(1,z-1)),W<520&&(z=Math.max(1,z-1)),W<420&&(z=Math.max(1,z-1));"
    "z=Math.min(15,Math.max(1,z));try{t.setMaxBounds(null)}catch{}"
    "t.setView(Dt.latLng(i,l),z,{animate:!1})"
    "}catch{try{t.setView([i,l],Math.min(p??11,15),{animate:!1})}catch{}}}"
)

AD_OLD = (
    "function aD(t,e,i,l){if(!t||typeof t.setMaxBounds!=\"function\"||typeof t.setMaxBoundsViscosity!=\"function\")return!1;"
    "const mob=typeof window!=\"undefined\"&&window.matchMedia(\"(max-width:899px)\").matches,"
    "u=mob&&Number(l)>0?Dt.circle([e,i],{radius:Number(l)*1e3}).getBounds().pad(.35):c0().pad(.05),p=qz(t);"
)

AD_NEW = (
    "function aD(t,e,i,l){if(!t||typeof t.setMaxBounds!=\"function\"||typeof t.setMaxBoundsViscosity!=\"function\")return!1;"
    "const mob=typeof window!=\"undefined\"&&window.matchMedia(\"(max-width:899px)\").matches,u=c0().pad(.05),p=qz(t);"
)

AD_SETBOUNDS_OLD = (
    "t.setMinZoom(p),t.setMaxBounds(u),t.setMaxBoundsViscosity(1),!t._searchZoomClampBound)"
)

AD_SETBOUNDS_NEW = (
    "t.setMinZoom(p),mob?(t.setMaxBounds(null),t.setMaxBoundsViscosity(0)):(t.setMaxBounds(u),t.setMaxBoundsViscosity(1)),!t._searchZoomClampBound)"
)

REFIT_OLD = (
    "const streleRefitMap=()=>{d.invalidateSize(!0);if(d.getSize().x<20)return;cw(d,w,e,i,u.length,d._searchMinZoom,l),aD(d,e,i,l),p._mapFitted=!0};"
)

REFIT_NEW = (
    "const streleRefitMap=()=>{d.invalidateSize(!0);if(d.getSize().x<20)return;cw(d,w,e,i,u.length,d._searchMinZoom,l);"
    "mob||aD(d,e,i,l);p._mapFitted=!0};"
)

NDMOBILE_REFIT_OLD = (
    "const h=t._streleEl;h&&h._mapCoords&&requestAnimationFrame(()=>{"
    "cw(t,null,h._mapCoords.lat,h._mapCoords.lon,0,t._searchMinZoom,h._mapRadiusKm),aD(t,h._mapCoords.lat,h._mapCoords.lon,h._mapRadiusKm)})}),"
)

NDMOBILE_REFIT_NEW = (
    "const h=t._streleEl;h&&h._mapCoords&&requestAnimationFrame(()=>{"
    "cw(t,null,h._mapCoords.lat,h._mapCoords.lon,0,t._searchMinZoom,h._mapRadiusKm)}),"
    "setTimeout(()=>{const h2=t._streleEl;h2&&h2._mapCoords&&cw(t,null,h2._mapCoords.lat,h2._mapCoords.lon,0,t._searchMinZoom,h2._mapRadiusKm)},300)}),"
)


def main() -> None:
    s = JS.read_text()
    for old, new, label in [
        (CW_OLD, CW_NEW, "cw width zoom"),
        (AD_OLD, AD_NEW, "aD bounds header"),
        (AD_SETBOUNDS_OLD, AD_SETBOUNDS_NEW, "aD skip maxBounds mobile"),
        (REFIT_OLD, REFIT_NEW, "refit skip aD mobile"),
        (NDMOBILE_REFIT_OLD, NDMOBILE_REFIT_NEW, "nDMobile refit only cw"),
    ]:
        if old in s:
            s = s.replace(old, new, 1)
            print(f"patched: {label}")
        elif new[:40] in s:
            print(f"skip: {label}")
        else:
            raise SystemExit(f"pattern not found: {label}")
    JS.write_text(s)
    print("done")


if __name__ == "__main__":
    main()
