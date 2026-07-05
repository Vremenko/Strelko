#!/usr/bin/env python3
"""Mobile strike map: layer controls (raster) + fit view to full search circle."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

OLD_NDMobile = (
    'function nDMobile(t){t.createPane(cv);const i=t.getPane(cv);'
    'i&&(i.style.zIndex="460",i.style.pointerEvents="none");'
    'Dt.tileLayer("https://api.maptiler.com/maps/"+LS+"/{z}/{x}/{y}.png?key="+'
    'encodeURIComponent(l0),{tileSize:512,zoomOffset:-1,maxZoom:20,attribution:$z}).addTo(t);'
    "const e={baseLayer:tl,mapTheme:\"dark\",labelsOn:!1,bordersLayer:null};return rD(t,e),e}"
)

MOB_HELPERS = (
    'function streleMobT(e){return Dt.tileLayer("https://api.maptiler.com/maps/"+e+"/{z}/{x}/{y}.png?key="+'
    'encodeURIComponent(l0),{tileSize:512,zoomOffset:-1,maxZoom:20,attribution:$z})}'
    "function streleMobB(){const e=Dt.layerGroup();let t=LS,i=null;const l=()=>{e.clearLayers(),i=streleMobT(t),i.addTo(e)};"
    "return e.setStyle=u=>{t=(String(u).match(/\\/maps\\/([^/]+)\\//)||[])[1]||t,e._map&&l()},"
    "e.addTo=function(u){return Dt.layerGroup.prototype.addTo.call(e,u),l(),e},e.on=function(u,p){return l(),i.on(u,p),e},"
    "e.getContainer=function(){return i?i.getContainer():null},e}"
    "function streleMobL(e){return Dt.tileLayer("
    '"https://api.maptiler.com/maps/"+e+"/{z}/{x}/{y}.png?key="+encodeURIComponent(l0),'
    "{pane:uv,tileSize:512,zoomOffset:-1,maxZoom:20,opacity:.92})}"
)

NEW_NDMobile = (
    MOB_HELPERS
    + "function nDMobile(t){const e=t.getContainer();t.createPane(uv);const i=t.getPane(uv);"
    'i&&(i.style.zIndex="450",i.style.pointerEvents="none"),t.createPane(cv);const l=t.getPane(cv);'
    'l&&(l.style.zIndex="460",l.style.pointerEvents="none");'
    "const u={baseLayer:tl,mapTheme:\"dark\",labelsOn:!0,bordersLayer:null,krajiMeje:Dt.layerGroup(),"
    "krajiMejeDark:null,krajiMejeLight:null,meteoinfoBase:null,satellite:null},p=Yz();"
    "u.satellite=Xz(),u.meteoinfoBase=streleMobB(),u.krajiMejeDark=streleMobL(Oz),u.krajiMejeLight=streleMobL(Fz),"
    "u.baseLayer=p.baseLayer,u.mapTheme=p.mapTheme,u.labelsOn=p.labelsOn,u.meteoinfoBase.setStyle(Vg(DS(u.mapTheme))),"
    "p.baseLayer===Lc?u.satellite.addTo(t):u.meteoinfoBase.addTo(t),p.labelsOn&&(u.krajiMeje.addTo(t),Yp(t,u)),"
    "rD(t,u),iD(t,u),qu(e),u}"
)

OLD_CW = (
    "function cw(t,e,i,l,u,p){u>0?t.fitBounds(e.getBounds().pad(.15),{animate:!1,maxZoom:15}):"
    "t.setView([i,l],p??11,{animate:!1}),p!=null&&t.getZoom()<p&&t.setZoom(p,{animate:!1})}"
)

NEW_CW = (
    "function cw(t,e,i,l,u,p,d){let o=e.getBounds();d>0&&o.extend(Dt.circle([i,l],{radius:d*1e3}).getBounds());"
    "o.isValid()||(o=Dt.circle([i,l],{radius:d*1e3}).getBounds()),t.fitBounds(o.pad(.18),{animate:!1,maxZoom:15})}"
)

OLD_CW_CALL = "cw(d,w,e,i,u.length,k),p._mapFitted=!0"
NEW_CW_CALL = "cw(d,w,e,i,u.length,k,l),p._mapFitted=!0"


def main() -> None:
    s = JS.read_text()

    if "function streleMobB(" in s and "e.addTo=function(u)" not in s:
        i = s.find("function streleMobB(")
        j = s.find("function nDMobile(", i)
        s = s[:i] + MOB_HELPERS.split("function nDMobile")[0].rstrip() + s[j:]
        print("JS: streleMobB upgraded to LayerGroup")
    elif "function streleMobB(" not in s:
        if OLD_NDMobile not in s:
            raise SystemExit("nDMobile pattern not found")
        s = s.replace(OLD_NDMobile, NEW_NDMobile, 1)
        print("JS: nDMobile layers patched")
    else:
        print("JS: nDMobile layers already present")

    if OLD_CW in s:
        s = s.replace(OLD_CW, NEW_CW, 1)
        print("JS: cw circle fit patched")
    elif "o.extend(Dt.circle([i,l]" in s:
        print("JS: cw already patched")
    else:
        raise SystemExit("cw pattern not found")

    if OLD_CW_CALL in s:
        s = s.replace(OLD_CW_CALL, NEW_CW_CALL, 1)
        print("JS: cw call patched")
    elif NEW_CW_CALL.split(",")[0] in s:
        print("JS: cw call already patched")

    JS.write_text(s)
    print("done")


if __name__ == "__main__":
    main()
