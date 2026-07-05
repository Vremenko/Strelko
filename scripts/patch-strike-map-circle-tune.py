#!/usr/bin/env python3
"""Strike map: tune zoom — full circle visible but not too far out."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

CW_OLD = (
    "function cw(t,e,i,l,u,p,d){try{const mob=typeof window!=\"undefined\"&&window.matchMedia(\"(max-width:899px)\").matches,host=t._streleEl||t.getContainer(),o=Number(d)>0?Number(d):10,b=Dt.circle([i,l],{radius:o*1e3}).getBounds().pad(mob?0.22:0.12);t.invalidateSize(!0);const rr=host.getBoundingClientRect(),W=Math.max(1,Math.round(rr.width)),H=Math.max(1,Math.round(rr.height));if(W<20||H<20)return;const px=Math.max(72,Math.round(W*(mob?0.22:0.12))),py=Math.max(56,Math.round(H*(mob?0.16:0.1)));try{t.setMaxBounds(null)}catch{}t.fitBounds(b,{animate:!1,maxZoom:15,paddingTopLeft:[px,py],paddingBottomRight:[px,py+48]});let z=t.getZoom();mob&&(z=Math.max(1,z-3));z=Math.min(15,Math.max(1,z));t.setView(Dt.latLng(i,l),z,{animate:!1});host.setAttribute(\"data-strele-zoom\",String(z))}catch{try{t.setView([i,l],mob?8:Math.min(p??11,15),{animate:!1})}catch{}}}"
)

CW_NEW = (
    "function cw(t,e,i,l,u,p,d){try{const mob=typeof window!=\"undefined\"&&window.matchMedia(\"(max-width:899px)\").matches,host=t._streleEl||t.getContainer(),o=Number(d)>0?Number(d):10,b=Dt.circle([i,l],{radius:o*1e3}).getBounds().pad(mob?0.1:0.08);t.invalidateSize(!0);const rr=host.getBoundingClientRect(),W=Math.max(1,Math.round(rr.width)),H=Math.max(1,Math.round(rr.height));if(W<20||H<20)return;const px=Math.max(52,Math.round(W*(mob?0.14:0.1))),py=Math.max(44,Math.round(H*(mob?0.12:0.08)));try{t.setMaxBounds(null)}catch{}t.fitBounds(b,{animate:!1,maxZoom:15,paddingTopLeft:[px,py],paddingBottomRight:[px,py+36]});let z=t.getZoom();mob&&(z=Math.max(1,z-1));z=Math.min(15,Math.max(1,z));t.setView(Dt.latLng(i,l),z,{animate:!1});host.setAttribute(\"data-strele-zoom\",String(z))}catch{try{t.setView([i,l],mob?10:Math.min(p??11,15),{animate:!1})}catch{}}}"
)

UD_OLD = "d._streleEl=p,d.setView([e,i],mob?8:11,{animate:!1}),mob?nDMobile(d):nD(d),"
UD_NEW = "d._streleEl=p,d.setView([e,i],mob?10:11,{animate:!1}),mob?nDMobile(d):nD(d),"


def main() -> None:
    s = JS.read_text()
    for old, new, label in [
        (CW_OLD, CW_NEW, "cw tuned zoom"),
        (UD_OLD, UD_NEW, "uD initial zoom 10"),
    ]:
        if old in s:
            s = s.replace(old, new, 1)
            print(f"patched: {label}")
        elif new[:30] in s:
            print(f"skip: {label}")
        else:
            raise SystemExit(f"pattern not found: {label}")
    JS.write_text(s)
    print("done")


if __name__ == "__main__":
    main()
