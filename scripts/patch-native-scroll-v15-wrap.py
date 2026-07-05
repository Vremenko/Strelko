#!/usr/bin/env python3
"""Days overlay inside embed wrap (absolute); no viewport math."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"
CSS = Path(__file__).resolve().parents[1] / "dist/assets/index-b2ecBo4-.css"

OLD = (
    "function streleInitDaysOverlay(){if(window.__streleDaysOverlay)return;window.__streleDaysOverlay=1;"
    'var t=document.createElement("div");t.id="stat-days-overlay",t.hidden=!0,'
    't.innerHTML=\'<select id="stat-days-overlay-select" aria-label="Obdobje">'
    '<option value="7">7 dni</option><option value="14">14 dni</option>'
    '<option value="30">30 dni</option><option value="90">90 dni</option></select>\','
    "document.body.appendChild(t);var e=t.querySelector(\"select\"),i=null,rt=0,rl=0,rw=0,rh=0;"
    "function o(){if(t.hidden||!i)return;var f=i.getBoundingClientRect();"
    't.style.top=f.top+rt+"px",t.style.left=f.left+rl+"px",t.style.width=rw+"px",t.style.height=rh+"px"}'
    'function u(){i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-request-days-rect"},"*")}'
    'e.addEventListener("change",function(){i&&i.contentWindow&&i.contentWindow.postMessage'
    '({type:"strele-embed-set-days",days:Number(e.value)},"*")}),window.addEventListener("message",function(p){'
    'var d,w,k,I;if(((d=p.data)==null?void 0:d.type)!=="strele-embed-days-rect")return;'
    'var l=[document.getElementById("archive-embed"),document.getElementById("archive-embed-full")]'
    '.find(function(R){return R&&R.contentWindow===p.source});if(!l){t.hidden=!0;return}'
    "i=l,rt=+p.data.top||0,rl=+p.data.left||0,rw=+p.data.width||0,rh=+p.data.height||0;"
    'if(!rw||!rh){t.hidden=!0;return}t.hidden=!1,w=String(p.data.days||30),e.value!==w&&(e.value=w),o(),'
    'fetch("http://localhost:7377/ingest/2b501dc8-b972-417d-996d-322ca0fd3930",{method:"POST",'
    'headers:{"Content-Type":"application/json","X-Debug-Session-Id":"0ca70e"},'
    'body:JSON.stringify({sessionId:"0ca70e",location:"index:days-overlay",'
    'message:"position overlay",data:{relTop:rt,relLeft:rl,w:rw,h:rh,iframeTop:i.getBoundingClientRect().top,days:w},'
    'timestamp:Date.now(),hypothesisId:"days",runId:"native-v14"})}).catch(function(){})}),'
    'window.addEventListener("scroll",function(){o()},{passive:!0}),'
    'window.addEventListener("resize",function(){clearTimeout(I),I=setTimeout(function(){o(),u()},40)},{passive:!0})}'
)

NEW = (
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

CSS_SNIPPET = """
.archive-charts-embed-wrap--overlay-host{position:relative}
#stat-days-overlay{position:absolute;z-index:5;pointer-events:auto;margin:0;padding:0;box-sizing:border-box}
"""


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    if OLD not in js:
        if "position overlay in wrap" in js:
            print("Already v15")
        else:
            raise SystemExit("streleInitDaysOverlay anchor not found")
    else:
        js = js.replace(OLD, NEW, 1)
        JS.write_text(js, encoding="utf-8")
        print("Days overlay in wrap (v15)")

    css = CSS.read_text(encoding="utf-8")
    if "archive-charts-embed-wrap--overlay-host" not in css:
        css = css.replace(
            ".stat-days-overlay{position:fixed;z-index:120;",
            ".stat-days-overlay{position:absolute;z-index:5;",
        )
        css = css.rstrip() + CSS_SNIPPET
        CSS.write_text(css, encoding="utf-8")
        print("CSS overlay host")


if __name__ == "__main__":
    main()
