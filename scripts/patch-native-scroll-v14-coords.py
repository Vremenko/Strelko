#!/usr/bin/env python3
"""Days overlay: iframe-local rect + iframe offset on scroll."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

OLD = (
    "function streleInitDaysOverlay(){if(window.__streleDaysOverlay)return;window.__streleDaysOverlay=1;"
    'var t=document.createElement("div");t.id="stat-days-overlay",t.hidden=!0,'
    't.innerHTML=\'<select id="stat-days-overlay-select" aria-label="Obdobje">'
    '<option value="7">7 dni</option><option value="14">14 dni</option>'
    '<option value="30">30 dni</option><option value="90">90 dni</option></select>\','
    "document.body.appendChild(t);var e=t.querySelector(\"select\"),i=null,at=0,al=0,rw=0,rh=0;"
    'function o(){if(t.hidden)return;t.style.top=at+"px",t.style.left=al+"px",t.style.width=rw+"px",t.style.height=rh+"px"}'
    'function u(){i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-request-days-rect"},"*")}'
    'e.addEventListener("change",function(){i&&i.contentWindow&&i.contentWindow.postMessage'
    '({type:"strele-embed-set-days",days:Number(e.value)},"*")}),window.addEventListener("message",function(p){'
    'var d,w,k,I;if(((d=p.data)==null?void 0:d.type)!=="strele-embed-days-rect")return;'
    'var l=[document.getElementById("archive-embed"),document.getElementById("archive-embed-full")]'
    '.find(function(R){return R&&R.contentWindow===p.source});if(!l){t.hidden=!0;return}'
    "i=l,at=+p.data.top||0,al=+p.data.left||0,rw=+p.data.width||0,rh=+p.data.height||0;"
    'if(!rw||!rh){t.hidden=!0;return}t.hidden=!1,w=String(p.data.days||30),e.value!==w&&(e.value=w),o(),'
    'fetch("http://localhost:7377/ingest/2b501dc8-b972-417d-996d-322ca0fd3930",{method:"POST",'
    'headers:{"Content-Type":"application/json","X-Debug-Session-Id":"0ca70e"},'
    'body:JSON.stringify({sessionId:"0ca70e",location:"index:days-overlay",'
    'message:"position overlay",data:{top:at,left:al,w:rw,h:rh,days:w},'
    'timestamp:Date.now(),hypothesisId:"days",runId:"native-v13"})}).catch(function(){})}),'
    'window.addEventListener("scroll",function(){clearTimeout(k),k=setTimeout(u,40)},{passive:!0}),'
    'window.addEventListener("resize",function(){clearTimeout(I),I=setTimeout(u,40)},{passive:!0})}'
)

NEW = (
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


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    if OLD not in js:
        if "runId:\"native-v14\"" in js or "f.top+rt" in js:
            print("Already v14")
            return
        raise SystemExit("streleInitDaysOverlay v13 anchor not found")
    js = js.replace(OLD, NEW, 1)
    JS.write_text(js, encoding="utf-8")
    print("Days overlay: iframe offset restored (v14)")


if __name__ == "__main__":
    main()
