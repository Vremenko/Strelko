#!/usr/bin/env python3
"""Remove mobile pointer-events overrides; desktop-unified iframe interaction."""

from __future__ import annotations

import sys
from pathlib import Path

CSS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist/assets/index-b2ecBo4-.css")


def patch_css(css: str) -> str:
    css = css.replace(
        "@media(max-width:899px){#archive-embed{pointer-events:none;touch-action:pan-y}}\n",
        "",
    )
    css = css.replace(
        "@media(max-width:899px){#archive-embed-full{pointer-events:auto;touch-action:pan-y}}\n",
        "",
    )
    # Remove mobile canvas pointer-events:none in parent (results charts)
    old = (
        "/* —— chart mobile scroll —— */\n"
        "@media(max-width:639px){\n"
        ".chart-wrap,.hourly-chart-wrap,.hourly-chart-wrap canvas,.chart-wrap canvas{touch-action:pan-y}\n"
        ".hourly-chart-wrap canvas,.chart-wrap canvas{pointer-events:none}\n"
        "}\n"
    )
    css = css.replace(old, "")
    if "/* —— unified embed scroll —— */" not in css:
        css = css.rstrip() + (
            "\n/* —— unified embed scroll —— */\n"
            ".archive-charts-embed-wrap,.archive-charts-embed-wrap--full{touch-action:pan-y}\n"
        )
    return css


def main() -> None:
    css = patch_css(CSS_PATH.read_text(encoding="utf-8"))
    CSS_PATH.write_text(css, encoding="utf-8")
    print("Patched", CSS_PATH)


if __name__ == "__main__":
    main()
