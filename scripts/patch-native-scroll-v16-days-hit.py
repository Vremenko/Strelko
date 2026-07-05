#!/usr/bin/env python3
"""Replace visible days overlay with invisible hit target over embed select."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"
CSS = Path(__file__).resolve().parents[1] / "dist/assets/index-b2ecBo4-.css"

OLD_HIT = 'function streleDaysOverlayHit(t,e){var i=document.getElementById("stat-days-overlay");if(!i||i.hidden)return!1;var l=i.getBoundingClientRect();return t>=l.left&&t<=l.right&&e>=l.top&&e<=l.bottom}'

NEW_HIT = 'function streleDaysOverlayHit(t,e){var i=document.getElementById("stat-days-hit");if(!i||i.hidden)return!1;var l=i.getBoundingClientRect();return t>=l.left&&t<=l.right&&e>=l.top&&e<=l.bottom}'

OLD_OVERLAY = (
    "function streleInitDaysOverlay(){if(window.__streleDaysOverlay)return;window.__streleDaysOverlay=1;"
    "var t=null,e=null,i=null,w=null;function a(l){w=l.parentElement;if(!w)return null;"
    'w.classList.add("archive-charts-embed-wrap--overlay-host");'
    't=w.querySelector("#stat-days-overlay");if(!t){t=document.createElement("div");t.id="stat-days-overlay",t.hidden=!0,'
    't.innerHTML=\'<select id="stat-days-overlay-select" aria-label="Obdobje">'
    '<option value="7">7 dni</option><option value="14">14 dni</option>'
    '<option value="30">30 dni</option><option value="90">90 dni</option></select>\','
    "w.insertBefore(t,l)}e=t.querySelector(\"select\");return t}"
    'function o(){if(!t||t.hidden)return;t.style.top=rt+"px",t.style.left=rl+"px",t.style.width=rw+"px",t.style.height=rh+"px"}'
    'var rt=0,rl=0,rw=0,rh=0;function u(){i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-request-days-rect"},"*")}'
    'document.addEventListener("change",function(p){var d=p.target;if(!d||d.id!=="stat-days-overlay-select")return;'
    'i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-set-days",days:Number(d.value)},"*")},!0),'
    'window.addEventListener("message",function(p){var d,k,I;if(((d=p.data)==null?void 0:d.type)!=="strele-embed-days-rect")return;'
    'var l=[document.getElementById("archive-embed"),document.getElementById("archive-embed-full")]'
    '.find(function(R){return R&&R.contentWindow===p.source});if(!l){t&&(t.hidden=!0);return}'
    'i=l;if(!a(l)){t&&(t.hidden=!0);return}rt=+p.data.top||0,rl=+p.data.left||0,rw=+p.data.width||0,rh=+p.data.height||0;'
    'if(!rw||!rh){t.hidden=!0;return}t.hidden=!1;var y=String(p.data.days||30);e.value!==y&&(e.value=y),o(),'
    'fetch("http://localhost:7377/ingest/2b501dc8-b972-417d-996d-322ca0fd3930",{method:"POST",'
    'headers:{"Content-Type":"application/json","X-Debug-Session-Id":"0ca70e"},'
    'body:JSON.stringify({sessionId:"0ca70e",location:"index:days-overlay",'
    'message:"position overlay in wrap",data:{relTop:rt,relLeft:rl,w:rw,h:rh,days:y},'
    'timestamp:Date.now(),hypothesisId:"days",runId:"native-v15"})}).catch(function(){})}),'
    'window.addEventListener("resize",function(){clearTimeout(I),I=setTimeout(u,40)},{passive:!0})}'
)

NEW_OVERLAY = (
    "function streleInitDaysOverlay(){if(window.__streleDaysOverlay)return;window.__streleDaysOverlay=1;"
    "var t=null,i=null;function a(l){var w=l.parentElement;if(!w)return null;"
    'w.classList.add("archive-charts-embed-wrap--overlay-host");'
    't=w.querySelector("#stat-days-hit");if(!t){t=document.createElement("button");t.type="button",'
    't.id="stat-days-hit",t.className="stat-days-hit",t.hidden=!0,t.setAttribute("aria-label","Obdobje"),'
    "w.insertBefore(t,l)}return t}"
    'function o(){if(!t||t.hidden)return;t.style.top=rt+"px",t.style.left=rl+"px",t.style.width=rw+"px",t.style.height=rh+"px"}'
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


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    if OLD_HIT in js:
        js = js.replace(OLD_HIT, NEW_HIT, 1)
        print("Hit target: stat-days-hit")
    elif "stat-days-hit" in js:
        print("Hit target already updated")

    if OLD_OVERLAY in js:
        js = js.replace(OLD_OVERLAY, NEW_OVERLAY, 1)
        print("Invisible days hit layer")
    elif "strele-embed-open-days" in js:
        print("Overlay already v16")
    else:
        raise SystemExit("streleInitDaysOverlay anchor not found")

    JS.write_text(js, encoding="utf-8")

    css = CSS.read_text(encoding="utf-8")
    css = css.replace(
        ".stat-days-overlay{position:absolute;z-index:5;pointer-events:auto;margin:0;padding:0;box-sizing:border-box}\n"
        ".stat-days-overlay select{width:100%;height:100%;box-sizing:border-box;font:inherit;font-size:.8125rem;padding:.35rem .65rem;border-radius:8px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);min-height:36px;cursor:pointer}\n",
        "",
    )
    css = css.replace(
        "#stat-days-overlay{position:absolute;z-index:5;pointer-events:auto;margin:0;padding:0;box-sizing:border-box}\n",
        ".stat-days-hit{position:absolute;z-index:5;pointer-events:auto;margin:0;padding:0;border:0;opacity:0;cursor:pointer;background:transparent}\n",
    )
    if ".stat-days-hit{" not in css:
        css = css.rstrip() + "\n.stat-days-hit{position:absolute;z-index:5;pointer-events:auto;margin:0;padding:0;border:0;opacity:0;cursor:pointer;background:transparent}\n"
    CSS.write_text(css, encoding="utf-8")
    print("CSS: invisible hit button")


if __name__ == "__main__":
    main()
