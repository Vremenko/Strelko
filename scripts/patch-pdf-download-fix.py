#!/usr/bin/env python3
"""Fix PDF download: NB() gated on FS=!1 instead of credits.pdf_reports_available."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist/assets/index-DijleoXU.js"

NB_OLD = "async function NB(){const t=oe.searchResult;if(!t||!FS)return;const e=ot(\"#btn-download-pdf\")"
NB_NEW = (
    "async function NB(){const t=oe.searchResult;"
    "if(!t||!oe.credits||!oe.credits.pdf_reports_available)return;"
    "const e=ot(\"#btn-download-pdf\")"
)

ACTIONS_OLD = """      <div class="results-actions">
        <button type="button" class="btn btn-primary" data-action="download-pdf" id="btn-download-pdf">Prenesi PDF poročilo</button>
        <button type="button" class="btn btn-ghost" data-nav="${G2(window.location.pathname)==="zavarovalnica"?"zavarovalnica":"landing"}">Nova preiskava</button>
      </div>"""

ACTIONS_NEW = """      <div class="results-actions">
        ${oe.credits&&oe.credits.pdf_reports_available?'<button type="button" class="btn btn-primary" data-action="download-pdf" id="btn-download-pdf">Prenesi PDF poročilo</button>':'<p class="pdf-upsell">PDF poročilo za zavarovalnico je na voljo v paketu <strong>Ob škodi</strong>.</p>'}
        <button type="button" class="btn btn-ghost" data-nav="${G2(window.location.pathname)==="zavarovalnica"?"zavarovalnica":"landing"}">Nova preiskava</button>
      </div>"""


def main() -> None:
    js = JS.read_text(encoding="utf-8")

    if NB_NEW.split(";")[1] in js:
        print("JS: NB() already fixed")
    elif NB_OLD in js:
        js = js.replace(NB_OLD, NB_NEW, 1)
        print("JS: NB() uses pdf_reports_available")
    else:
        raise SystemExit("NB() pattern not found")

    if ACTIONS_NEW in js:
        print("JS: results PDF button already conditional")
    elif ACTIONS_OLD in js:
        js = js.replace(ACTIONS_OLD, ACTIONS_NEW, 1)
        print("JS: conditional PDF button in results")
    else:
        raise SystemExit("results-actions pattern not found")

    JS.write_text(js, encoding="utf-8")


if __name__ == "__main__":
    main()
