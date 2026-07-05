#!/usr/bin/env python3
"""Fix mobile strike map: mount after DOM settle, no pre-wipe init, iOS-safe dots."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

OLD_UW = (
    "function uw(t,e,i,l){t.clearLayers();const u=Dt.featureGroup();"
    "if(u.addLayer(Dt.marker([i,l])),!e.length)return u;const p=Dt.canvas({padding:.5});"
    "return e.forEach(d=>{const o=Dt.circleMarker([d.lat,d.lon],{renderer:p,radius:4,weight:1,"
    'color:"#1a1a1a",fillColor:"#fbb006",fillOpacity:.95});'
    'o.on("click",()=>{o.bindPopup(cD(d)).openPopup()}),o.addTo(t),u.addLayer(o)}),u}'
)

NEW_UW = (
    "function uw(t,e,i,l){t.clearLayers();const u=Dt.featureGroup();"
    "if(u.addLayer(Dt.marker([i,l])),!e.length)return u;"
    "return e.forEach(d=>{const o=Dt.circleMarker([d.lat,d.lon],{radius:4,weight:1,"
    'color:"#1a1a1a",fillColor:"#fbb006",fillOpacity:.95});'
    'o.on("click",()=>{o.bindPopup(cD(d)).openPopup()}),o.addTo(t),u.addLayer(o)}),u}'
)

OLD_MOUNT = (
    "function streleMountResultsMapSync(){if(!oe.searchResult)return;"
    'const t=oe.searchResult,e=oe.mapStrikeCache.period||t.strikes||[];'
    'uD("strike-map",{lat:t.lat,lon:t.lon,radiusKm:t.radius_km,strikes:e}),mB()}'
)

NEW_MOUNT = (
    "function streleMountResultsMapSync(){if(!oe.searchResult)return;"
    'const t=oe.searchResult,e=oe.mapStrikeCache.period||t.strikes||[];'
    'uD("strike-map",{lat:t.lat,lon:t.lon,radiusKm:t.radius_km,strikes:e}),mB()}'
    "function streleEnsureResultsMap(){if(oe.view!==\"results\"||!oe.searchResult)return;"
    'const t=document.getElementById("strike-map");if(t&&t._leafletMap){t._leafletMap.invalidateSize(!0);return}'
    "streleMountResultsMapSync();"
    'const e=document.getElementById("strike-map");e&&e._leafletMap&&requestAnimationFrame(()=>requestAnimationFrame(()=>e._leafletMap.invalidateSize(!0)))}'
)

OLD_RM_TRY = (
    'oe.view="results",oe.searchPhase="map",zi(),streleMountResultsMapSync()}catch(e){'
)

NEW_RM_TRY = (
    'oe.view="results"}catch(e){'
)

OLD_RM_FINALLY = "}finally{t||(oe.loading=!1,zi())}}}async function completeStrelkoGoogleLogin"

NEW_RM_FINALLY = (
    '}finally{t||(oe.loading=!1,oe.searchPhase=null,zi(),streleEnsureResultsMap())}}}async function completeStrelkoGoogleLogin'
)

OLD_W2_FINALLY = "finally{oe.loading=!1,oe.searchPhase=null,zi()}}async function jB"

NEW_W2_FINALLY = (
    "finally{oe.loading=!1,oe.searchPhase=null,zi(),streleEnsureResultsMap()}}async function jB"
)

OLD_RENDER_MAP = (
    'oe.view==="results"&&oe.searchResult&&requestAnimationFrame(()=>{'
    'const u=document.getElementById("strike-map");'
    "(!u||!u._leafletMap)&&streleMountResultsMapSync(),YP(),JP()})"
)

NEW_RENDER_MAP = (
    'oe.view==="results"&&oe.searchResult&&requestAnimationFrame(()=>{'
    "streleEnsureResultsMap(),YP(),JP()})"
)


def main() -> None:
    s = JS.read_text()
    changed = False

    for old, new, label in [
        (OLD_UW, NEW_UW, "uw"),
        (OLD_MOUNT, NEW_MOUNT, "mount helpers"),
        (OLD_RM_TRY, NEW_RM_TRY, "rM try"),
        (OLD_RM_FINALLY, NEW_RM_FINALLY, "rM finally"),
        (OLD_W2_FINALLY, NEW_W2_FINALLY, "W2 finally"),
        (OLD_RENDER_MAP, NEW_RENDER_MAP, "render map"),
    ]:
        if old not in s:
            if label == "uw" and NEW_UW.split("circleMarker")[0] in s:
                print(f"{label}: already ok")
                continue
            if label == "mount helpers" and "streleEnsureResultsMap" in s:
                print(f"{label}: already ok")
                continue
            if label == "rM try" and NEW_RM_TRY.split("catch")[0] in s:
                print(f"{label}: already ok")
                continue
            raise SystemExit(f"{label}: pattern not found")
        s = s.replace(old, new, 1)
        changed = True
        print(f"{label}: patched")

    if changed:
        JS.write_text(s)
    print("done")


if __name__ == "__main__":
    main()
