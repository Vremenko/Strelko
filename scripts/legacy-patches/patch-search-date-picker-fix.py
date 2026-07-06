#!/usr/bin/env python3
"""Fix date picker clicks on zavarovalnica search form."""

from __future__ import annotations

import re
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"
CSS = Path(__file__).resolve().parents[1] / "dist/assets/index-b2ecBo4-.css"

CSS_MARKER = "/* —— search date picker fix —— */"
CSS_BLOCK = """
/* —— search date picker fix —— */
.location-field{position:relative;z-index:auto}
.location-field:has(.suggestions:not(.hidden)){z-index:20}
.search-options{position:relative;z-index:2}
.search-date-wrap{cursor:pointer;isolation:isolate}
.search-date-input--picker{position:absolute;inset:0;opacity:0;cursor:pointer;padding:0;border:0;background:transparent;z-index:3;width:100%;height:100%;min-height:36px;font-size:16px}
.search-date-label{pointer-events:none;position:relative;z-index:1}
"""

DATE_LABEL_OLD = """        <label class="search-option">
          <span>Od</span>
          <div class="search-date-wrap">
            <span class="search-date-label" id="search-date-from-label">${fi(ca(e))}</span>
            <input id="search-date-from" class="search-date-input search-date-input--picker" type="date" value="${e}" max="${l}" ${p} />
          </div>
        </label>
        <label class="search-option">
          <span>Do</span>
          <div class="search-date-wrap">
            <span class="search-date-label" id="search-date-to-label">${fi(ca(i))}</span>
            <input id="search-date-to" class="search-date-input search-date-input--picker" type="date" value="${i}" max="${l}" ${p} />
          </div>
        </label>"""

DATE_LABEL_NEW = """        <div class="search-option">
          <span>Od</span>
          <div class="search-date-wrap">
            <span class="search-date-label" id="search-date-from-label">${fi(ca(e))}</span>
            <input id="search-date-from" class="search-date-input search-date-input--picker" type="date" value="${e}" max="${l}" ${p} />
          </div>
        </div>
        <div class="search-option">
          <span>Do</span>
          <div class="search-date-wrap">
            <span class="search-date-label" id="search-date-to-label">${fi(ca(i))}</span>
            <input id="search-date-to" class="search-date-input search-date-input--picker" type="date" value="${i}" max="${l}" ${p} />
          </div>
        </div>"""

OB_HANDLERS_OLD = (
    ',(u=ot("#search-date-from"))==null||u.addEventListener("change",ge=>{const de=N3(ge.target.value);'
    'j2(de),N2(de)}),(p=ot("#search-date-to"))==null||p.addEventListener("change",ge=>{const de=V3(ge.target.value);'
    'j2(de),N2(de)}),'
)

OB_HANDLERS_NEW = ",streleBindSearchDatePickers(),"

BIND_FN = r"""function streleBindSearchDatePickers(){[["#search-date-from",N3],["#search-date-to",V3]].forEach(([sel,fn])=>{const inp=ot(sel);if(!inp||inp.dataset.pickerBound)return;inp.dataset.pickerBound="1";const apply=()=>{const r=fn(inp.value);j2(r),N2(r)};inp.addEventListener("change",apply);inp.addEventListener("input",apply);const wrap=inp.closest(".search-date-wrap");wrap&&wrap.addEventListener("click",ev=>{if(ev.target===inp)return;ev.preventDefault();try{typeof inp.showPicker=="function"?inp.showPicker():inp.focus()}catch(_){inp.focus()}})})}"""


def strip_css_block(css: str, marker: str) -> str:
    if marker not in css:
        return css
    before, _, after = css.partition(marker)
    m = re.search(r"\n/\* —— ", after)
    if m:
        return before.rstrip() + "\n" + after[m.start() + 1 :]
    return before.rstrip() + "\n"


def patch_css(css: str) -> str:
    css = css.replace(
        ".location-field{position:relative;z-index:15}",
        ".location-field{position:relative;z-index:auto}",
        1,
    )
    css = strip_css_block(css, CSS_MARKER)
    if CSS_MARKER not in css:
        css = css.rstrip() + CSS_BLOCK
    return css


def patch_js(js: str) -> str:
    if "function streleBindSearchDatePickers()" not in js:
        anchor = "function OB(){"
        if anchor not in js:
            raise SystemExit("OB() anchor not found")
        js = js.replace(anchor, BIND_FN + anchor, 1)
        print("JS: added streleBindSearchDatePickers")

    if OB_HANDLERS_OLD in js:
        js = js.replace(OB_HANDLERS_OLD, OB_HANDLERS_NEW, 1)
        print("JS: wired date picker bind in OB()")
    elif "streleBindSearchDatePickers()," in js:
        print("JS: OB() date bind already ok")
    else:
        raise SystemExit("OB() date handlers not found")

    if DATE_LABEL_NEW in js:
        print("JS: date fields already use div.search-option")
    elif DATE_LABEL_OLD in js:
        js = js.replace(DATE_LABEL_OLD, DATE_LABEL_NEW, 1)
        print("JS: replaced label.search-option with div for dates")
    else:
        raise SystemExit("lB() date field markup not found")

    return js


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    css = CSS.read_text(encoding="utf-8")
    js = patch_js(js)
    css = patch_css(css)
    JS.write_text(js, encoding="utf-8")
    CSS.write_text(css, encoding="utf-8")
    print(f"Patched {JS.name} and {CSS.name}")


if __name__ == "__main__":
    main()
