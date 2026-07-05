#!/usr/bin/env python3
"""Fix map teardown hasLayer crash + streleInitDaysOverlay I undefined."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

OLD_TD = "const tD=Dt.Control.Layers.extend({_expandSafely(){},_initContainer(){},onAdd(t){"
NEW_TD = (
    "const tD=Dt.Control.Layers.extend({_expandSafely(){},_initContainer(){},"
    "_update(){if(!this._map)return;Dt.Control.Layers.prototype._update.call(this)},onAdd(t){"
)

OLD_DESTROY_CALL = (
    'function uD(t,{lat:e,lon:i,radiusKm:l,strikes:u}){const p=document.getElementById(t);if(!p)return null;'
    'document.querySelectorAll(".leaflet-layers-panel.strike-map-layers-panel").forEach(l=>{var u;'
    "((u=l.parentNode)==null?void 0:u.removeChild)&&l.parentNode.removeChild(l)});"
    "p._leafletMap&&(p._leafletMap.remove(),p._leafletMap=null);"
)

STRELE_DESTROY = (
    'function streleDestroyMap(t){if(!t)return;document.querySelectorAll(".leaflet-layers-panel.strike-map-layers-panel").forEach(e=>{'
    "var i;((i=e.parentNode)==null?void 0:i.removeChild)&&e.parentNode.removeChild(e)});"
    "if(t._controls)for(const e of Object.values(t._controls))for(const i of e)try{t.removeControl(i)}catch{}"
    "try{t.off()}catch{}try{t.remove()}catch{}}function uD(t,{lat:e,lon:i,radiusKm:l,strikes:u}){const p=document.getElementById(t);if(!p)return null;"
    "p._leafletMap&&(streleDestroyMap(p._leafletMap),p._leafletMap=null);"
)

OLD_DAYS = "function streleInitDaysOverlay(){if(window.__streleDaysOverlay)return;window.__streleDaysOverlay=1;var t=null,i=null;"
NEW_DAYS = "function streleInitDaysOverlay(){if(window.__streleDaysOverlay)return;window.__streleDaysOverlay=1;var t=null,i=null,I=null;"


def main() -> None:
    s = JS.read_text()

    if "_update(){if(!this._map)return;" not in s:
        if OLD_TD not in s:
            raise SystemExit("tD pattern not found")
        s = s.replace(OLD_TD, NEW_TD, 1)
        print("patched: tD _update guard")
    else:
        print("skip: tD")

    if "function streleDestroyMap(" not in s:
        if OLD_DESTROY_CALL not in s:
            raise SystemExit("uD destroy pattern not found")
        s = s.replace(OLD_DESTROY_CALL, STRELE_DESTROY, 1)
        print("patched: streleDestroyMap")
    else:
        print("skip: streleDestroyMap")

    if OLD_DAYS in s:
        s = s.replace(OLD_DAYS, NEW_DAYS, 1)
        print("patched: streleInitDaysOverlay I")
    elif "var t=null,i=null,I=null" in s:
        print("skip: streleInitDaysOverlay I")
    else:
        raise SystemExit("days overlay pattern not found")

    JS.write_text(s)
    print("done")


if __name__ == "__main__":
    main()
