#!/usr/bin/env python3
"""Unify search-results stat boxes + hourly panel with embed chart styling (charts-shared)."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist/assets/index-DijleoXU.js"
CSS = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "dist/assets/index-b2ecBo4-.css"

MARKER = "/* —— results stats (embed style) —— */"

# --- full results _B() ---
OLD_B_STATS = (
    '      <div class="stats-grid">\n'
    '        <div class="stat-box"><div class="num">${slNum(t.total_strikes)}</div><div class="lbl">Skupaj udarov</div></div>\n'
    '        <div class="stat-box"><div class="num">${slNum(t.daily.length)}</div><div class="lbl">Dni z udari</div></div>\n'
    '        <div class="stat-box"><div class="num">${nearestKm!=null?a0(nearestKm):"—"}</div><div class="lbl">Najbližji udar</div></div>\n'
    "      </div>"
)

NEW_B_STATS = (
    '      <div class="stats">\n'
    '        <div class="stat"><div class="label">Št. strel</div><div class="value">${slNum(t.total_strikes)}</div></div>\n'
    '        <div class="stat"><div class="label">Št. dni s strelami</div><div class="value">${slNum(t.daily.length)}</div></div>\n'
    '        <div class="stat"><div class="label">Najbližja strela</div><div class="value">${nearestKm!=null?a0(nearestKm):"—"}</div></div>\n'
    "      </div>"
)

# --- preview teaser tB() ---
OLD_T_STATS = (
    '      <div class="stats-grid">\n'
    '        <div class="stat-box"><div class="num">${slNum(t.total_strikes)}</div><div class="lbl">Skupaj udarov</div></div>\n'
    '        <div class="stat-box"><div class="num">${slNum(t.days_with_strikes)}</div><div class="lbl">Dni z udari</div></div>\n'
    '        <div class="stat-box"><div class="num">${i}</div><div class="lbl">Najbližji udar</div></div>\n'
    "      </div>"
)

NEW_T_STATS = (
    '      <div class="stats">\n'
    '        <div class="stat"><div class="label">Št. strel</div><div class="value">${slNum(t.total_strikes)}</div></div>\n'
    '        <div class="stat"><div class="label">Št. dni s strelami</div><div class="value">${slNum(t.days_with_strikes)}</div></div>\n'
    '        <div class="stat"><div class="label">Najbližja strela</div><div class="value">${i}</div></div>\n'
    "      </div>"
)

# --- preview no-strikes iB() ---
OLD_I_STATS = (
    '      <div class="stats-grid">\n'
    '        <div class="stat-box"><div class="num">0</div><div class="lbl">Udarov v obdobju</div></div>\n'
    '        <div class="stat-box"><div class="num">${vg} km</div><div class="lbl">Preverjen radij</div></div>\n'
    '        <div class="stat-box"><div class="num">${slNum(t.period_days??C0)}</div><div class="lbl">Dni pregleda</div></div>\n'
    "      </div>"
)

NEW_I_STATS = (
    '      <div class="stats">\n'
    '        <div class="stat"><div class="label">Udarov v obdobju</div><div class="value">0</div></div>\n'
    '        <div class="stat"><div class="label">Preverjen radij</div><div class="value">${vg} km</div></div>\n'
    '        <div class="stat"><div class="label">Dni pregleda</div><div class="value">${slNum(t.period_days??C0)}</div></div>\n'
    "      </div>"
)

OLD_KP = (
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

NEW_KP = (
    'function KP(){if(!oe.hourlyChartDay)return"";const t=oe.hourlyChartLoading;return`\n'
    '    <section class="panel results-hourly-panel" id="hourly-chart-panel">\n'
    '      <div class="panel-head">\n'
    '        <div class="panel-head-top">\n'
    '          <h2 class="panel-head-title">Urni profil</h2>\n'
    "        </div>\n"
    '        <p class="panel-period">${fi(ca(oe.hourlyChartDay))}</p>\n'
    "      </div>\n"
    '      ${t?\'<p class="hourly-chart-loading">Nalagam urni profil …</p>\':`<div class="stats" id="hourly-chart-stats"></div>\n'
    '             <div class="chart-wrap hourly-chart-wrap" id="hourly-chart-wrap">\n'
    '               <canvas id="hourly-strike-chart"></canvas>\n'
    "             </div>`}\n"
    "    </section>`}"
)

OLD_QM = (
    'function Qm(){var e;const t=ot("#hourly-chart-slot");t&&(t.innerHTML=KP(),'
    '(e=t.querySelector(\'[data-action="close-hourly-chart"]\'))==null||e.addEventListener("click",()=>{z0()}))}'
)

NEW_QM = 'function Qm(){const t=ot("#hourly-chart-slot");t&&(t.innerHTML=KP())}'

KONICA = '{label:"Konica",value:I.stevilo?`${O2(I.ura)} (${Ry.format(I.stevilo)})`:"—"}'
VRH = '{label:"Vrh",value:I.stevilo?`${O2(I.ura)} (${Ry.format(I.stevilo)})`:"—"}'

CSS_SNIPPET = """
/* —— results stats (embed style) —— */
.results-panel .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr));gap:.65rem;margin-bottom:.65rem}
.results-panel .stat{background:var(--bg-deep);border:1px solid var(--border);border-radius:10px;padding:.6rem .75rem;min-width:0}
.results-panel .stat .label{color:var(--muted);font-size:.75rem;line-height:1.3}
.results-panel .stat .value{font-size:clamp(1rem,3.5vw,1.25rem);font-weight:600;color:var(--accent);line-height:1.25;word-break:break-word}
.results-period{color:var(--muted);font-size:.85rem;margin:.35rem 0 .65rem;line-height:1.4}
.results-hourly-panel.panel{margin-top:1rem;padding:.9rem .85rem 1rem;background:transparent;border:1px solid rgba(255,255,255,.08);border-radius:12px}
.results-hourly-panel .panel-head{display:flex;flex-direction:column;align-items:stretch;gap:.35rem;margin-bottom:.65rem}
.results-hourly-panel .panel-head-top{display:flex;align-items:center;justify-content:space-between;gap:.5rem .75rem;width:100%;min-width:0}
.results-hourly-panel .panel-head-title{margin:0;padding-left:4px;font-size:calc(1rem + 1px);font-weight:600;line-height:1.3;color:var(--text)}
.results-hourly-panel .panel-period{margin:0;width:100%;padding-left:4px;color:var(--muted);font-size:.85rem;line-height:1.45}
.results-hourly-panel .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr));gap:.65rem;margin-bottom:.65rem}
.results-hourly-panel .stat{background:var(--bg-deep);border:1px solid var(--border);border-radius:10px;padding:.6rem .75rem;min-width:0}
.results-hourly-panel .stat .label{color:var(--muted);font-size:.75rem;line-height:1.3}
.results-hourly-panel .stat .value{font-size:clamp(1rem,3.5vw,1.25rem);font-weight:600;color:var(--accent);line-height:1.25;word-break:break-word}
.results-hourly-panel .chart-wrap{position:relative;width:100%;min-width:0;height:240px}
.results-hourly-panel .hourly-chart-wrap.chart-wrap{height:240px}
.results-hourly-panel .hourly-chart-loading{margin:0;font-size:.85rem;color:var(--muted)}
@media(max-width:639px){
.results-panel .stats,.results-hourly-panel .stats{grid-template-columns:1fr 1fr}
.results-panel .stat .value,.results-hourly-panel .stat .value{font-size:.85rem}
.results-hourly-panel .chart-wrap,.results-hourly-panel .hourly-chart-wrap.chart-wrap{height:210px}
}
"""


def patch_js(js: str) -> str:
    replacements = [
        (OLD_B_STATS, NEW_B_STATS, "_B() stats"),
        (OLD_T_STATS, NEW_T_STATS, "tB() stats"),
        (OLD_I_STATS, NEW_I_STATS, "iB() stats"),
        (OLD_KP, NEW_KP, "KP() panel"),
        (OLD_QM, NEW_QM, "Qm()"),
        (KONICA, VRH, "L3 Konica→Vrh"),
    ]
    for old, new, label in replacements:
        if old in js:
            js = js.replace(old, new, 1)
            print(f"JS: {label}")
        elif new in js or (label == "L3 Konica→Vrh" and VRH in js):
            print(f"JS: {label} already ok")
        else:
            raise SystemExit(f"JS patch failed: {label}")
    return js


def patch_css(css: str) -> str:
    if MARKER in css:
        css = css.split(MARKER)[0].rstrip()
    return css.rstrip() + CSS_SNIPPET


def main() -> None:
    js = patch_js(JS.read_text(encoding="utf-8"))
    css = patch_css(CSS.read_text(encoding="utf-8"))
    JS.write_text(js, encoding="utf-8")
    CSS.write_text(css, encoding="utf-8")
    print(f"Patched {JS.name} and {CSS.name}")


if __name__ == "__main__":
    main()
