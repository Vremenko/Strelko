#!/usr/bin/env python3
"""Mobile days selector: native parent <select> overlay; desktop keeps invisible hit."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"
CSS = Path(__file__).resolve().parents[1] / "dist/assets/index-b2ecBo4-.css"

OLD_HIT = (
    'function streleDaysOverlayHit(t,e){var i=document.getElementById("stat-days-hit");'
    "if(!i||i.hidden)return!1;var l=i.getBoundingClientRect();"
    "return t>=l.left&&t<=l.right&&e>=l.top&&e<=l.bottom}"
)

NEW_HIT = (
    'function streleDaysOverlayHit(t,e){var i=document.getElementById("stat-days-overlay")||'
    'document.getElementById("stat-days-hit");if(!i||i.hidden)return!1;var l=i.getBoundingClientRect();'
    "return t>=l.left&&t<=l.right&&e>=l.top&&e<=l.bottom}"
)

OLD_OVERLAY = (
    "function streleInitDaysOverlay(){if(window.__streleDaysOverlay)return;window.__streleDaysOverlay=1;"
    "var t=null,i=null,I=null;function a(l){var w=l.parentElement;if(!w)return null;"
    'w.classList.add("archive-charts-embed-wrap--overlay-host");'
    't=w.querySelector("#stat-days-hit");if(!t){t=document.createElement("button");t.type="button",'
    't.id="stat-days-hit",t.className="stat-days-hit",t.hidden=!0,t.setAttribute("aria-label","Obdobje"),'
    "w.insertBefore(t,l)}return t}function o(){if(!t||t.hidden)return;"
    't.style.top=rt+"px",t.style.left=rl+"px",t.style.width=rw+"px",t.style.height=rh+"px"}'
    'var rt=0,rl=0,rw=0,rh=0;function u(){i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-request-days-rect"},"*")}'
    'document.addEventListener("click",function(p){var d=p.target;if(!d||d.id!=="stat-days-hit")return;'
    'p.preventDefault(),p.stopPropagation(),i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-open-days"},"*")},!0),'
    'document.addEventListener("touchend",function(p){var d=p.target;if(!d||d.id!=="stat-days-hit")return;'
    'p.preventDefault(),i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-open-days"},"*")},!0),'
    'window.addEventListener("message",function(p){var d,I;if(((d=p.data)==null?void 0:d.type)!=="strele-embed-days-rect")return;'
    'var l=[document.getElementById("archive-embed"),document.getElementById("archive-embed-full")]'
    '.find(function(R){return R&&R.contentWindow===p.source});if(!l){t&&(t.hidden=!0);return}'
    "i=l;if(!a(l)){t&&(t.hidden=!0);return}rt=+p.data.top||0,rl=+p.data.left||0,rw=+p.data.width||0,rh=+p.data.height||0;"
    'if(!rw||!rh){t.hidden=!0;return}t.hidden=!1,o()}),'
    'window.addEventListener("resize",function(){clearTimeout(I),I=setTimeout(u,40)},{passive:!0})}'
)

NEW_OVERLAY = (
    "function streleInitDaysOverlay(){if(window.__streleDaysOverlay)return;window.__streleDaysOverlay=1;"
    "var t=null,e=null,i=null,I=null,m=window.matchMedia(\"(max-width:899px)\").matches;"
    "function a(l){var w=l.parentElement;if(!w)return null;"
    'w.classList.add("archive-charts-embed-wrap--overlay-host");'
    "if(m){t=w.querySelector(\"#stat-days-overlay\");if(!t){t=document.createElement(\"div\");"
    't.id="stat-days-overlay",t.className="stat-days-overlay",t.hidden=!0,'
    't.innerHTML=\'<select id="stat-days-overlay-select" aria-label="Obdobje">'
    '<option value="7">7 dni</option><option value="14">14 dni</option>'
    '<option value="30">30 dni</option><option value="90">90 dni</option></select>\','
    "w.insertBefore(t,l)}e=t.querySelector(\"select\")}else{t=w.querySelector(\"#stat-days-hit\");"
    "if(!t){t=document.createElement(\"button\");t.type=\"button\",t.id=\"stat-days-hit\","
    't.className="stat-days-hit",t.hidden=!0,t.setAttribute("aria-label","Obdobje"),w.insertBefore(t,l)}}return t}'
    "function o(){if(!t||t.hidden)return;"
    't.style.top=rt+"px",t.style.left=rl+"px",t.style.width=rw+"px",t.style.height=rh+"px"}'
    'var rt=0,rl=0,rw=0,rh=0;function u(){i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-request-days-rect"},"*")}'
    'm||document.addEventListener("click",function(p){var d=p.target;if(!d||d.id!=="stat-days-hit")return;'
    'p.preventDefault(),p.stopPropagation(),i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-open-days"},"*")},!0);'
    'm||document.addEventListener("touchend",function(p){var d=p.target;if(!d||d.id!=="stat-days-hit")return;'
    'p.preventDefault(),i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-open-days"},"*")},!0);'
    'document.addEventListener("change",function(p){var d=p.target;if(!d||d.id!=="stat-days-overlay-select")return;'
    'i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-set-days",days:Number(d.value)},"*")},!0);'
    'window.addEventListener("message",function(p){var d;if(((d=p.data)==null?void 0:d.type)!=="strele-embed-days-rect")return;'
    'var l=[document.getElementById("archive-embed"),document.getElementById("archive-embed-full")]'
    '.find(function(R){return R&&R.contentWindow===p.source});if(!l){t&&(t.hidden=!0);return}'
    "i=l;if(!a(l)){t&&(t.hidden=!0);return}rt=+p.data.top||0,rl=+p.data.left||0,rw=+p.data.width||0,rh=+p.data.height||0;"
    'if(!rw||!rh){t.hidden=!0;return}t.hidden=!1;var y=String(p.data.days||30);e&&e.value!==y&&(e.value=y),o()});'
    'window.addEventListener("scroll",function(){o()},{passive:!0});'
    'window.addEventListener("resize",function(){clearTimeout(I),I=setTimeout(function(){o(),u()},40)},{passive:!0})}'
)

CSS_OLD_HIT = (
    ".stat-days-hit{position:absolute;z-index:5;pointer-events:auto;margin:0;padding:0;"
    "border:0;opacity:0;cursor:pointer;background:transparent}\n"
)

CSS_NEW = (
    ".stat-days-overlay{position:absolute;z-index:20;pointer-events:auto;margin:0;padding:0;box-sizing:border-box}\n"
    ".stat-days-overlay select{width:100%;height:100%;box-sizing:border-box;font:inherit;font-size:.8125rem;"
    "padding:.15rem 1.75rem .15rem .45rem;border-radius:8px;border:1px solid var(--border);"
    "background-color:var(--bg-deep);color:var(--text);min-height:32px;cursor:pointer;"
    "-webkit-tap-highlight-color:transparent;-webkit-appearance:none;-moz-appearance:none;appearance:none;"
    "background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' "
    "viewBox='0 0 12 12'%3E%3Cpath fill='%23f2f2f2' d='M6 8L2 4h8z'/%3E%3C/svg%3E\");"
    "background-repeat:no-repeat;background-position:right 8px center}\n"
    ".stat-days-hit{position:absolute;z-index:20;pointer-events:auto;margin:0;padding:0;border:0;opacity:0;"
    "cursor:pointer;background:transparent;min-height:36px;-webkit-tap-highlight-color:transparent}\n"
)


def main() -> None:
    js = JS.read_text()
    css = CSS.read_text()

    if OLD_HIT in js:
        js = js.replace(OLD_HIT, NEW_HIT, 1)
        print("JS: streleDaysOverlayHit")
    elif "stat-days-overlay" in js[js.find("function streleDaysOverlayHit") : js.find("function streleDaysOverlayHit") + 200]:
        print("JS: streleDaysOverlayHit already updated")
    else:
        raise SystemExit("streleDaysOverlayHit pattern not found")

    if OLD_OVERLAY in js:
        js = js.replace(OLD_OVERLAY, NEW_OVERLAY, 1)
        print("JS: streleInitDaysOverlay mobile select")
    elif "stat-days-overlay-select" in js:
        print("JS: streleInitDaysOverlay already mobile")
    else:
        raise SystemExit("streleInitDaysOverlay pattern not found")

    JS.write_text(js)

    if ".stat-days-overlay{" not in css:
        css = css.replace(CSS_OLD_HIT, CSS_NEW, 1)
        if ".stat-days-overlay{" not in css:
            css = css.rstrip() + "\n" + CSS_NEW
        print("CSS: days overlay styles")
    else:
        css = css.replace(CSS_OLD_HIT, "", 1)
        if ".stat-days-hit{position:absolute;z-index:5" in css:
            css = css.replace(
                ".stat-days-hit{position:absolute;z-index:5;pointer-events:auto;margin:0;padding:0;border:0;opacity:0;cursor:pointer;background:transparent}",
                ".stat-days-hit{position:absolute;z-index:20;pointer-events:auto;margin:0;padding:0;border:0;opacity:0;cursor:pointer;background:transparent;min-height:36px;-webkit-tap-highlight-color:transparent}",
            )
        print("CSS: days overlay already present, hit z-index bumped")

    CSS.write_text(css)


if __name__ == "__main__":
    main()
