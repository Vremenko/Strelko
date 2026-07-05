#!/usr/bin/env python3
"""Footer layout: left/right rows, no center alignment (production bundle)."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from patch_css_block import strip_css_block

JS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist/assets/index-DijleoXU.js")
CSS_PATH = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("dist/assets/index-b2ecBo4-.css")

JS_OLD = r"""function jp(){const t=Object.entries(mf).map(([e,i])=>`<a href="${i.path}" data-legal="${e}">${i.title}</a>`).join("");return`
    <footer class="site-footer">
      <p>&copy; ${B3} <strong>${ci.shortName}</strong> · Strelko</p>
      <p><a href="${ci.website}" target="_blank" rel="noopener">meteoinfo.si</a> · <a href="mailto:${ci.email}">${ci.email}</a></p>
      <nav class="legal-footer-nav" aria-label="Pravne informacije">
        ${t}
        <a href="${ci.privacyPolicyUrl}" target="_blank" rel="noopener">Politika zasebnosti Meteoinfo</a>
      </nav>
      <p class="site-footer-source">
        Vir podatkov o udarih strel:
        <a href="https://meteo.hr/" target="_blank" rel="noopener">DHMZ (meteo.hr)</a>
      </p>
    </footer>`}"""

JS_WITH_SOURCE = r"""function jp(){const t=Object.entries(mf).map(([e,i])=>`<a href="${i.path}" data-legal="${e}">${i.title}</a>`).join("");return`
    <footer class="site-footer">
      <div class="site-footer-row site-footer-row--top">
        <p class="site-footer-copy">&copy; ${B3} <strong>${ci.shortName}</strong> · Strelko</p>
        <p class="site-footer-contact"><a href="${ci.website}" target="_blank" rel="noopener">meteoinfo.si</a> · <a href="mailto:${ci.email}">${ci.email}</a></p>
      </div>
      <nav class="legal-footer-nav" aria-label="Pravne informacije">
        ${t}
        <a href="${ci.privacyPolicyUrl}" target="_blank" rel="noopener">Politika zasebnosti Meteoinfo</a>
      </nav>
      <p class="site-footer-source">Vir podatkov o udarih strel: <a href="https://meteo.hr/" target="_blank" rel="noopener">DHMZ (meteo.hr)</a></p>
    </footer>`}"""

JS_NEW = r"""function jp(){const t=Object.entries(mf).map(([e,i])=>`<a href="${i.path}" data-legal="${e}">${i.title}</a>`).join("");return`
    <footer class="site-footer">
      <div class="site-footer-row site-footer-row--top">
        <p class="site-footer-copy">&copy; ${B3} <strong>${ci.shortName}</strong> · Strelko</p>
        <p class="site-footer-contact"><a href="${ci.website}" target="_blank" rel="noopener">meteoinfo.si</a> · <a href="mailto:${ci.email}">${ci.email}</a></p>
      </div>
      <nav class="legal-footer-nav" aria-label="Pravne informacije">
        ${t}
        <a href="${ci.privacyPolicyUrl}" target="_blank" rel="noopener">Politika zasebnosti Meteoinfo</a>
      </nav>
    </footer>`}"""

CSS_MARKER = "/* —— footer layout —— */"

CSS_APPEND = """
/* —— footer layout —— */
#app .content-wrap .site-footer{text-align:left!important;padding:1.5rem 0 max(2rem,env(safe-area-inset-bottom));margin-top:1.5rem;border-top:1px solid rgba(255,255,255,.08);color:var(--muted);font-size:.85rem}
#app .content-wrap .site-footer p{margin:0;text-align:left}
#app .content-wrap .site-footer-row--top{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:.5rem 1.25rem;margin-bottom:.85rem;width:100%}
#app .content-wrap .site-footer-copy,#app .content-wrap .site-footer-contact{font-size:.88rem;color:var(--muted);text-align:left}
#app .content-wrap .site-footer-contact a{color:var(--muted);text-decoration:none}
#app .content-wrap .site-footer-contact a:hover{color:var(--text)}
#app .content-wrap .legal-footer-nav{display:flex;flex-wrap:wrap;justify-content:flex-start!important;align-items:center;gap:.15rem .35rem;margin:0;width:100%;font-size:.85rem;line-height:1.5;text-align:left}
#app .content-wrap .legal-footer-nav a{color:var(--muted);text-decoration:none}
#app .content-wrap .legal-footer-nav a:hover{color:var(--text);text-decoration:none}
#app .content-wrap .legal-footer-nav a:not(:last-child)::after{content:" · ";color:var(--muted);pointer-events:none}
"""


def strip_css(css: str) -> str:
    return strip_css_block(css, CSS_MARKER)


def patch_js(js: str) -> str:
    if "site-footer-row--top" in js:
        print("JS already patched (site-footer-row--top)")
        return js
    if JS_NEW in js:
        print("JS already patched")
        return js
    if JS_WITH_SOURCE in js:
        return js.replace(JS_WITH_SOURCE, JS_NEW, 1)
    if JS_OLD not in js:
        raise SystemExit("jp() footer block not found")
    return js.replace(JS_OLD, JS_NEW, 1)


def patch_css(css: str) -> str:
    css = strip_css(css)
    return css.rstrip() + CSS_APPEND


def revert_js(js: str) -> str:
    if JS_NEW in js:
        js = js.replace(JS_NEW, JS_OLD, 1)
    return js


def revert_css(css: str) -> str:
    return strip_css(css) + "\n"


def main() -> None:
    mode = sys.argv[3] if len(sys.argv) > 3 else "apply"
    js = JS_PATH.read_text(encoding="utf-8")
    css = CSS_PATH.read_text(encoding="utf-8")
    if mode == "revert":
        js = revert_js(js)
        css = revert_css(css)
        JS_PATH.write_text(js, encoding="utf-8")
        CSS_PATH.write_text(css, encoding="utf-8")
        print(f"Reverted {JS_PATH} and {CSS_PATH}")
    elif mode == "css-only":
        css = patch_css(css)
        CSS_PATH.write_text(css, encoding="utf-8")
        print(f"Patched footer CSS only: {CSS_PATH}")
    else:
        js = patch_js(js)
        css = patch_css(css)
        JS_PATH.write_text(js, encoding="utf-8")
        CSS_PATH.write_text(css, encoding="utf-8")
        print(f"Patched {JS_PATH} and {CSS_PATH}")


if __name__ == "__main__":
    main()
