#!/usr/bin/env python3
"""Pravopis + davčna zavezanost na pravnih straneh (production JS)."""

from __future__ import annotations

import sys
from pathlib import Path

JS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist/assets/index-DijleoXU.js")

REPLACEMENTS = [
    ('updated:"17. junij 2026"', 'updated:"3. julij 2026"'),
    (
        "<li>Identifikacijska številka za DDV: podjetje ni davčni zavezanec</li>",
        "<li>Identifikacijska številka za DDV: ${ci.davčna}</li>",
    ),
    (
        "opozorila ob vremenskih opozorilih (MeteoAlarm) in pomoč pri pripravi podatkov za zavarovalnico.",
        "obvestila o vremenskih opozorilih (MeteoAlarm) in pomoč pri pripravi podatkov za zavarovalnico.",
    ),
    (
        "Cene so prikazane v evrih (EUR) in vključujejo davke, kjer je to zakonsko zahtevano.</p>",
        "Cene so prikazane v evrih (EUR) in vključujejo 22&nbsp;% DDV, kjer je to zakonsko predpisano.</p>",
    ),
    (
        "<li>Ne porabljeni krediti se ne prenašajo v naslednji mesec, razen če je drugače izrecno navedeno ob nakupu.</li>",
        "<li>Neporabljeni krediti se ne prenašajo v naslednji mesec, razen če je drugače izrecno navedeno ob nakupu.</li>",
    ),
    (
        "en brezplačen dobrodošel kredit za preizkus storitve.",
        "en brezplačen dobrodošilni kredit za preizkus storitve.",
    ),
    (
        "objavo ali širjenje zavajajočih trditve, da gre za uradno potrdilo zavarovalnice ali državnega organa,",
        "objavo ali širjenje zavajajočih trditev, da gre za uradno potrdilo zavarovalnice ali državnega organa,",
    ),
    (
        "izbriše račun s prošnjo na",
        "izbriše račun z zahtevo na",
    ),
    (
        "<p>Za te pogoje velja pravo Republike Slovenije. Pristojno je stvarno pristojno sodišče v Sloveniji,",
        "<p>Za te pogoje velja pravo Republike Slovenije. Za morebitne spore je pristojno stvarno pristojno sodišče v Republiki Sloveniji,",
    ),
    (
        "<td>Shranitev vaše izbire glede obvestila o piškotkih</td>",
        "<td>Shranitev vaše izbire v zvezi z obvestilom o piškotkih</td>",
    ),
    (
        """<p>Prijavni žeton lahko izbrišete z odjavo ali brisanjem podatkov spletne strani v nastavitvah brskalnika.
          Ob prvem obisku lahko nujne piškotke sprejmete ali zavrnete. Če jih zavrnete, lahko stran še vedno brskate, vendar prijava in shranjevanje seje ne bosta delovala.</p>
          <p>Prijavni žeton lahko izbrišete z odjavo ali brisanjem podatkov spletne strani v nastavitvah brskalnika. Izbiro glede piškotkov lahko spremenite tako, da v brskalniku izbrišete vrednost <code>strelko_cookie_consent</code> in stran znova naložite.</p>""",
        """<p>Ob prvem obisku lahko nujne piškotke oziroma localStorage sprejmete ali zavrnete. Če jih zavrnete, lahko stran še vedno brskate, vendar prijava in shranjevanje seje ne bosta delovala.</p>
          <p>Prijavni žeton lahko izbrišete z odjavo ali brisanjem podatkov spletne strani v nastavitvah brskalnika. Izbiro glede piškotkov lahko spremenite tako, da v brskalniku izbrišete vrednost <code>strelko_cookie_consent</code> in stran znova naložite.</p>""",
    ),
    (
        """<p>${ci.legalName}, ${ci.address}, ${ci.postal}.<br />
          E-pošta: <a href="mailto:${ci.email}">${ci.email}</a></p>""",
        """<p>${ci.legalName}, ${ci.address}, ${ci.postal}.<br />
          Davčna številka: ${ci.davčna}<br />
          Identifikacijska številka za DDV: ${ci.davčna}<br />
          E-pošta: <a href="mailto:${ci.email}">${ci.email}</a></p>""",
    ),
]


def patch_js(js: str) -> str:
    changed = 0
    for old, new in REPLACEMENTS:
        if old not in js:
            if new in js:
                continue
            raise SystemExit(f"Missing expected text: {old[:80]}…")
        js = js.replace(old, new, 1)
        changed += 1
    print(f"Applied {changed} legal text replacements")
    return js


def main() -> None:
    js = JS_PATH.read_text(encoding="utf-8")
    js = patch_js(js)
    JS_PATH.write_text(js, encoding="utf-8")
    print(f"Patched {JS_PATH}")


if __name__ == "__main__":
    main()
