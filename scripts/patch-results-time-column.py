#!/usr/bin/env python3
"""Results daily table: Čas najbližje — samo ura (brez datuma)."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist/assets/index-DijleoXU.js"

IS_FN = (
    'function IS(t){if(!t)return"—";const e=new Date(t);'
    'return Number.isNaN(e.getTime())?String(t):`${ca(t)}, ${Dz(e)}`}'
)
IS_PLUS_ISU = IS_FN + (
    'function ISu(t){if(!t)return"—";const e=new Date(t);'
    'return Number.isNaN(e.getTime())?String(t):Dz(e)}'
)

# Broken first attempt used zS — collides with const zS="strelko_map_layers"
BROKEN_ZS_FN = (
    'function zS(t){if(!t)return"—";const e=new Date(t);'
    'return Number.isNaN(e.getTime())?String(t):Dz(e)}'
)

OLD_TD = '<td>${fi(IS(p.cas_najblizje_strele))}</td>'
BROKEN_TD = '<td>${fi(zS(p.cas_najblizje_strele))}</td>'
NEW_TD = '<td>${fi(ISu(p.cas_najblizje_strele))}</td>'


def main() -> None:
    js = JS.read_text(encoding="utf-8")

    if NEW_TD in js:
        print("JS: time column already ISu")
    elif BROKEN_TD in js:
        js = js.replace(BROKEN_TD, NEW_TD, 1)
        print("JS: Čas najbližje zS → ISu")
    elif OLD_TD in js:
        js = js.replace(OLD_TD, NEW_TD, 1)
        print("JS: Čas najbližje IS → ISu")
    else:
        raise SystemExit("cas_najblizje table cell pattern not found")

    if "function ISu(t)" in js:
        print("JS: ISu already defined")
    elif BROKEN_ZS_FN in js:
        js = js.replace(BROKEN_ZS_FN, (
            'function ISu(t){if(!t)return"—";const e=new Date(t);'
            'return Number.isNaN(e.getTime())?String(t):Dz(e)}'
        ), 1)
        print("JS: renamed zS → ISu (fix collision)")
    elif IS_FN in js:
        js = js.replace(IS_FN, IS_PLUS_ISU, 1)
        print("JS: added ISu() helper")
    else:
        raise SystemExit("IS() pattern not found")

    JS.write_text(js, encoding="utf-8")
    print(f"Patched {JS.name}")


if __name__ == "__main__":
    main()
