#!/usr/bin/env python3
"""Revert patch-layout-toolbar: remove global search toolbar, restore header nav."""

from __future__ import annotations

import re
import sys
from pathlib import Path

JS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist/assets/index-DijleoXU.js")
CSS_PATH = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("dist/assets/index-b2ecBo4-.css")

HEADER_NAV_NEW = r"""        <nav class="site-nav site-nav--desktop" aria-label="Uporabnik">
          <div class="site-nav__auth">"""

HEADER_NAV_OLD = r"""        <nav class="site-nav site-nav--desktop" aria-label="Glavna navigacija">
          <div class="site-nav__content">
            <a href="/pomoc-pri-zavarovalnici" class="nav-link" data-nav="zavarovalnica">Pomoč pri zavarovalnici</a>
            <a href="/statistika" class="nav-link" data-nav="statistika">Arhiv strel</a>
            <a href="/widget-obcine" class="nav-link" data-nav="widget-obcine">Widget občine</a>
          </div>
          <div class="site-nav__auth">"""

ZI_INSERT_NEW = r"""      ${J3()}
      ${oe.legalPage?"":strelkoAppToolbar()}
      ${e}"""

ZI_INSERT_OLD = r"""      ${J3()}
      ${e}"""

TOOLBAR_FN_RE = re.compile(
    r"function strelkoAppToolbar\(\)\{var i;const v=oe\.view.*?\`;\}\s*",
    re.DOTALL,
)


def patch_js(js: str) -> str:
    if ZI_INSERT_NEW not in js and "strelkoAppToolbar()" not in js:
        print("JS already reverted")
        return js
    if HEADER_NAV_NEW not in js:
        raise SystemExit("header nav block not found")
    js = js.replace(HEADER_NAV_NEW, HEADER_NAV_OLD, 1)
    js = js.replace(ZI_INSERT_NEW, ZI_INSERT_OLD, 1)
    js, n = TOOLBAR_FN_RE.subn("", js, count=1)
    if n:
        print("Removed strelkoAppToolbar()")
    return js


def patch_css(css: str) -> str:
    marker = "/* —— app toolbar"
    if marker in css:
        css = css.split(marker)[0].rstrip() + "\n"
    # Remove orphaned mobile-only toolbar rules we appended earlier
    css = css.replace(
        "@media(max-width:768px){.app-toolbar{flex-direction:column;align-items:stretch}"
        ".app-toolbar__search{max-width:none}.app-toolbar__nav{justify-content:flex-start;margin-left:0}}",
        "",
    )
    css = css.replace(
        ".btn-primary{background:linear-gradient(135deg,var(--blue),#0380a0);color:#fff;box-shadow:0 4px 20px rgba(5,165,206,.35)}",
        ".btn-primary{background:linear-gradient(135deg,var(--accent),#d99a05);color:#1a1508;box-shadow:0 4px 24px var(--accent-glow)}",
        1,
    )
    css = css.replace(
        ".btn-primary:hover{filter:brightness(1.06);box-shadow:0 6px 28px rgba(5,165,206,.45)}",
        ".btn-primary:hover{box-shadow:0 6px 32px var(--accent-glow)}",
        1,
    )
    css = css.replace(
        ".btn-cookie-accept{background:var(--blue);color:#fff;box-shadow:0 4px 20px rgba(5,165,206,.35)}",
        ".btn-cookie-accept{background:var(--accent);color:#1a1508;box-shadow:0 4px 20px var(--accent-glow)}",
        1,
    )
    return css


def main() -> None:
    js = JS_PATH.read_text(encoding="utf-8")
    css = CSS_PATH.read_text(encoding="utf-8")
    js = patch_js(js)
    css = patch_css(css)
    JS_PATH.write_text(js, encoding="utf-8")
    CSS_PATH.write_text(css, encoding="utf-8")
    print("Reverted layout toolbar in", JS_PATH, "and", CSS_PATH)


if __name__ == "__main__":
    main()
