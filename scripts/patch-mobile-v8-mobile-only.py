#!/usr/bin/env python3
"""Mobile-only: ensure statistika embed stays interactive."""

from __future__ import annotations

import sys
from pathlib import Path

CSS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist/assets/index-b2ecBo4-.css")

MARKER = "/* —— chart scroll pass-through —— */"
APPEND = """
@media(max-width:899px){#archive-embed-full{pointer-events:auto;touch-action:pan-y}}
"""


def patch_css(css: str) -> str:
    if "#archive-embed-full{pointer-events:auto" in css:
        print("CSS already v8")
        return css
    return css.rstrip() + APPEND


def main() -> None:
    css = patch_css(CSS_PATH.read_text(encoding="utf-8"))
    CSS_PATH.write_text(css, encoding="utf-8")
    print("Patched", CSS_PATH)


if __name__ == "__main__":
    main()
