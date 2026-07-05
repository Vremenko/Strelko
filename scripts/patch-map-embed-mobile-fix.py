#!/usr/bin/env python3
"""Fix mobile map iframe height (JS setProperty) + CSS without height:auto!important."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"
CSS = Path(__file__).resolve().parents[1] / "dist/assets/index-b2ecBo4-.css"

JS_OLD = 'if(Math.abs(d-I)<2)return;l.style.height=`${I}px`;l.setAttribute("scrolling","no");l.style.overflow="hidden"'
JS_NEW = 'if(Math.abs(d-I)<2)return;l.style.setProperty("height",I+"px","important");l.setAttribute("scrolling","no");l.style.overflow="hidden"'

CSS_OLD = (
    ".archive-map-iframe{min-height:320px!important;height:auto!important;width:100%!important;"
    "display:block!important;background:#1a1a1a!important;border:none!important;outline:none!important;box-shadow:none!important}"
)
CSS_NEW = (
    ".archive-map-iframe{min-height:320px!important;width:100%!important;"
    "display:block!important;background:#1a1a1a!important;border:none!important;outline:none!important;box-shadow:none!important}"
)


def main() -> None:
    js = JS.read_text()
    if JS_OLD in js:
        js = js.replace(JS_OLD, JS_NEW, 1)
        JS.write_text(js)
        print("patched: resize setProperty")
    elif JS_NEW in js:
        print("skip: JS already patched")
    else:
        raise SystemExit("JS resize pattern not found")

    css = CSS.read_text()
    if CSS_OLD in css:
        css = css.replace(CSS_OLD, CSS_NEW, 1)
        print("patched: CSS iframe height")
    elif CSS_NEW in css:
        print("skip: CSS already patched")
    else:
        raise SystemExit("CSS pattern not found")
    css = css.replace(".archive-map-wrap{min-height:480px}", ".archive-map-wrap{min-height:0}")
    CSS.write_text(css)
    print("done")


if __name__ == "__main__":
    main()
