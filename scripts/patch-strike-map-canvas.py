#!/usr/bin/env python3
"""Canvas strike dots + lazy popups; build map under loading overlay before reveal."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

OLD_UW = (
    "function uw(t,e,i,l){t.clearLayers();const u=Dt.featureGroup();"
    "return u.addLayer(Dt.marker([i,l])),e.forEach(p=>{const d=Dt.marker([p.lat,p.lon],{icon:oD});"
    "d.bindPopup(cD(p)),d.addTo(t),u.addLayer(d)}),u}"
)

NEW_UW = (
    "function uw(t,e,i,l){t.clearLayers();const u=Dt.featureGroup();"
    "if(u.addLayer(Dt.marker([i,l])),!e.length)return u;"
    "const p=Dt.canvas({padding:.5});"
    "return e.forEach(d=>{const o=Dt.circleMarker([d.lat,d.lon],{renderer:p,radius:4,weight:1,"
    'color:"#1a1a1a",fillColor:"#fbb006",fillOpacity:.95});'
    'o.on("click",()=>{o.bindPopup(cD(d)).openPopup()}),o.addTo(t),u.addLayer(o)}),u}'
)

OLD_RM_TAIL = (
    'await VB(),oe.selectedMapDay=null,oe.hourlyChartDay=null,oe.hourlyChartData=null,'
    "oe.credits={...oe.credits||{},credits_balance:oe.searchResult.credits_remaining},"
    'oe.view="results"}catch(e){'
)

NEW_RM_TAIL = (
    'await VB(),oe.selectedMapDay=null,oe.hourlyChartDay=null,oe.hourlyChartData=null,'
    "oe.credits={...oe.credits||{},credits_balance:oe.searchResult.credits_remaining},"
    'oe.view="results",oe.searchPhase="map",zi(),'
    "streleMountResultsMapSync()}catch(e){"
)

MOUNT_FN = (
    "function streleMountResultsMapSync(){if(!oe.searchResult)return;"
    'const t=oe.searchResult,e=oe.mapStrikeCache.period||t.strikes||[];'
    'uD("strike-map",{lat:t.lat,lon:t.lon,radiusKm:t.radius_km,strikes:e}),mB()}'
)

OLD_RENDER_MAP = (
    'oe.view==="results"&&oe.searchResult&&requestAnimationFrame(()=>{'
    "const u=oe.searchResult,p=oe.selectedMapDay?oe.mapStrikeCache.days[oe.selectedMapDay]||[]:"
    "oe.mapStrikeCache.period||u.strikes||[];"
    'uD("strike-map",{lat:u.lat,lon:u.lon,radiusKm:u.radius_km,strikes:p}),mB(),YP(),JP()})'
)

NEW_RENDER_MAP = (
    'oe.view==="results"&&oe.searchResult&&requestAnimationFrame(()=>{'
    'const u=document.getElementById("strike-map");'
    "(!u||!u._leafletMap)&&streleMountResultsMapSync(),YP(),JP()})"
)


def main() -> None:
    s = JS.read_text()

    if OLD_UW not in s:
        if NEW_UW.split("circleMarker")[0] in s:
            print("uw already patched")
        else:
            raise SystemExit("uw pattern not found")

    else:
        s = s.replace(OLD_UW, NEW_UW, 1)
        print("uw patched")

    if "function streleMountResultsMapSync" not in s:
        anchor = "function uD("
        if anchor not in s:
            raise SystemExit("uD anchor not found")
        s = s.replace(anchor, MOUNT_FN + anchor, 1)
        print("streleMountResultsMapSync inserted")
    else:
        print("streleMountResultsMapSync already present")

    if OLD_RM_TAIL not in s:
        if 'streleMountResultsMapSync()}catch(e)' in s:
            print("rM already patched")
        else:
            raise SystemExit("rM pattern not found")
    else:
        s = s.replace(OLD_RM_TAIL, NEW_RM_TAIL, 1)
        print("rM patched")

    if OLD_RENDER_MAP not in s:
        if "(!u||!u._leafletMap)&&streleMountResultsMapSync()" in s:
            print("render map already patched")
        else:
            raise SystemExit("render map pattern not found")
    else:
        s = s.replace(OLD_RENDER_MAP, NEW_RENDER_MAP, 1)
        print("render map patched")

    JS.write_text(s)
    print("done")


if __name__ == "__main__":
    main()
