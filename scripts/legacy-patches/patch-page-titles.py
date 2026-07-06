#!/usr/bin/env python3
"""Subpage spacing + unified titles (production CSS only; landing untouched)."""

from __future__ import annotations

import sys
from pathlib import Path

CSS_PATH = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("dist/assets/index-b2ecBo4-.css")

MARKER = "/* —— podstrani: razmik + naslovi —— */"

CSS_APPEND = """
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


def strip_old(css: str) -> str:
    old = "/* —— page spacing + titles —— */"
    if old in css:
        css = css.split(old)[0].rstrip() + "\n"
    if MARKER in css:
        css = css.split(MARKER)[0].rstrip() + "\n"
    return css


def patch_css(css: str) -> str:
    css = strip_old(css)
    if MARKER in css:
        print("CSS already patched")
        return css
    return css.rstrip() + CSS_APPEND


def revert_css(css: str) -> str:
    return strip_old(css) + "\n"


def main() -> None:
    mode = sys.argv[3] if len(sys.argv) > 3 else "apply"
    css = CSS_PATH.read_text(encoding="utf-8")
    if mode == "revert":
        css = revert_css(css)
    else:
        css = patch_css(css)
    CSS_PATH.write_text(css, encoding="utf-8")
    print(f"{'Reverted' if mode == 'revert' else 'Patched'} {CSS_PATH}")


if __name__ == "__main__":
    main()
