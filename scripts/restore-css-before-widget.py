#!/usr/bin/env python3
"""Rebuild dist CSS to pre-widget-redesign state (restore chart scroll tail)."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist/assets/index-b2ecBo4-.css"
JS_PATH = ROOT / "dist/assets/index-DijleoXU.js"

ANCHOR = "/* —— leva poravnava (kartice + statistika) —— */"

MOBILE_NAV_CSS = """
/* —— mobile nav (hamburger) —— */
@media(max-width:899px){
.site-menu-toggle{display:inline-flex!important}
.site-nav--desktop{display:none!important}
.site-header__bar{align-items:center}
}
"""

MOBILE_IOS_NAV_CSS = """
/* —— mobile ios fixes —— */
@media(max-width:899px){
body.site-nav-open{overflow:hidden;position:fixed;width:100%;height:100%;touch-action:none}
.site-nav-drawer{z-index:200}
.site-nav-drawer__panel{max-height:min(88dvh,100%);-webkit-overflow-scrolling:touch}
.site-header__bar{position:relative;z-index:10}
}
"""

ALIGN_CSS = """
/* —— leva poravnava (kartice + statistika) —— */
.features .feature{text-align:left}
.archive-charts-head,.archive-charts-lead,.archive-charts-page .archive-charts-head h2{text-align:left}
.stat-tabs,.archive-charts-actions{justify-content:flex-start}
.widget-obcine-head{text-align:left}
"""

ZAVAROVnica_CSS = """
/* —— zavarovalnica page —— */
.zavarovalnica-page{max-width:100%;margin:0 0 2rem;padding:0}
.zavarovalnica-hero{text-align:left;margin-bottom:1.35rem}
.zavarovalnica-intro{text-align:left;margin-bottom:1.15rem}
.zavarovalnica-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem 1.75rem;margin-bottom:1.25rem;text-align:left}
.zavarovalnica-block{text-align:left;margin-bottom:0}
.zavarovalnica-grid .zavarovalnica-block{margin-bottom:0}
.zavarovalnica-block--how,.zavarovalnica-block--benefits{margin:0;padding:0;border:none}
.zavarovalnica-subtitle{margin:0 0 .45rem;font-size:.95rem;font-weight:700;color:var(--text)}
.zavarovalnica-list,.zavarovalnica-steps{margin:0;padding-left:1.2rem;font-size:.88rem;color:var(--muted);line-height:1.55}
.zavarovalnica-list li,.zavarovalnica-steps li{margin-bottom:.35rem}
.zavarovalnica-page .search-card--inline{max-width:none;margin:0;text-align:left}
.zavarovalnica-page .search-card-title{margin:0 0 .5rem;font-size:1.05rem;font-weight:700;color:var(--text)}
.zavarovalnica-page .search-card-intro{margin:0 0 1rem;font-size:.88rem;color:var(--muted);line-height:1.5}
.zavarovalnica-page .search-card-body label{text-align:left}
.zavarovalnica-page .search-options{text-align:left}
.zavarovalnica-page .search-options-row--radius{grid-template-columns:1fr}
.zavarovalnica-page .search-options-row:not(.search-options-row--radius){grid-template-columns:1fr 1fr}
.zavarovalnica-page--results,.results-panel--zavarovalnica{max-width:100%;margin-left:0;margin-right:0}
.results-panel--zavarovalnica .strike-map-block #strike-map{height:min(52vh,420px)}
.zavarovalnica-page + .hero,.zavarovalnica-page + .hero .hero-mascot{display:none}
/* —— zavarovalnica mobile —— */
@media(max-width:899px){
.zavarovalnica-page .zavarovalnica-grid{grid-template-columns:1fr}
.zavarovalnica-page .search-options-row--radius,
.zavarovalnica-page .search-options-row:not(.search-options-row--radius){grid-template-columns:1fr}
.zavarovalnica-page .search-option--radius{max-width:none}
}
"""

PAGE_TITLES_CSS = """
/* —— podstrani: razmik + naslovi —— */
.archive-charts-page,
.widget-obcine-page,
.zavarovalnica-page,
.legal-page{padding-top:2.5rem}
.archive-charts-page .archive-charts-head,
.widget-obcine-page .widget-obcine-head,
.zavarovalnica-page .zavarovalnica-hero{margin-top:0;padding-top:0}
.archive-charts-page .archive-charts-head h2,
.widget-obcine-page .widget-obcine-head h2,
.zavarovalnica-page .zavarovalnica-hero h2,
.legal-page .legal-title{margin:0 0 .65rem;font-size:clamp(1.2rem,3.5vw,1.85rem);line-height:1.25;font-weight:800;color:var(--text);text-align:left}
.zavarovalnica-page .zavarovalnica-hero h2 em{font-style:normal;color:var(--accent)}
.archive-charts-page .archive-charts-lead,
.widget-obcine-page .widget-obcine-lead,
.zavarovalnica-page .zavarovalnica-lead{margin:0 0 .85rem;font-size:.92rem;color:var(--muted);line-height:1.55}
.zavarovalnica-page .zavarovalnica-lead:last-child{margin-bottom:0}
.legal-page{max-width:100%;margin:0 0 2rem;text-align:left}
"""

CHART_SCROLL_CSS = """
/* —— chart scroll pass-through —— */
#archive-embed,#archive-embed-full{pointer-events:none;touch-action:pan-y}
.archive-charts-embed-wrap,.archive-charts-embed-wrap--full{touch-action:pan-y}
.archive-map-wrap{min-height:0!important}
.archive-map-iframe{min-height:0!important;height:auto}
"""

DAYS_OVERLAY_CSS = """
.stat-days-overlay{position:absolute;z-index:20;pointer-events:auto;margin:0;padding:0;box-sizing:border-box}
.stat-days-overlay select{width:100%;height:100%;box-sizing:border-box;font:inherit;font-size:.8125rem;
padding:.15rem 1.75rem .15rem .45rem;border-radius:8px;border:1px solid var(--border);
background-color:var(--bg-deep);color:var(--text);min-height:32px;cursor:pointer;
-webkit-tap-highlight-color:transparent;-webkit-appearance:none;-moz-appearance:none;appearance:none;
background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23f2f2f2' d='M6 8L2 4h8z'/%3E%3C/svg%3E");
background-repeat:no-repeat;background-position:right 8px center}
.stat-days-hit{position:absolute;z-index:20;pointer-events:auto;margin:0;padding:0;border:0;opacity:0;
cursor:pointer;background:transparent;min-height:36px;-webkit-tap-highlight-color:transparent}
.archive-charts-embed-wrap--overlay-host{position:relative}
"""

STRIKE_MAP_CSS = """
/* —— strike map mobile raster —— */
@media(max-width:899px){
#strike-map{background:#1a1a1a}
#strike-map.leaflet-container{background:#1a1a1a}
}
/* —— archive map mobile height —— */
@media(max-width:899px){
.archive-map-wrap{min-height:0!important;background:transparent}
.archive-map-iframe{min-height:320px!important;width:100%!important;display:block!important;background:#1a1a1a!important;border:none!important;outline:none!important;box-shadow:none!important}
}
"""

CHART_MOBILE_CSS = """
/* —— chart mobile scroll —— */
@media(max-width:639px){
.chart-wrap,.hourly-chart-wrap,.hourly-chart-wrap canvas,.chart-wrap canvas{touch-action:pan-y}
.hourly-chart-wrap canvas,.chart-wrap canvas{pointer-events:none}
}
"""

# Widget + footer via patch scripts; chart tail after footer (pre-widget order).
MID_PATCH_ORDER = [
    ("patch-widget-obcine.py", []),
    ("patch-footer.py", ["css-only"]),
]

TAIL_CSS_BLOCKS = (
    CHART_SCROLL_CSS,
    DAYS_OVERLAY_CSS,
    STRIKE_MAP_CSS,
    CHART_MOBILE_CSS,
)


def strip_from_anchor(css: str) -> str:
    if ANCHOR in css:
        return css.split(ANCHOR)[0].rstrip() + "\n"
    # fallback: strip at first patch marker
    m = re.search(r"\n/\* —— ", css)
    if m:
        return css[: m.start() + 1].rstrip() + "\n"
    return css


def rebuild_css(css: str) -> str:
    css = strip_from_anchor(css)
    for block in (MOBILE_NAV_CSS, MOBILE_IOS_NAV_CSS, ALIGN_CSS, ZAVAROVnica_CSS, PAGE_TITLES_CSS):
        css = css.rstrip() + block
    return css + "\n"


def append_tail_css(css: str) -> str:
    for block in TAIL_CSS_BLOCKS:
        css = css.rstrip() + block
    return css + "\n"


def run_patch(script: str, extra_args: list[str]) -> None:
    cmd = [sys.executable, str(ROOT / "scripts" / script), str(JS_PATH), str(CSS_PATH), *extra_args]
    subprocess.run(cmd, check=True, cwd=ROOT)


def main() -> None:
    css = CSS_PATH.read_text(encoding="utf-8")
    css = rebuild_css(css)
    CSS_PATH.write_text(css, encoding="utf-8")
    print(f"Rebuilt CSS base + chart tail -> {CSS_PATH}")

    for script, args in MID_PATCH_ORDER:
        run_patch(script, args)
        print(f"Ran {script} {' '.join(args)}")

    css = CSS_PATH.read_text(encoding="utf-8")
    css = append_tail_css(css)
    CSS_PATH.write_text(css, encoding="utf-8")
    print("Appended chart scroll + overlay tail CSS")

    # Verify critical blocks
    out = CSS_PATH.read_text(encoding="utf-8")
    checks = [
        "mobile nav (hamburger)",
        "chart scroll pass-through",
        "stat-days-overlay",
        "archive-charts-embed-wrap--overlay-host",
        "widget občine page",
        "footer layout",
    ]
    missing = [c for c in checks if c not in out]
    if missing:
        raise SystemExit(f"CSS restore incomplete, missing: {missing}")
    print(f"OK — {len(out)} bytes, {out.count(chr(10))+1} lines")


if __name__ == "__main__":
    main()
