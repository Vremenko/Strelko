#!/usr/bin/env python3
"""Mobile strike map: raster MapTiler tiles instead of WebGL (fixes white screen on iOS)."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"
CSS = Path(__file__).resolve().parents[1] / "dist/assets/index-b2ecBo4-.css"

ND_MOBILE = (
    'function nDMobile(t){t.createPane(cv);const i=t.getPane(cv);'
    'i&&(i.style.zIndex="460",i.style.pointerEvents="none");'
    'Dt.tileLayer("https://api.maptiler.com/maps/"+LS+"/{z}/{x}/{y}.png?key="+'
    'encodeURIComponent(l0),{tileSize:512,zoomOffset:-1,maxZoom:20,attribution:$z}).addTo(t);'
    "const e={baseLayer:tl,mapTheme:\"dark\",labelsOn:!1,bordersLayer:null};return rD(t,e),e}"
)

OLD_MOB_DETECT = (
    'const mob=window.matchMedia("(max-width:899px)").matches||"ontouchstart"in window;'
)
NEW_MOB_DETECT = (
    "const mob=window.matchMedia(\"(max-width:899px)\").matches||navigator.maxTouchPoints>0;"
)

OLD_UD = (
    'function uD(t,{lat:e,lon:i,radiusKm:l,strikes:u}){const p=document.getElementById(t);'
    "if(!p)return null;p._leafletMap&&(p._leafletMap.remove(),p._leafletMap=null);"
    "const d=Dt.map(p,{zoomControl:!1,scrollWheelZoom:!0,preferCanvas:!0,worldCopyJump:!1});"
    "p._leafletMap=d,p._mapCoords={lat:e,lon:i},p._mapRadiusKm=l,p._mapFitted=!1,d.setView([e,i],11,{animate:!1}),nD(d),"
)

NEW_UD = (
    ND_MOBILE
    + 'function uD(t,{lat:e,lon:i,radiusKm:l,strikes:u}){const p=document.getElementById(t);'
    "if(!p)return null;p._leafletMap&&(p._leafletMap.remove(),p._leafletMap=null);"
    + NEW_MOB_DETECT
    + "const d=Dt.map(p,{zoomControl:!1,scrollWheelZoom:!0,preferCanvas:!mob,worldCopyJump:!1});"
    "p._leafletMap=d,p._mapCoords={lat:e,lon:i},p._mapRadiusKm=l,p._mapFitted=!1,d.setView([e,i],11,{animate:!1}),"
    "mob?nDMobile(d):nD(d),"
)

OLD_NDMobile_SIMPLE = (
    'function nDMobile(t){Dt.tileLayer("https://api.maptiler.com/maps/"+LS+"/{z}/{x}/{y}.png?key="+'
    'encodeURIComponent(l0),{tileSize:512,zoomOffset:-1,maxZoom:20,attribution:$z}).addTo(t);'
    "const e={baseLayer:tl,mapTheme:\"dark\",labelsOn:!1,bordersLayer:null};return rD(t,e),e}"
)

OLD_ENSURE = (
    "function streleEnsureResultsMap(){if(oe.view!==\"results\"||!oe.searchResult)return;"
    'const t=document.getElementById("strike-map");if(t&&t._leafletMap){t._leafletMap.invalidateSize(!0);return}'
    "streleMountResultsMapSync();"
    'const e=document.getElementById("strike-map");e&&e._leafletMap&&requestAnimationFrame(()=>requestAnimationFrame(()=>e._leafletMap.invalidateSize(!0)))}'
)

NEW_ENSURE = (
    "function streleEnsureResultsMap(){if(oe.view!==\"results\"||!oe.searchResult)return;"
    'const t=document.getElementById("strike-map");if(t&&t._leafletMap){t._leafletMap.invalidateSize(!0);return}'
    "const e=()=>{const i=document.getElementById(\"strike-map\");if(!i)return;"
    "const l=i.getBoundingClientRect();if(l.width<20||l.height<20){requestAnimationFrame(e);return}"
    "streleMountResultsMapSync();const u=i._leafletMap;"
    'u&&requestAnimationFrame(()=>{u.invalidateSize(!0);u.fire("resize")})};requestAnimationFrame(e)}'
)

CSS_STRIKE_MARKER = "/* —— strike map mobile raster —— */"
CSS_ARCHIVE_MARKER = "/* —— archive map mobile height —— */"
CSS_APPEND = """
/* —— strike map mobile raster —— */
@media(max-width:899px){
#strike-map{background:#1a1a1a}
#strike-map.leaflet-container{background:#1a1a1a}
}
/* —— archive map mobile height —— */
@media(max-width:899px){
.archive-map-wrap{min-height:0!important;background:transparent}
.archive-map-iframe{min-height:320px!important;width:100%!important;display:block!important;background:#1a1a1a!important;border:none!important;outline:none!important;box-shadow:none!important}
}
"""


def patch_js(s: str) -> str:
    if OLD_NDMobile_SIMPLE in s:
        s = s.replace(OLD_NDMobile_SIMPLE, ND_MOBILE, 1)
        print("JS: nDMobile upgraded with panes")
    elif "function nDMobile(" not in s:
        if OLD_UD not in s:
            raise SystemExit("uD pattern not found")
        s = s.replace(OLD_UD, NEW_UD, 1)
        print("JS: uD + nDMobile patched")
    else:
        print("JS: nDMobile already present")

    if OLD_MOB_DETECT in s:
        s = s.replace(OLD_MOB_DETECT, NEW_MOB_DETECT, 1)
        print("JS: mobile detect updated")

    if OLD_ENSURE not in s:
        if "l.width<20||l.height<20" in s:
            print("JS: ensure already patched")
        else:
            raise SystemExit("ensure pattern not found")
    else:
        s = s.replace(OLD_ENSURE, NEW_ENSURE, 1)
        print("JS: ensure patched")
    return s


def patch_css(css: str) -> str:
    out = css
    if CSS_STRIKE_MARKER not in out:
        out = out.rstrip() + CSS_APPEND.split(CSS_ARCHIVE_MARKER)[0]
        print("CSS: strike map rules added")
    if CSS_ARCHIVE_MARKER not in out:
        out = out.rstrip() + CSS_APPEND.split(CSS_STRIKE_MARKER)[1]
        print("CSS: archive map height fix added")
    elif CSS_STRIKE_MARKER in css and CSS_ARCHIVE_MARKER in css:
        print("CSS: already patched")
    return out


def main() -> None:
    JS.write_text(patch_js(JS.read_text()))
    CSS.write_text(patch_css(CSS.read_text()))
    print("done")


if __name__ == "__main__":
    main()
