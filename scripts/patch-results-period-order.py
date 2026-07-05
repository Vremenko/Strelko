#!/usr/bin/env python3
"""Show search-results period line before stat boxes, right under location title."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"
CSS = Path(__file__).resolve().parents[1] / "dist/assets/index-b2ecBo4-.css"

OLD = (
    '      <h3 class="results-panel-title">⚡ Pregled strel – ${fi(t.location_label||"vaša lokacija")}</h3>\n'
    '      <div class="stats-grid">\n'
    '        <div class="stat-box"><div class="num">${slNum(t.total_strikes)}</div><div class="lbl">Skupaj udarov</div></div>\n'
    '        <div class="stat-box"><div class="num">${slNum(t.daily.length)}</div><div class="lbl">Dni z udari</div></div>\n'
    '        ${oe.user?`<div class="stat-box"><div class="num">${slNum(t.credits_remaining)}</div><div class="lbl">Preostali krediti</div></div>`:""}\n'
    '      </div>\n'
    '      <p style="color:var(--muted);font-size:0.85rem">${u}</p>'
)

NEW = (
    '      <h3 class="results-panel-title">⚡ Pregled strel – ${fi(t.location_label||"vaša lokacija")}</h3>\n'
    '      <p class="results-period">${u}</p>\n'
    '      <div class="stats-grid">\n'
    '        <div class="stat-box"><div class="num">${slNum(t.total_strikes)}</div><div class="lbl">Skupaj udarov</div></div>\n'
    '        <div class="stat-box"><div class="num">${slNum(t.daily.length)}</div><div class="lbl">Dni z udari</div></div>\n'
    '        <div class="stat-box"><div class="num">${nearestKm!=null?a0(nearestKm):"—"}</div><div class="lbl">Najbližji udar</div></div>\n'
    '      </div>'
)

CSS_RULE = ".results-period{color:var(--muted);font-size:0.85rem;margin:.35rem 0 0;line-height:1.4}"


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    if OLD in js:
        js = js.replace(OLD, NEW, 1)
        JS.write_text(js, encoding="utf-8")
        print("Patched _B() period order in JS")
    elif NEW.split("\n")[1] in js:
        print("JS already patched")
    else:
        raise SystemExit("Could not find _B() template to patch")

    css = CSS.read_text(encoding="utf-8")
    if ".results-period{" not in css:
        anchor = ".results-panel-title{"
        if anchor not in css:
            raise SystemExit("Could not find .results-panel-title in CSS")
        css = css.replace(anchor, CSS_RULE + anchor, 1)
        CSS.write_text(css, encoding="utf-8")
        print("Added .results-period CSS")
    else:
        print("CSS already patched")


if __name__ == "__main__":
    main()
