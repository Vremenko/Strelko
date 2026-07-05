#!/usr/bin/env python3
"""Default strike-map base layer to satellite imagery on first load."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

REPLACEMENTS = [
    ('if(!t)return{baseLayer:tl,mapTheme:"dark",labelsOn:!0}', 'if(!t)return{baseLayer:Lc,mapTheme:"dark",labelsOn:!0}'),
    ('const u={baseLayer:tl,mapTheme:"dark",labelsOn:!0,bordersLayer:null,krajiMeje:Dt.layerGroup()', 'const u={baseLayer:Lc,mapTheme:"dark",labelsOn:!0,bordersLayer:null,krajiMeje:Dt.layerGroup()'),
    ('p=Yz()||{baseLayer:tl,mapTheme:"dark",labelsOn:!0}', 'p=Yz()||{baseLayer:Lc,mapTheme:"dark",labelsOn:!0}'),
]


def main() -> None:
    s = JS.read_text()
    for old, new in REPLACEMENTS:
        count = s.count(old)
        if count == 0:
            if new.split("{")[0] in s:
                print(f"skip (already): {old[:50]}...")
            else:
                raise SystemExit(f"pattern not found: {old[:80]}")
        else:
            s = s.replace(old, new)
            print(f"patched x{count}: {old[:50]}...")
    JS.write_text(s)
    print("done")


if __name__ == "__main__":
    main()
