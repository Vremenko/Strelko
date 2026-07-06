#!/usr/bin/env python3
"""Page disclaimer (Opozorilo) — production bundle only; not in PDF."""

from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

_NEXT_BLOCK = re.compile(r"\n/\* —— ")


def strip_css_block(css: str, marker: str) -> str:
    if marker not in css:
        return css
    before, _, after = css.partition(marker)
    m = _NEXT_BLOCK.search(after)
    if m:
        return before.rstrip() + "\n" + after[m.start() + 1 :]
    return before.rstrip() + "\n"

JS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist/assets/index-DijleoXU.js")
CSS_PATH = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("dist/assets/index-b2ecBo4-.css")

DISCLAIMER_OLD = r"""function DB(){return`
    <aside class="disclaimer">
      <strong>Opozorilo:</strong> Prikazani podatki so izključno informativne narave in se lahko razlikujejo od uradnih evidenc.
      Meteoinfo d.o.o. ne prevzema odgovornosti za odločitve zavarovalnic ali točnost podatkov v posameznem primeru.
      Za uradne postopke se obrnite na pristojne institucije in zavarovalnico.
    </aside>`}"""

DISCLAIMER_PREV = r"""function DB(){return`
    <aside class="disclaimer" role="note" aria-label="Opozorilo">
      <strong>Opozorilo:</strong> Prikazani podatki so informativne narave in so namenjeni kot pomoč pri pripravi dokumentacije ter komunikaciji z zavarovalnico.
      Ne predstavljajo uradnega dokazila in se lahko razlikujejo od uradnih evidenc oziroma podatkov, ki jih uporabljajo pristojne institucije.
      Meteoinfo d.o.o. ne prevzema odgovornosti za odločitve zavarovalnic ali morebitna odstopanja v podatkih.
      Za uradne postopke se obrnite na svojo zavarovalnico oziroma druge pristojne institucije.
    </aside>`}"""

DISCLAIMER_NEW = r"""function DB(){return`
    <aside class="disclaimer" role="note" aria-label="Opozorilo">
      <strong>Opozorilo:</strong> Podatki so informativne narave in se lahko razlikujejo od uradnih evidenc.
      Meteoinfo d.o.o. ne prevzema odgovornosti za odločitve zavarovalnic ali morebitna odstopanja v podatkih.
      Za uradne postopke se obrnite na svojo zavarovalnico oziroma druge pristojne institucije.
    </aside>`}"""

RESULTS_NOTE_OLD = r"""      <p style="margin-top:1.5rem;font-size:0.85rem;color:var(--muted)">
        Te podatke lahko uporabite kot informativno podlago pri komunikaciji z zavarovalnico.
        Za uradno potrdilo se obrnite na pristojne institucije.
      </p>
      <div class="results-actions">"""

RESULTS_NOTE_NEW = r"""      <div class="results-actions">"""

CSS_MARKER = "/* —— disclaimer opozorilo —— */"

CSS_APPEND = """
/* —— disclaimer opozorilo —— */
#app .content-wrap .disclaimer{margin:2.5rem 0 1.25rem;padding:1rem 1.25rem;background:rgba(251,176,6,.08);border-radius:12px;font-size:.82rem;color:var(--muted);line-height:1.65;border-left:3px solid var(--accent)}
#app .content-wrap .disclaimer strong{color:var(--accent);font-weight:700}
"""


def patch_js(js: str) -> str:
    if DISCLAIMER_NEW in js:
        print("JS disclaimer already patched")
    elif DISCLAIMER_PREV in js:
        js = js.replace(DISCLAIMER_PREV, DISCLAIMER_NEW, 1)
        print("Patched DB() disclaimer (from prev)")
    elif DISCLAIMER_OLD in js:
        js = js.replace(DISCLAIMER_OLD, DISCLAIMER_NEW, 1)
        print("Patched DB() disclaimer")
    else:
        raise SystemExit("DB() disclaimer block not found")

    if RESULTS_NOTE_NEW in js and RESULTS_NOTE_OLD not in js:
        print("JS results note already removed")
    elif RESULTS_NOTE_OLD in js:
        js = js.replace(RESULTS_NOTE_OLD, RESULTS_NOTE_NEW, 1)
        print("Removed duplicate results disclaimer note")
    elif RESULTS_NOTE_OLD not in js:
        print("Results note block not found (skipped)")
    return js


def patch_css(css: str) -> str:
    css = strip_css_block(css, CSS_MARKER)
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
