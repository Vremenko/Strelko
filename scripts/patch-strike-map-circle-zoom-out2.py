#!/usr/bin/env python3
"""Strike map: use Leaflet getBoundsZoom + extra margin for full circle."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

CW_OLD = (
    "function cw(t,e,i,l,u,p,d){try{t.invalidateSize(!0);const H0=t._streleEl||t.getContainer(),R=H0.getBoundingClientRect(),"
    "W=Math.max(1,Math.round(R.width||t.getSize().x)),H=Math.max(1,Math.round(R.height||t.getSize().y)),"
    "o=Number(d)>0?Number(d):10,Rm=o*1e3,latR=i*Math.PI/180,"
    "padX=Math.max(64,Math.round(W*.2)),padY=Math.max(48,Math.round(H*.12)),"
    "availW=Math.max(72,W-2*padX),availH=Math.max(72,H-2*padY-36),z=18;"
    "for(;z>=1;z--){const mpp=40075016.686*Math.cos(latR)/(256*Math.pow(2,z)),dPx=2*Rm/mpp;"
    "if(dPx<=availW*.92&&dPx<=availH*.92)break}"
    "W<900&&(z=Math.max(1,z-1)),W<720&&(z=Math.max(1,z-1)),W<520&&(z=Math.max(1,z-1));"
    "z=Math.min(15,Math.max(1,z));try{t.setMaxBounds(null)}catch{}t.setView(Dt.latLng(i,l),z,{animate:!1})"
    "}catch{try{t.setView([i,l],Math.min(p??11,15),{animate:!1})}catch{}}}"
)

CW_NEW = (
    "function cw(t,e,i,l,u,p,d){try{t.invalidateSize(!0);"
    "const mob=typeof window!=\"undefined\"&&window.matchMedia(\"(max-width:899px)\").matches,"
    "o=Number(d)>0?Number(d):10,b=Dt.circle([i,l],{radius:o*1e3}).getBounds().pad(mob?.18:.1),"
    "W=Math.max(1,t.getSize().x),H=Math.max(1,t.getSize().y),"
    "px=Math.max(80,Math.round(W*(mob?.24:.14))),py=Math.max(60,Math.round(H*(mob?.18:.1)));"
    "let z=t.getBoundsZoom(b,!1,Dt.point(px,py));"
    "Number.isFinite(z)||(z=11);"
    "if(mob){const latR=i*Math.PI/180,Rm=o*1e3,aw=Math.max(100,W-2*px);"
    "for(let z2=z;z2>=1;z2--){const mpp=40075016.686*Math.cos(latR)/(256*Math.pow(2,z2));"
    "if(2*Rm/mpp<=aw*.85){z=Math.min(z,z2);break}}"
    "z=Math.max(1,z-2)}"
    "z=Math.min(15,Math.max(1,z));try{t.setMaxBounds(null)}catch{}"
    "t.setView(Dt.latLng(i,l),z,{animate:!1})"
    "}catch{try{t.setView([i,l],Math.min(p??11,15),{animate:!1})}catch{}}}"
)


def main() -> None:
    s = JS.read_text()
    if CW_OLD in s:
        s = s.replace(CW_OLD, CW_NEW, 1)
        JS.write_text(s)
        print("patched: cw getBoundsZoom")
    elif "getBoundsZoom(b,!1" in s:
        print("skip: already patched")
    else:
        raise SystemExit("cw pattern not found")
    print("done")


if __name__ == "__main__":
    main()
