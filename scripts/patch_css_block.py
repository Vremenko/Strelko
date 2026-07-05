"""Safe removal of a single /* —— … —— */ CSS block (keeps following blocks)."""

from __future__ import annotations

import re

_NEXT_BLOCK = re.compile(r"\n/\* —— ")


def strip_css_block(css: str, marker: str) -> str:
    if marker not in css:
        return css
    before, _, after = css.partition(marker)
    m = _NEXT_BLOCK.search(after)
    if m:
        return before.rstrip() + "\n" + after[m.start() + 1 :]
    return before.rstrip() + "\n"
