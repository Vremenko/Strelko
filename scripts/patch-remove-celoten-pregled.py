#!/usr/bin/env python3
"""Remove 'Celoten pregled' lead line from search options form."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

OLD = (
    '    <div class="search-options" id="search-options">\n'
    '      <p class="search-options-lead">Celoten pregled</p>\n'
    '      <div class="search-options-row search-options-row--radius">'
)

NEW = (
    '    <div class="search-options" id="search-options">\n'
    '      <div class="search-options-row search-options-row--radius">'
)


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    if OLD in js:
        js = js.replace(OLD, NEW, 1)
        JS.write_text(js, encoding="utf-8")
        print("Removed Celoten pregled line from lB()")
    elif NEW in js and OLD not in js:
        print("Already patched")
    else:
        raise SystemExit("Could not find search-options-lead in lB()")


if __name__ == "__main__":
    main()
