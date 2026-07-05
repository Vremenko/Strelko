#!/usr/bin/env python3
"""Strike map: setView zoom from circle diameter; fit before maxBounds."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

CW_OLD = (
    "function cw(t,e,i,l,u,p,d){try{t.invalidateSize(!0);const C=t.getContainer(),R=C.getBoundingClientRect(),S=t.getSize(),"
    "W=Math.round(R.width>0?R.width:S.x),H=Math.round(R.height>0?R.height:S.y),"
    "o=Number(d)>0?Number(d):10,w=Dt.circle([i,l],{radius:o*1e3}).getBounds().pad(W<520?.16:.08),"
    "x=Math.max(52,Math.round(W*(W<380?.2:W<520?.17:.1))),y=Math.max(40,Math.round(H*.12));"
    "t.fitBounds(w,{animate:!1,maxZoom:15,paddingTopLeft:[x,y],paddingBottomRight:[x,y+48]});"
    "if(W<520){const z=t.getZoom(),dz=W<380?3:W<480?2:1,f=Math.max(t.getMinZoom(),z-dz);"
    "f<z&&t.setZoom(f,{animate:!1})}}catch{try{t.setView([i,l],Math.min(p??11,15),{animate:!1})}catch{}}}"
)

CW_NEW = (
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

LD_OLD = (
    "function lD(t,e,i,l,u){const p=()=>{if(aD(t,e,i,l)){u==null||u(t._searchMinZoom);return}requestAnimationFrame(p)};requestAnimationFrame(p)}"
)

LD_NEW = (
    "function lD(t,e,i,l,u){const p=()=>{t.invalidateSize(!0);"
    "if(t.getSize().x<20||t.getSize().y<20){requestAnimationFrame(p);return}"
    "u==null||u()};requestAnimationFrame(p)}"
)

AD_OLD = (
    "function aD(t,e,i,l){if(!t||typeof t.setMaxBounds!=\"function\"||typeof t.setMaxBoundsViscosity!=\"function\")return!1;const u=c0().pad(.05),p=qz(t);"
)

AD_NEW = (
    "function aD(t,e,i,l){if(!t||typeof t.setMaxBounds!=\"function\"||typeof t.setMaxBoundsViscosity!=\"function\")return!1;"
    "const mob=typeof window!=\"undefined\"&&window.matchMedia(\"(max-width:899px)\").matches,"
    "u=mob&&Number(l)>0?Dt.circle([e,i],{radius:Number(l)*1e3}).getBounds().pad(.35):c0().pad(.05),p=qz(t);"
)

REFIT_OLD = (
    "const streleRefitMap=()=>{d.invalidateSize(!0),cw(d,w,e,i,u.length,d._searchMinZoom,l),p._mapFitted=!0};"
    "return lD(d,e,i,l,k=>{streleRefitMap(),requestAnimationFrame(()=>{streleRefitMap()}),setTimeout(streleRefitMap,200)}),"
)

REFIT_NEW = (
    "d._streleEl=p;const streleRefitMap=()=>{d.invalidateSize(!0);"
    "if(d.getSize().x<20)return;cw(d,w,e,i,u.length,d._searchMinZoom,l),aD(d,e,i,l),p._mapFitted=!0};"
    "return lD(d,e,i,l,()=>{streleRefitMap(),requestAnimationFrame(streleRefitMap),"
    "setTimeout(streleRefitMap,250),setTimeout(streleRefitMap,700)}),"
)

NDMOBILE_OLD = (
    "requestAnimationFrame(()=>{t._container&&t._container.isConnected&&iD(t,u)}),qu(e),u}function streleDestroyMap(t){"
)

NDMOBILE_NEW = (
    "requestAnimationFrame(()=>{t._container&&t._container.isConnected&&iD(t,u);"
    "const h=t._streleEl;h&&h._mapCoords&&requestAnimationFrame(()=>{"
    "cw(t,null,h._mapCoords.lat,h._mapCoords.lon,0,t._searchMinZoom,h._mapRadiusKm),aD(t,h._mapCoords.lat,h._mapCoords.lon,h._mapRadiusKm)})}),"
    "qu(e),u}function streleDestroyMap(t){"
)


def main() -> None:
    s = JS.read_text()
    for old, new, label in [
        (CW_OLD, CW_NEW, "cw setView"),
        (LD_OLD, LD_NEW, "lD size only"),
        (AD_OLD, AD_NEW, "aD mobile bounds"),
        (REFIT_OLD, REFIT_NEW, "refit after cw"),
        (NDMOBILE_OLD, NDMOBILE_NEW, "nDMobile refit"),
    ]:
        if old in s:
            s = s.replace(old, new, 1)
            print(f"patched: {label}")
        elif new[:50] in s:
            print(f"skip: {label}")
        else:
            raise SystemExit(f"pattern not found: {label}")
    JS.write_text(s)
    print("done")


if __name__ == "__main__":
    main()
