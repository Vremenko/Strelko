#!/usr/bin/env python3
"""Show search results immediately after API success; don't block on period strikes preload."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

OLD = (
    "oe.searchResult=await jn.search(e),Ev(e.lat,e.lon),oe.preview=null,hB(),oe.searchPhase=\"map\","
    "t||zi(),await VB(),oe.selectedMapDay=null,oe.hourlyChartDay=null,oe.hourlyChartData=null,"
    "oe.credits={...oe.credits||{},credits_balance:oe.searchResult.credits_remaining},oe.view=\"results\""
)

NEW = (
    "oe.searchResult=await jn.search(e),Ev(e.lat,e.lon),oe.preview=null,hB(),oe.selectedMapDay=null,"
    "oe.hourlyChartDay=null,oe.hourlyChartData=null,"
    "oe.credits={...oe.credits||{},credits_balance:oe.searchResult.credits_remaining},"
    "oe.view=\"results\",oe.searchPhase=\"map\",t||zi();"
    "try{await VB()}catch(_vbErr){console.warn(\"period strikes preload\",_vbErr)}"
)


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    if OLD in js:
        js = js.replace(OLD, NEW, 1)
        JS.write_text(js, encoding="utf-8")
        print("Patched rM() to reveal results before VB()")
    elif "try{await VB()}catch(_vbErr)" in js:
        print("Already patched")
    else:
        raise SystemExit("Could not find rM() search success block")


if __name__ == "__main__":
    main()
