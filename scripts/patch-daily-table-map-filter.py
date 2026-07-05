#!/usr/bin/env python3
"""Fix daily table row click: filter map by day, toggle back to full period."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

OLD_MB = (
    'function mB(){const t=document.querySelector(".daily-table tbody");!t||!oe.searchResult||'
    '(t.querySelectorAll("tr[data-day]").forEach(e=>{e.addEventListener("click",i=>{'
    'if(i.target.closest(".btn-hourly-chart"))return;const l=e.dataset.day;'
    'pB(oe.selectedMapDay===l?null:l)}),e.addEventListener("keydown",i=>{'
    'i.target.closest(".btn-hourly-chart")||(i.key==="Enter"||i.key===" ")&&'
    '(i.preventDefault(),e.click())})}),t.querySelectorAll(".btn-hourly-chart").forEach(e=>{'
    'e.addEventListener("click",i=>{i.stopPropagation(),gB(e.dataset.day)})}))}'
)

NEW_MB = (
    "function mB(){if(window.__streleDailyTableBound)return;window.__streleDailyTableBound=1;"
    'document.addEventListener("click",e=>{const i=e.target.closest(".btn-hourly-chart");'
    "if(i&&oe.searchResult&&oe.view===\"results\"){e.stopPropagation(),gB(i.dataset.day);return}"
    'const t=e.target.closest(".daily-table tbody tr[data-day]");'
    'if(!t||!oe.searchResult||oe.view!=="results")return;if(e.target.closest(".btn-hourly-chart"))return;'
    "const l=t.dataset.day;pB(oe.selectedMapDay===l?null:l)},!0);"
    'document.addEventListener("keydown",e=>{if(e.key!=="Enter"&&e.key!==" ")return;'
    'const t=e.target.closest(".daily-table tbody tr[data-day]");'
    'if(!t||!oe.searchResult||oe.view!=="results")return;if(e.target.closest(".btn-hourly-chart"))return;'
    "e.preventDefault();const l=t.dataset.day;pB(oe.selectedMapDay===l?null:l)})}"
)

OLD_ENSURE = (
    "function streleEnsureResultsMap(){if(oe.view!==\"results\"||!oe.searchResult)return;"
    'const t=document.getElementById("strike-map");if(t&&t._leafletMap){t._leafletMap.invalidateSize(!0);'
    "const k=oe.mapStrikeCache.period||oe.searchResult.strikes||[];"
    "t._updateStrikes&&requestAnimationFrame(()=>t._updateStrikes(k,{refit:!0}));return}"
    'const e=()=>{const i=document.getElementById("strike-map");if(!i)return;'
    "const l=i.getBoundingClientRect();if(l.width<20||l.height<20){requestAnimationFrame(e);return}"
    "streleMountResultsMapSync();const u=i._leafletMap,k=oe.mapStrikeCache.period||oe.searchResult.strikes||[];"
    "u&&requestAnimationFrame(()=>{u.invalidateSize(!0),u.fire(\"resize\"),"
    "i._updateStrikes&&setTimeout(()=>i._updateStrikes(k,{refit:!0}),200)})};requestAnimationFrame(e)}"
)

NEW_ENSURE = (
    "function streleEnsureResultsMap(){if(oe.view!==\"results\"||!oe.searchResult)return;"
    'const t=document.getElementById("strike-map");if(t&&t._leafletMap){t._leafletMap.invalidateSize(!0);'
    "requestAnimationFrame(()=>YP());return}"
    'const e=()=>{const i=document.getElementById("strike-map");if(!i)return;'
    "const l=i.getBoundingClientRect();if(l.width<20||l.height<20){requestAnimationFrame(e);return}"
    "streleMountResultsMapSync();const u=i._leafletMap;"
    "u&&requestAnimationFrame(()=>{u.invalidateSize(!0),u.fire(\"resize\"),YP()})};requestAnimationFrame(e)}"
)

OLD_MOUNT = (
    'uD("strike-map",{lat:t.lat,lon:t.lon,radiusKm:t.radius_km,strikes:e}),mB()}'
)

NEW_MOUNT = (
    'uD("strike-map",{lat:t.lat,lon:t.lon,radiusKm:t.radius_km,strikes:e}),mB()}'
)

OLD_ZI = (
    'oe.view==="results"&&oe.searchResult&&requestAnimationFrame(()=>{streleEnsureResultsMap(),YP(),JP()})'
)

NEW_ZI = (
    'oe.view==="results"&&oe.searchResult&&requestAnimationFrame(()=>{mB(),streleEnsureResultsMap(),YP(),JP()})'
)


def main() -> None:
    s = JS.read_text()

    if OLD_MB in s:
        s = s.replace(OLD_MB, NEW_MB, 1)
        print("patched: mB delegation")
    elif "window.__streleDailyTableBound" in s:
        print("skip: mB already delegated")
    else:
        raise SystemExit("mB pattern not found")

    if OLD_ENSURE in s:
        s = s.replace(OLD_ENSURE, NEW_ENSURE, 1)
        print("patched: streleEnsureResultsMap respects selectedMapDay")
    elif "requestAnimationFrame(()=>YP());return}" in s[s.find("function streleEnsureResultsMap"):s.find("function streleEnsureResultsMap")+400]:
        print("skip: streleEnsureResultsMap already patched")
    else:
        raise SystemExit("streleEnsureResultsMap pattern not found")

    if OLD_ZI in s:
        s = s.replace(OLD_ZI, NEW_ZI, 1)
        print("patched: zi results init mB")
    else:
        print("skip: zi results hook")

    JS.write_text(s)
    print("done")


if __name__ == "__main__":
    main()
