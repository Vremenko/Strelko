#!/usr/bin/env python3
"""Remove outer card frame around statistika embed iframes (map + charts)."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSS = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "dist/assets/index-b2ecBo4-.css"

MARKER = "/* —— statistika embed: outer frame only (not embed interior) —— */"

CSS_SNIPPET = """
/* —— statistika embed: outer frame only (not embed interior) —— */
.archive-map-wrap,
.archive-charts-embed-wrap,
.archive-charts-embed-wrap--full{background:transparent!important;border:none!important;border-radius:0!important;padding:0!important;box-shadow:none!important}
.archive-map-iframe,
.archive-charts-embed{border:none!important;outline:none!important;box-shadow:none!important;display:block;width:100%}
"""


def patch_css(css: str) -> str:
    if MARKER in css:
        head = css.split(MARKER)[0].rstrip()
        return head + CSS_SNIPPET
    return css.rstrip() + CSS_SNIPPET


def main() -> None:
    text = CSS.read_text(encoding="utf-8")
    CSS.write_text(patch_css(text), encoding="utf-8")
    print("CSS: statistika embed outer frame removed (interior unchanged)")


if __name__ == "__main__":
    main()
