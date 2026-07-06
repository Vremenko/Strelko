#!/usr/bin/env python3
"""Landing preview: chart title inside embed panel, not as h3 above iframe."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist/assets/index-DijleoXU.js"
CSS = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "dist/assets/index-b2ecBo4-.css"

OLD_SB = (
    '    <section class="archive-charts-preview" id="statistika-strel">\n'
    '      <h3 class="archive-charts-title">Statistika strel v Sloveniji</h3>\n'
    "      <div\n"
)

NEW_SB = (
    '    <section class="archive-charts-preview" id="statistika-strel">\n'
    "      <div\n"
)

CSS_HIDE = ".archive-charts-preview .archive-charts-title{display:none!important}\n"
MARKER = "/* —— landing chart title in embed —— */"


def patch_css(css: str) -> str:
    if MARKER in css:
        head = css.split(MARKER)[0].rstrip()
        return head + "\n" + MARKER + "\n" + CSS_HIDE
    return css.rstrip() + "\n" + MARKER + "\n" + CSS_HIDE


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    if OLD_SB in js:
        js = js.replace(OLD_SB, NEW_SB, 1)
        print("JS: removed archive-charts-title h3 above landing embed")
    elif NEW_SB in js:
        print("JS: landing embed title already in-panel only")
    else:
        raise SystemExit("sB() landing chart section not found")

    css = patch_css(CSS.read_text(encoding="utf-8"))
    JS.write_text(js, encoding="utf-8")
    CSS.write_text(css, encoding="utf-8")
    print(f"Patched {JS.name} and {CSS.name}")


if __name__ == "__main__":
    main()
