#!/usr/bin/env python3
"""Remove (N dni) from results period line on zavarovalnica page."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

OLD = (
    ",l=t.period_days??$P,u=`Obdobje: ${CS(t.date_from,t.date_to)} (${l} dni) · radij ${t.radius_km} km`,"
)
NEW = ",u=`Obdobje: ${CS(t.date_from,t.date_to)} · radij ${t.radius_km} km`,"


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    if NEW in js:
        print("period line already patched")
        return
    if OLD not in js:
        raise SystemExit("Could not find results period line to patch")
    JS.write_text(js.replace(OLD, NEW, 1), encoding="utf-8")
    print("Removed (N dni) from results Obdobje line")


if __name__ == "__main__":
    main()
