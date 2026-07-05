#!/usr/bin/env python3
"""Restore chart interactivity; homepage mobile pass-through only; mobile scroll forward."""

from __future__ import annotations

import sys
from pathlib import Path

JS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist/assets/index-DijleoXU.js")
CSS_PATH = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("dist/assets/index-b2ecBo4-.css")

WHEEL_OLD = (
    'if(((p=i.data)==null?void 0:p.type)==="strele-embed-wheel"){'
    'if(window.matchMedia("(max-width:899px)").matches)return;'
    'const l=[document.getElementById("archive-embed"),document.getElementById("archive-embed-full")]'
    '.find(d=>d&&d.contentWindow===i.source);'
    'l&&window.scrollBy({top:i.data.deltaY||0,left:i.data.deltaX||0,behavior:"auto"});return'
)

WHEEL_NEW = (
    'if(((p=i.data)==null?void 0:p.type)==="strele-embed-wheel"){'
    'const l=[document.getElementById("archive-embed"),document.getElementById("archive-embed-full")]'
    '.find(d=>d&&d.contentWindow===i.source);'
    'l&&window.scrollBy({top:i.data.deltaY||0,left:i.data.deltaX||0,behavior:"auto"});return'
)

CSS_V6 = """/* —— chart scroll pass-through (all embeds) —— */
#archive-embed-full,#archive-embed{pointer-events:none;touch-action:pan-y}
.archive-charts-embed-wrap,.archive-charts-embed-wrap--full{touch-action:pan-y}
.archive-map-wrap{min-height:0!important}
.archive-map-iframe{min-height:0!important;height:auto}
"""

CSS_V7 = """/* —— chart scroll pass-through —— */
@media(max-width:899px){#archive-embed{pointer-events:none;touch-action:pan-y}}
.archive-charts-embed-wrap,.archive-charts-embed-wrap--full{touch-action:pan-y}
.archive-map-wrap{min-height:0!important}
.archive-map-iframe{min-height:0!important;height:auto}
"""


def patch_js(js: str) -> str:
    if WHEEL_OLD in js:
        js = js.replace(WHEEL_OLD, WHEEL_NEW, 1)
    elif WHEEL_NEW.split(".find(d=>d")[0] in js:
        print("JS wheel handler already v7")
    else:
        raise SystemExit("strele-embed-wheel handler not found")
    return js


def patch_css(css: str) -> str:
    if CSS_V6.strip() in css:
        css = css.replace(CSS_V6.strip(), CSS_V7.strip(), 1)
    elif "/* —— chart scroll pass-through —— */" in css and "#archive-embed-full" not in css.split("chart scroll pass-through")[-1][:200]:
        print("CSS already v7")
    else:
        css = css.replace(
            "#archive-embed-full,#archive-embed{pointer-events:none;touch-action:pan-y}",
            "@media(max-width:899px){#archive-embed{pointer-events:none;touch-action:pan-y}}",
            1,
        )
    return css


def main() -> None:
    js = patch_js(JS_PATH.read_text(encoding="utf-8"))
    css = patch_css(CSS_PATH.read_text(encoding="utf-8"))
    JS_PATH.write_text(js, encoding="utf-8")
    CSS_PATH.write_text(css, encoding="utf-8")
    print("Patched", JS_PATH, "and", CSS_PATH)


if __name__ == "__main__":
    main()
