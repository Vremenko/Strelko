#!/usr/bin/env python3
"""Pomoč pri zavarovalnici — unified page layout (production bundle only)."""

from __future__ import annotations

import re
import sys
from pathlib import Path

JS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist/assets/index-DijleoXU.js")
CSS_PATH = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("dist/assets/index-b2ecBo4-.css")

CSS_MARKER = "/* —— zavarovalnica page —— */"

JS_OLD_SIMPLE = "function strelkoZavarovalnicaPage(){return strelkoSearchHero()}"

ZAVAROVALNICA_PAGE = r"""function strelkoZavarovalnicaPage(){var i;const t=oe.loading||oe.preview&&strelkoIsSearchView();return`
    <section class="zavarovalnica-page">
      <header class="zavarovalnica-hero">
        <h2>Vam je <em>strela</em> poškodovala klimatsko napravo, televizijo ali drugo elektroniko?</h2>
      </header>
      <div class="zavarovalnica-intro">
        <p class="zavarovalnica-lead">Strelko preveri udare strel v bližini vašega naslova in pripravi pregleden izpis, ki vam lahko pomaga pri komunikaciji z zavarovalnico.</p>
        <p class="zavarovalnica-lead">Na podlagi razpoložljivih podatkov prikažemo, ali so bili v izbranem obdobju v okolici vašega naslova zaznani udari strel. Rezultate si lahko ogledate na zemljevidu in v tabeli ter jih shranite kot PDF izpis.</p>
      </div>
      <div class="zavarovalnica-grid">
        <div class="zavarovalnica-block zavarovalnica-block--how">
          <h3 class="zavarovalnica-subtitle">Kako deluje</h3>
          <ol class="zavarovalnica-steps">
            <li>Vnesete naslov, kjer je nastala škoda, ter izberete obdobje pregleda.</li>
            <li>Strelko preveri zaznane udare strel v izbranem radiju okoli naslova.</li>
            <li>Rezultate prikaže na zemljevidu in v tabeli.</li>
            <li>Pregled lahko shranite kot PDF in ga uporabite kot prilogo pri prijavi škode zavarovalnici.</li>
          </ol>
        </div>
        <div class="zavarovalnica-block zavarovalnica-block--benefits">
          <h3 class="zavarovalnica-subtitle">Kaj vključuje pregled</h3>
          <ul class="zavarovalnica-list">
            <li>pregled zaznanih udarov strel v bližini izbranega naslova,</li>
            <li>zemljevid z lokacijami udarov in označeno lokacijo naslova,</li>
            <li>čas in oddaljenost posameznih udarov strel,</li>
            <li>povzetek rezultatov za izbrano obdobje,</li>
            <li>možnost izvoza oziroma shranjevanja pregleda v PDF obliki.</li>
          </ul>
        </div>
      </div>
      <div class="search-card search-card--inline${t?" search-card--busy":""}">
        ${eB()}
        <div class="search-card-body">
          <h3 class="search-card-title">Preverite udare strel v bližini</h3>
          <p class="search-card-intro">Vnesite naslov, izberite radij in obdobje pregleda. Po kliku na gumb se bodo prikazali udari strel v okolici izbrane lokacije.</p>
          <div class="location-field">
            <input id="location-input" class="search-input" type="text" placeholder="npr. Škrabčev trg 2, Ribnica" autocomplete="off" value="${fi(oe.locationQuery||((i=oe.selected)==null?void 0:i.label)||"")}" ${oe.loading?"disabled":""} />
            <ul class="suggestions hidden" id="suggestions"></ul>
          </div>
          ${G3()}
          ${lB()}
          <button type="button" class="btn btn-primary btn-search-full" id="btn-search" ${oe.loading?"disabled":""}>Prikaži rezultate</button>
        </div>
      </div>
    </section>`}"""

RESULTS_PANEL_OLD = '<section class="results-panel">'
RESULTS_PANEL_NEW = '<section class="results-panel${G2(window.location.pathname)==="zavarovalnica"?" results-panel--zavarovalnica":""}">'

RESULTS_NAV_OLD = '<button type="button" class="btn btn-ghost" data-nav="landing">Nova preiskava</button>'
RESULTS_NAV_NEW = '<button type="button" class="btn btn-ghost" data-nav="${G2(window.location.pathname)==="zavarovalnica"?"zavarovalnica":"landing"}">Nova preiskava</button>'

CSS_OLD_MARKERS = (
    "/* —— zavarovalnica intro —— */",
    CSS_MARKER,
)

CSS_APPEND = """
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


def strip_css(css: str) -> str:
    for marker in CSS_OLD_MARKERS:
        if marker in css:
            css = css.split(marker)[0].rstrip() + "\n"
    if CSS_MARKER in css:
        css = css.split(CSS_MARKER)[0].rstrip() + "\n"
    return css


def patch_js(js: str) -> str:
    if JS_OLD_SIMPLE in js:
        js = js.replace(JS_OLD_SIMPLE, ZAVAROVALNICA_PAGE, 1)
    elif ZAVAROVALNICA_PAGE not in js:
        raise SystemExit("strelkoZavarovalnicaPage anchor not found")

    if RESULTS_PANEL_OLD in js and RESULTS_PANEL_NEW not in js:
        js = js.replace(RESULTS_PANEL_OLD, RESULTS_PANEL_NEW, 1)
    if RESULTS_NAV_OLD in js and RESULTS_NAV_NEW not in js:
        js = js.replace(RESULTS_NAV_OLD, RESULTS_NAV_NEW, 1)

    return js


def patch_css(css: str) -> str:
    css = strip_css(css)
    return css.rstrip() + CSS_APPEND


def main() -> None:
    js = JS_PATH.read_text(encoding="utf-8")
    css = CSS_PATH.read_text(encoding="utf-8")
    js = patch_js(js)
    css = patch_css(css)
    JS_PATH.write_text(js, encoding="utf-8")
    CSS_PATH.write_text(css, encoding="utf-8")
    print(f"Patched {JS_PATH} and {CSS_PATH}")


if __name__ == "__main__":
    main()
