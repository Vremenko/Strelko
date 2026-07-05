#!/usr/bin/env python3
"""Fix iframe vs parent coordinate space for tap tooltips and days overlay."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

OLD_FORWARD = (
    'function streleForwardChartTap(t,e,i){t&&t.contentWindow&&t.contentWindow.postMessage'
    '({type:"strele-embed-chart-tap",clientX:e,clientY:i},"*");fetch'
)

NEW_FORWARD = (
    'function streleForwardChartTap(t,e,i){if(!t||!t.contentWindow)return;var r=t.getBoundingClientRect();'
    't.contentWindow.postMessage({type:"strele-embed-chart-tap",clientX:e-r.left,clientY:i-r.top},"*");fetch'
)

OLD_OVERLAY = (
    'function streleInitDaysOverlay(){if(window.__streleDaysOverlay)return;window.__streleDaysOverlay=1;'
    'var t=document.createElement("div");t.id="stat-days-overlay",t.hidden=!0,'
    't.innerHTML=\'<select id="stat-days-overlay-select" aria-label="Obdobje">'
    '<option value="7">7 dni</option><option value="14">14 dni</option>'
    '<option value="30">30 dni</option><option value="90">90 dni</option></select>\','
    'document.body.appendChild(t);var e=t.querySelector("select"),i=null,l=null;'
    'function u(){if(!i||!i.contentWindow)return;i.contentWindow.postMessage({type:"strele-embed-request-days-rect"},"*")}'
    'e.addEventListener("change",function(){i&&i.contentWindow&&i.contentWindow.postMessage'
    '({type:"strele-embed-set-days",days:Number(e.value)},"*")}),window.addEventListener("message",function(p){'
    'var d,w,k,I;if(((d=p.data)==null?void 0:d.type)!=="strele-embed-days-rect")return;'
    'l=[document.getElementById("archive-embed"),document.getElementById("archive-embed-full")]'
    '.find(function(R){return R&&R.contentWindow===p.source})||l,i=l||i;'
    'var V=+p.data.top||0,Z=+p.data.left||0,Q=+p.data.width||0,K=+p.data.height||0;'
    'if(!Q||!K||!l){t.hidden=!0;return}t.hidden=!1,t.style.top=V+"px",t.style.left=Z+"px",'
    't.style.width=Q+"px",t.style.height=K+"px",w=String(p.data.days||30),e.value!==w&&(e.value=w),'
    'fetch("http://localhost:7377/ingest/2b501dc8-b972-417d-996d-322ca0fd3930",{method:"POST",'
    'headers:{"Content-Type":"application/json","X-Debug-Session-Id":"0ca70e"},'
    'body:JSON.stringify({sessionId:"0ca70e",location:"index:days-overlay",'
    'message:"position overlay",data:{top:V,left:Z,w:Q,h:K,days:w},'
    'timestamp:Date.now(),hypothesisId:"days",runId:"native-v11"})}).catch(function(){})}),'
    'window.addEventListener("scroll",function(){clearTimeout(k),k=setTimeout(u,40)},{passive:!0}),'
    'window.addEventListener("resize",function(){clearTimeout(I),I=setTimeout(u,40)},{passive:!0})}'
)

NEW_OVERLAY = (
    'function streleInitDaysOverlay(){if(window.__streleDaysOverlay)return;window.__streleDaysOverlay=1;'
    'var t=document.createElement("div");t.id="stat-days-overlay",t.hidden=!0,'
    't.innerHTML=\'<select id="stat-days-overlay-select" aria-label="Obdobje">'
    '<option value="7">7 dni</option><option value="14">14 dni</option>'
    '<option value="30">30 dni</option><option value="90">90 dni</option></select>\','
    'document.body.appendChild(t);var e=t.querySelector("select"),i=null,rt=0,rl=0,rw=0,rh=0;'
    'function o(){if(t.hidden||!i)return;var f=i.getBoundingClientRect();'
    't.style.top=f.top+rt+"px",t.style.left=f.left+rl+"px",t.style.width=rw+"px",t.style.height=rh+"px"}'
    'function u(){i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-request-days-rect"},"*")}'
    'e.addEventListener("change",function(){i&&i.contentWindow&&i.contentWindow.postMessage'
    '({type:"strele-embed-set-days",days:Number(e.value)},"*")}),window.addEventListener("message",function(p){'
    'var d,w,k,I;if(((d=p.data)==null?void 0:d.type)!=="strele-embed-days-rect")return;'
    'var l=[document.getElementById("archive-embed"),document.getElementById("archive-embed-full")]'
    '.find(function(R){return R&&R.contentWindow===p.source});if(!l){t.hidden=!0;return}'
    'i=l,rt=+p.data.top||0,rl=+p.data.left||0,rw=+p.data.width||0,rh=+p.data.height||0;'
    'if(!rw||!rh){t.hidden=!0;return}t.hidden=!1,w=String(p.data.days||30),e.value!==w&&(e.value=w),o(),'
    'fetch("http://localhost:7377/ingest/2b501dc8-b972-417d-996d-322ca0fd3930",{method:"POST",'
    'headers:{"Content-Type":"application/json","X-Debug-Session-Id":"0ca70e"},'
    'body:JSON.stringify({sessionId:"0ca70e",location:"index:days-overlay",'
    'message:"position overlay",data:{relTop:rt,relLeft:rl,w:rw,h:rh,iframeTop:i.getBoundingClientRect().top,days:w},'
    'timestamp:Date.now(),hypothesisId:"days",runId:"native-v12"})}).catch(function(){})}),'
    'window.addEventListener("scroll",function(){o()},{passive:!0}),'
    'window.addEventListener("resize",function(){clearTimeout(I),I=setTimeout(function(){o(),u()},40)},{passive:!0})}'
)


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    if OLD_FORWARD not in js:
        if "clientX:e-r.left" in js:
            print("Forward coords already fixed")
        else:
            raise SystemExit("streleForwardChartTap anchor not found")
    else:
        js = js.replace(OLD_FORWARD, NEW_FORWARD, 1)
        print("Fixed chart-tap iframe coords")

    if OLD_OVERLAY not in js:
        if "function o(){if(t.hidden||!i)return;var f=i.getBoundingClientRect()" in js:
            print("Days overlay already fixed")
        else:
            raise SystemExit("streleInitDaysOverlay anchor not found")
    else:
        js = js.replace(OLD_OVERLAY, NEW_OVERLAY, 1)
        print("Fixed days overlay positioning")

    JS.write_text(js, encoding="utf-8")


if __name__ == "__main__":
    main()
