#!/usr/bin/env python3
"""Mobile nav: hamburger menu, hide desktop nav links on small screens."""

from __future__ import annotations

import sys
from pathlib import Path

CSS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist/assets/index-b2ecBo4-.css")

MARKER = "/* —— mobile nav (hamburger) —— */"
APPEND = """
/* —— mobile nav (hamburger) —— */
@media(max-width:899px){
.site-menu-toggle{display:inline-flex!important}
.site-nav--desktop{display:none!important}
.site-header__bar{align-items:center}
}
"""


def main() -> None:
    css = CSS_PATH.read_text(encoding="utf-8")
    if MARKER in css:
        print("CSS already patched")
        return
    css = css.rstrip() + APPEND
    CSS_PATH.write_text(css, encoding="utf-8")
    print("Patched", CSS_PATH)


if __name__ == "__main__":
    main()
