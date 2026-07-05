#!/usr/bin/env python3
"""Match search-results hourly profile panel to statistics embed styling."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"
CSS = Path(__file__).resolve().parents[1] / "dist/assets/index-b2ecBo4-.css"

OLD_KP = (
    'function KP(){if(!oe.hourlyChartDay)return"";const t=oe.hourlyChartLoading;return`\n'
    '    <div class="hourly-chart-panel embed-hourly-panel" id="hourly-chart-panel">\n'
    '      <div class="hourly-chart-head">\n'
    '        <h4>Urni profil – ${fi(ca(oe.hourlyChartDay))}</h4>\n'
    '        <button type="button" class="btn btn-ghost btn-sm" data-action="close-hourly-chart">Zapri</button>\n'
    "      </div>\n"
    '      ${t?\'<p class="hourly-chart-loading">Nalagam urni profil …</p>\':`<div class="hourly-chart-stats stats" id="hourly-chart-stats"></div>\n'
    '             <div class="hourly-chart-wrap chart-wrap" id="hourly-chart-wrap">\n'
    '               <canvas id="hourly-strike-chart"></canvas>\n'
    "             </div>`}\n"
    "    </div>`}"
)

NEW_KP = (
    'function KP(){if(!oe.hourlyChartDay)return"";const t=oe.hourlyChartLoading;return`\n'
    '    <section class="panel results-hourly-panel" id="hourly-chart-panel" data-panel="hourly">\n'
    '      <div class="panel-head">\n'
    '        <div class="panel-head-text">\n'
    "          <h2>Urni profil</h2>\n"
    '          <p class="panel-period">${fi(ca(oe.hourlyChartDay))}</p>\n'
    "        </div>\n"
    "      </div>\n"
    '      ${t?\'<p class="hourly-chart-loading">Nalagam urni profil …</p>\':`<div class="stats" id="hourly-chart-stats"></div>\n'
    '             <div class="chart-wrap hourly-chart-wrap" id="hourly-chart-wrap">\n'
    '               <canvas id="hourly-strike-chart"></canvas>\n'
    "             </div>`}\n"
    "    </section>`}"
)

OLD_L3_OPTS = (
    "options:{events:o?[]:void 0,responsive:!0,maintainAspectRatio:!1,layout:{padding:{top:h(4),right:h(o?4:8)}},"
    "plugins:{legend:{display:!1},tooltip:{enabled:!o,intersect:!1,"
)

NEW_L3_OPTS = (
    "options:{events:o?[]:void 0,responsive:!0,maintainAspectRatio:!1,interaction:{mode:\"index\",intersect:!1},"
    "layout:{padding:{top:h(4),right:h(o?4:8)}},plugins:{legend:{display:!1},tooltip:{enabled:!o,intersect:!1,"
)

OLD_CSS = (
    ".hourly-chart-panel{margin-top:1rem;padding:.9rem .85rem 1rem;border-radius:12px;"
    "border:1px solid rgba(255,255,255,.08);background:var(--bg-card)}"
    ".hourly-chart-head{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-bottom:.65rem}"
    ".hourly-chart-head h4{margin:0;font-size:1rem;font-weight:600;color:var(--text)}"
    ".hourly-chart-loading{margin:0;font-size:.85rem;color:var(--muted)}"
    ".hourly-chart-stats.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr));"
    "gap:.65rem;margin-bottom:.65rem}"
    ".hourly-chart-stats .stat{background:#00000047;border:1px solid rgba(255,255,255,.08);"
    "border-radius:10px;padding:.6rem .75rem;min-width:0}"
    ".hourly-chart-stats .stat .label{color:var(--muted);font-size:.75rem;font-weight:600;"
    "text-transform:uppercase;letter-spacing:.04em;margin-bottom:.25rem}"
    ".hourly-chart-stats .stat .value{font-size:.95rem;font-weight:600;color:var(--text);"
    "line-height:1.35;word-break:break-word}"
    ".hourly-chart-wrap.chart-wrap{position:relative;width:100%;min-width:0;height:240px}"
)

NEW_CSS = (
    "#hourly-chart-panel.panel{margin-top:1rem;background:#333;border:1px solid var(--border);"
    "border-radius:12px;padding:.9rem .85rem 1rem;min-width:0}"
    "#hourly-chart-panel .panel-head{display:flex;flex-wrap:wrap;align-items:flex-start;"
    "justify-content:space-between;gap:.5rem .75rem;margin-bottom:.65rem}"
    "#hourly-chart-panel .panel-head-text{flex:1 1 auto;min-width:0}"
    "#hourly-chart-panel .panel-head-text h2{margin:0;font-size:1rem;font-weight:600;line-height:1.3;color:var(--text)}"
    "#hourly-chart-panel .panel-period{margin:.25rem 0 0;color:var(--muted);font-size:.85rem;line-height:1.45}"
    "#hourly-chart-panel .panel-head-actions{display:flex;flex-wrap:wrap;align-items:center;"
    "justify-content:flex-end;gap:.5rem .75rem;flex:0 1 auto;margin-left:auto;padding-top:.05rem}"
    "#hourly-chart-panel .hourly-chart-loading{margin:0;font-size:.85rem;color:var(--muted)}"
    "#hourly-chart-panel .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr));"
    "gap:.65rem;margin-bottom:.65rem}"
    "#hourly-chart-panel .stat{background:var(--bg-deep);border:1px solid var(--border);"
    "border-radius:10px;padding:.6rem .75rem;min-width:0}"
    "#hourly-chart-panel .stat .label{color:var(--muted);font-size:.75rem;line-height:1.3}"
    "#hourly-chart-panel .stat .value{font-size:clamp(1rem,3.5vw,1.25rem);font-weight:600;"
    "color:var(--accent);line-height:1.25;word-break:break-word}"
    "#hourly-chart-panel .chart-wrap,#hourly-chart-panel .hourly-chart-wrap{position:relative;width:100%;"
    "min-width:0;height:240px}"
)

OLD_MEDIA = "@media(max-width:639px){.hourly-chart-wrap.chart-wrap{height:210px}"
NEW_MEDIA = "@media(max-width:639px){#hourly-chart-panel .chart-wrap{height:210px}"


def main() -> None:
    js = JS.read_text()
    css = CSS.read_text()

    if OLD_KP in js:
        js = js.replace(OLD_KP, NEW_KP, 1)
        print("JS: KP panel markup")
    elif "results-hourly-panel" in js:
        print("JS: KP already patched")
    else:
        raise SystemExit("KP pattern not found")

    if OLD_L3_OPTS in js:
        js = js.replace(OLD_L3_OPTS, NEW_L3_OPTS, 1)
        print("JS: L3 interaction mode")
    elif 'interaction:{mode:"index",intersect:!1}' in js:
        print("JS: L3 already patched")
    else:
        raise SystemExit("L3 options pattern not found")

    JS.write_text(js)

    if OLD_CSS in css:
        css = css.replace(OLD_CSS, NEW_CSS, 1)
        print("CSS: hourly panel styles")
    elif "#hourly-chart-panel.panel{" in css:
        print("CSS: hourly panel already patched")
    else:
        raise SystemExit("CSS hourly block not found")

    if OLD_MEDIA in css:
        css = css.replace(OLD_MEDIA, NEW_MEDIA, 1)
        print("CSS: mobile chart height")
    elif "#hourly-chart-panel .chart-wrap{height:210px}" in css:
        print("CSS: mobile height already patched")

    CSS.write_text(css)


if __name__ == "__main__":
    main()
