#!/usr/bin/env python3
"""Native page scroll over chart iframes (pointer-events:none on embed iframes)."""

from __future__ import annotations

import re
import sys
from pathlib import Path

CSS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist/assets/index-b2ecBo4-.css")

MARKER = "/* —— chart scroll pass-through —— */"

# Global pass-through: parent receives wheel/touch; streleInitEmbedTap forwards chart interaction.
CSS_BLOCK = """
/* —— chart scroll pass-through —— */
#archive-embed,#archive-embed-full{pointer-events:none;touch-action:pan-y}
.archive-charts-embed-wrap,.archive-charts-embed-wrap--full{touch-action:pan-y}
.archive-map-wrap{min-height:0!important}
.archive-map-iframe{min-height:0!important;height:auto}
"""

# Legacy v7/v8 rules that block scroll on statistika (archive-embed-full captures events).
LEGACY_RULES = (
    "@media(max-width:899px){#archive-embed{pointer-events:none;touch-action:pan-y}}",
    "@media(max-width:899px){#archive-embed-full{pointer-events:auto;touch-action:pan-y}}",
    "#archive-embed-full,#archive-embed{pointer-events:none;touch-action:pan-y}",
)


def strip_chart_scroll_block(css: str) -> str:
    if MARKER not in css:
        return css
    before, _, after = css.partition(MARKER)
    # Block ends at next section marker OR at stat-days-overlay (no section comment).
    m = re.search(r"\n(?:/\* —— |\.stat-days-overlay\{)", after)
    if m:
        return before.rstrip() + "\n" + after[m.start() + 1 :]
    return before.rstrip() + "\n"


def patch_css(css: str) -> str:
    css = strip_chart_scroll_block(css)
    for rule in LEGACY_RULES:
        css = css.replace(rule, "")
    # Insert before stat-days-overlay if present, else append.
    anchor = ".stat-days-overlay{"
    if anchor in css:
        head, tail = css.split(anchor, 1)
        return head.rstrip() + CSS_BLOCK + anchor + tail
    return css.rstrip() + CSS_BLOCK + "\n"


def main() -> None:
    css = CSS_PATH.read_text(encoding="utf-8")
    out = patch_css(css)
    if "#archive-embed,#archive-embed-full{pointer-events:none" not in out:
        raise SystemExit("patch failed: native scroll rule missing")
    if "#archive-embed-full{pointer-events:auto" in out:
        raise SystemExit("patch failed: conflicting auto pointer-events still present")
    CSS_PATH.write_text(out, encoding="utf-8")
    print(f"Patched chart native scroll -> {CSS_PATH}")


if __name__ == "__main__":
    main()
