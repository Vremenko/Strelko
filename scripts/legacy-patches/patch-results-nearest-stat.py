#!/usr/bin/env python3
"""Third results stat box: nearest strike distance instead of remaining credits."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

OLD_PERIOD_TAIL = (
    ',l=t.period_days??$P,u=`Obdobje: ${CS(t.date_from,t.date_to)} (${l} dni) · radij ${t.radius_km} km`;return`'
)

# reduce in const chain — no reassignment (const n + for-loop broke _B())
NEW_PERIOD_TAIL = (
    ',l=t.period_days??$P,u=`Obdobje: ${CS(t.date_from,t.date_to)} (${l} dni) · radij ${t.radius_km} km`,'
    "nearestKm=t.daily.reduce((m,p)=>p.oddaljenost_najblizje_km!=null&&"
    "(m==null||p.oddaljenost_najblizje_km<m)?p.oddaljenost_najblizje_km:m,null);return`"
)

BROKEN_PERIOD_TAIL = (
    ',l=t.period_days??$P,u=`Obdobje: ${CS(t.date_from,t.date_to)} (${l} dni) · radij ${t.radius_km} km`,'
    "n=null;for(const p of t.daily)p.oddaljenost_najblizje_km!=null&&"
    "(n=n==null||p.oddaljenost_najblizje_km<n?p.oddaljenost_najblizje_km:n);return`"
)

OLD_STAT = (
    '        ${oe.user?`<div class="stat-box"><div class="num">${slNum(t.credits_remaining)}</div>'
    '<div class="lbl">Preostali krediti</div></div>`:""}'
)

NEW_STAT = (
    '        <div class="stat-box"><div class="num">${nearestKm!=null?a0(nearestKm):"—"}</div>'
    '<div class="lbl">Najbližji udar</div></div>'
)

OLD_STAT_N = (
    '        <div class="stat-box"><div class="num">${n!=null?a0(n):"—"}</div>'
    '<div class="lbl">Najbližji udar</div></div>'
)


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    changed = False

    if BROKEN_PERIOD_TAIL in js:
        js = js.replace(BROKEN_PERIOD_TAIL, NEW_PERIOD_TAIL, 1)
        changed = True
        print("Fixed const n reassignment in _B()")
    elif OLD_PERIOD_TAIL in js:
        js = js.replace(OLD_PERIOD_TAIL, NEW_PERIOD_TAIL, 1)
        changed = True
        print("Added nearest-km computation in _B()")
    elif "nearestKm=t.daily.reduce" in js:
        print("_B() nearest computation already ok")
    else:
        raise SystemExit("Could not find _B() period tail to patch")

    if OLD_STAT in js:
        js = js.replace(OLD_STAT, NEW_STAT, 1)
        changed = True
        print("Replaced credits stat box with Najbližji udar")
    elif OLD_STAT_N in js:
        js = js.replace(OLD_STAT_N, NEW_STAT, 1)
        changed = True
        print("Updated stat box to use nearestKm")
    elif NEW_STAT in js:
        print("Stat box already patched")
    else:
        raise SystemExit("Could not find third stat box to patch")

    if changed:
        JS.write_text(js, encoding="utf-8")


if __name__ == "__main__":
    main()
