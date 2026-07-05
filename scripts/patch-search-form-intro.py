#!/usr/bin/env python3
"""Update location search form intro copy."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"
PATCH_ZAV = Path(__file__).resolve().parents[1] / "scripts/patch-zavarovalnica-intro.py"

OLD = (
    "<p class=\"search-card-intro\">Vnesite naslov, kjer je nastala škoda, izberite radij in obdobje pregleda. "
    "Po kliku na gumb se bodo prikazani zaznani udari strel v okolici izbrane lokacije.</p>"
)

NEW = (
    "<p class=\"search-card-intro\">Vnesite naslov, izberite radij in obdobje pregleda. "
    "Po kliku na gumb se bodo prikazali udari strel v okolici izbrane lokacije.</p>"
)


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    if OLD in js:
        js = js.replace(OLD, NEW, 1)
        JS.write_text(js, encoding="utf-8")
        print("Patched search form intro in JS")
    elif NEW in js:
        print("JS already patched")
    else:
        raise SystemExit("Could not find search-card-intro text to patch")

    zav = PATCH_ZAV.read_text(encoding="utf-8")
    if OLD in zav:
        PATCH_ZAV.write_text(zav.replace(OLD, NEW, 1), encoding="utf-8")
        print("Updated patch-zavarovalnica-intro.py")


if __name__ == "__main__":
    main()
