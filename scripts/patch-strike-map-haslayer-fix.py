#!/usr/bin/env python3
"""Fix strike map: streleMobB LayerGroup, guard aD/Gz, cleanup layer panel."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

OLD_STRELEMOBB = (
    "function streleMobB(){const e=Dt.layerGroup();let t=LS,i=null;const l=()=>{e.clearLayers(),i=streleMobT(t),i.addTo(e)};"
    "return e.setStyle=u=>{t=(String(u).match(/\\/maps\\/([^/]+)\\//)||[])[1]||t,e._map&&l()},"
    "e.addTo=function(u){return Dt.layerGroup.prototype.addTo.call(e,u),l(),e},e.on=function(u,p){return l(),i.on(u,p),e},"
    "e.getContainer=function(){return i?i.getContainer():null},e}"
)

NEW_STRELEMOBB = (
    "function streleMobB(){const e=Dt.layerGroup();let t=LS;const i=()=>{e.clearLayers(),streleMobT(t).addTo(e)};"
    "return i(),e.setStyle=l=>{const u=(String(l).match(/\\/maps\\/([^/]+)\\//)||[])[1];u&&(t=u,e._map&&i())},e}"
)

OLD_UD_START = (
    'function uD(t,{lat:e,lon:i,radiusKm:l,strikes:u}){const p=document.getElementById(t);if(!p)return null;'
    "p._leafletMap&&(p._leafletMap.remove(),p._leafletMap=null);"
)

NEW_UD_START = (
    'function uD(t,{lat:e,lon:i,radiusKm:l,strikes:u}){const p=document.getElementById(t);if(!p)return null;'
    "document.querySelectorAll(\".leaflet-layers-panel.strike-map-layers-panel\").forEach(l=>{var u;((u=l.parentNode)==null?void 0:u.removeChild)&&l.parentNode.removeChild(l)});"
    "p._leafletMap&&(p._leafletMap.remove(),p._leafletMap=null);"
)

OLD_AD = (
    "function aD(t,e,i,l){const u=c0().pad(.05),p=qz(t);if(p==null)return!1;"
    "if(t._searchMinZoom=p,t._searchCenter=Dt.latLng(e,i),t._searchLat=e,t._searchLon=i,t._searchRadiusKm=l,t.setMinZoom(p),t.setMaxBounds(u),t.setMaxBoundsViscosity(1),"
)

NEW_AD = (
    "function aD(t,e,i,l){if(!t||typeof t.setMaxBounds!=\"function\"||typeof t.setMaxBoundsViscosity!=\"function\")return!1;"
    "const u=c0().pad(.05),p=qz(t);if(p==null)return!1;"
    "if(t._searchMinZoom=p,t._searchCenter=Dt.latLng(e,i),t._searchLat=e,t._searchLon=i,t._searchRadiusKm=l,t.setMinZoom(p),t.setMaxBounds(u),t.setMaxBoundsViscosity(1),"
)

OLD_GZ = (
    "function Gz(t){if(!(t._searchMinZoom==null||t._applyingSearchLimits)){t._applyingSearchLimits=!0;try{"
    "const e=c0().pad(.05);t.setMinZoom(t._searchMinZoom),t.setMaxBounds(e),t.setMaxBoundsViscosity(1)}finally{t._applyingSearchLimits=!1}}}"
)

NEW_GZ = (
    "function Gz(t){if(!t||typeof t.setMaxBoundsViscosity!=\"function\"||t._searchMinZoom==null||t._applyingSearchLimits)return;"
    "t._applyingSearchLimits=!0;try{const e=c0().pad(.05);t.setMinZoom(t._searchMinZoom),t.setMaxBounds(e),t.setMaxBoundsViscosity(1)}finally{t._applyingSearchLimits=!1}}"
)

OLD_NDMOBILE_END = "rD(t,u),iD(t,u),qu(e),u}"

NEW_NDMOBILE_END = (
    "rD(t,u),p.baseLayer===Lc||u.meteoinfoBase.addTo(t),p.labelsOn&&(t.hasLayer(u.krajiMeje)||u.krajiMeje.addTo(t),Yp(t,u)),"
    "iD(t,u),qu(e),u}"
)


def main() -> None:
    s = JS.read_text()

    if OLD_STRELEMOBB in s:
        s = s.replace(OLD_STRELEMOBB, NEW_STRELEMOBB, 1)
        print("patched: streleMobB")
    elif "e.addTo=function(u){return Dt.layerGroup.prototype.addTo.call(e,u)" in s:
        raise SystemExit("streleMobB pattern mismatch")
    else:
        print("skip: streleMobB")

    for old, new, label in [
        (OLD_UD_START, NEW_UD_START, "uD panel cleanup"),
        (OLD_AD, NEW_AD, "aD guard"),
        (OLD_GZ, NEW_GZ, "Gz guard"),
    ]:
        if old in s:
            s = s.replace(old, new, 1)
            print(f"patched: {label}")
        elif new.split("(")[0] in s and label in ("aD guard", "Gz guard"):
            print(f"skip: {label}")
        elif label == "uD panel cleanup" and "strike-map-layers-panel" in s[s.find("function uD"):s.find("function uD")+400]:
            print(f"skip: {label}")
        else:
            raise SystemExit(f"not found: {label}")

    # nDMobile: ensure base layer registered with map before iD (fixes hasLayer on null)
    old_nd = (
        "p.baseLayer===Lc?u.satellite.addTo(t):u.meteoinfoBase.addTo(t),p.labelsOn&&(u.krajiMeje.addTo(t),Yp(t,u)),"
        "rD(t,u),iD(t,u),qu(e),u}"
    )
    new_nd = (
        "p.baseLayer===Lc?u.satellite.addTo(t):u.meteoinfoBase.addTo(t),p.labelsOn&&(u.krajiMeje.addTo(t),Yp(t,u)),"
        "rD(t,u),iD(t,u),qu(e),u}"
    )
    # Only add duplicate add if we change init order - use different approach:
    # Register both base layers on map before control init - actually Leaflet only wants one visible.
    # Better: delay iD
    old_iD = "rD(t,u),iD(t,u),qu(e),u}function uD"
    new_iD = "rD(t,u),requestAnimationFrame(()=>{t._container&&t._container.isConnected&&iD(t,u)}),qu(e),u}function uD"
    if old_iD in s and "requestAnimationFrame(()=>{t._container&&t._container.isConnected&&iD(t,u)})" not in s:
        s = s.replace(old_iD, new_iD, 1)
        print("patched: nDMobile delayed iD")

    JS.write_text(s)
    print("done")


if __name__ == "__main__":
    main()
