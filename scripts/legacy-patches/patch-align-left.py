#!/usr/bin/env python3
"""Append left-align CSS to Strelko production bundle (CSS only, safe for dist deploy)."""

from __future__ import annotations

import sys
from pathlib import Path

CSS_PATH = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("dist/assets/index-b2ecBo4-.css")

MARKERS = (
    "/* —— leva poravnava (kartice + statistika) —— */",
    "/* —— leva poravnava (landing + statistika) —— */",
)
MARKER = MARKERS[0]

CSS_APPEND = """
/* —— leva poravnava (kartice + statistika) —— */
.features .feature{text-align:left}
.archive-charts-head,.archive-charts-lead,.archive-charts-page .archive-charts-head h2{text-align:left}
.stat-tabs,.archive-charts-actions{justify-content:flex-start}
.widget-obcine-head{text-align:left}
"""


def patch_css(css: str) -> str:
    if any(m in css for m in MARKERS):
        print("CSS already patched")
        return css
    return css.rstrip() + CSS_APPEND


def revert_css(css: str) -> str:
    changed = False
    for marker in MARKERS:
        if marker in css:
            css = css.split(marker)[0].rstrip() + "\n"
            changed = True
    if not changed:
        print("CSS patch not found, skip")
    return css


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
