#!/usr/bin/env python3
"""Fix v11 name collisions (CB, yB) and corrupted zi()."""
from pathlib import Path

JS = Path(__file__).resolve().parents[1] / "dist/assets/index-DijleoXU.js"

BROKEN_START = 'function CB(t,e){for(var i of["archive-embed-full","archive-embed"]'
BROKEN_ZI = "function zi(){ion zi(){"

FIXED = r"""function streleEmbedAtPoint(t,e){for(var i of["archive-embed-full","archive-embed"]){var l=document.getElementById(i);if(!l)continue;var u=l.getBoundingClientRect();if(t>=u.left&&t<=u.right&&e>=u.top&&e<=u.bottom)return l}return null}function streleDaysOverlayHit(t,e){var i=document.getElementById("stat-days-overlay");if(!i||i.hidden)return!1;var l=i.getBoundingClientRect();return t>=l.left&&t<=l.right&&e>=l.top&&e<=l.bottom}function streleForwardChartTap(t,e,i){t&&t.contentWindow&&t.contentWindow.postMessage({type:"strele-embed-chart-tap",clientX:e,clientY:i},"*");fetch("http://localhost:7377/ingest/2b501dc8-b972-417d-996d-322ca0fd3930",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"0ca70e"},body:JSON.stringify({sessionId:"0ca70e",location:"index:chart-tap",message:"forward chart tap",data:{x:e,y:i},timestamp:Date.now(),hypothesisId:"tap",runId:"native-v11"})}).catch(function(){})}function streleInitEmbedTap(){if(window.__streleEmbedTap)return;window.__streleEmbedTap=1;var t=null,e=0,i=0,l=!1;document.addEventListener("touchstart",function(u){if(u.touches.length!==1)return;var p=u.touches[0].clientX,d=u.touches[0].clientY;if(streleDaysOverlayHit(p,d))return;t=streleEmbedAtPoint(p,d);if(!t)return;e=p;i=d;l=!1},{passive:!0});document.addEventListener("touchmove",function(u){if(!t||u.touches.length!==1)return;(Math.abs(u.touches[0].clientX-e)>10||Math.abs(u.touches[0].clientY-i)>10)&&(l=!0)},{passive:!0});document.addEventListener("touchend",function(u){if(!t||l){t=null;return}var p=u.changedTouches[0].clientX,d=u.changedTouches[0].clientY,o=t.getBoundingClientRect();if(p<o.left||p>o.right||d<o.top||d>o.bottom||streleDaysOverlayHit(p,d)){t=null;return}streleForwardChartTap(t,p,d);t=null},{passive:!0});document.addEventListener("click",function(u){if(streleDaysOverlayHit(u.clientX,u.clientY))return;var p=streleEmbedAtPoint(u.clientX,u.clientY);p&&streleForwardChartTap(p,u.clientX,u.clientY)})}function streleInitDaysOverlay(){if(window.__streleDaysOverlay)return;window.__streleDaysOverlay=1;var t=document.createElement("div");t.id="stat-days-overlay",t.hidden=!0,t.innerHTML='<select id="stat-days-overlay-select" aria-label="Obdobje"><option value="7">7 dni</option><option value="14">14 dni</option><option value="30">30 dni</option><option value="90">90 dni</option></select>',document.body.appendChild(t);var e=t.querySelector("select"),i=null,l=null;function u(){if(!i||!i.contentWindow)return;i.contentWindow.postMessage({type:"strele-embed-request-days-rect"},"*")}e.addEventListener("change",function(){i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-set-days",days:Number(e.value)},"*")}),window.addEventListener("message",function(p){var d,w,k,I;if(((d=p.data)==null?void 0:d.type)!=="strele-embed-days-rect")return;l=[document.getElementById("archive-embed"),document.getElementById("archive-embed-full")].find(function(R){return R&&R.contentWindow===p.source})||l,i=l||i;var V=+p.data.top||0,Z=+p.data.left||0,Q=+p.data.width||0,K=+p.data.height||0;if(!Q||!K||!l){t.hidden=!0;return}t.hidden=!1,t.style.top=V+"px",t.style.left=Z+"px",t.style.width=Q+"px",t.style.height=K+"px",w=String(p.data.days||30),e.value!==w&&(e.value=w),fetch("http://localhost:7377/ingest/2b501dc8-b972-417d-996d-322ca0fd3930",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"0ca70e"},body:JSON.stringify({sessionId:"0ca70e",location:"index:days-overlay",message:"position overlay",data:{top:V,left:Z,w:Q,h:K,days:w},timestamp:Date.now(),hypothesisId:"days",runId:"native-v11"})}).catch(function(){})}),window.addEventListener("scroll",function(){clearTimeout(k),k=setTimeout(u,40)},{passive:!0}),window.addEventListener("resize",function(){clearTimeout(I),I=setTimeout(u,40)},{passive:!0})}function zi(){"""


def main() -> None:
    js = JS.read_text(encoding="utf-8")

    if BROKEN_ZI not in js:
        if "function streleInitEmbedTap()" in js and "ion zi(){" not in js:
            print("Already fixed")
            return
        raise SystemExit("corrupted zi() anchor not found")

    i0 = js.find(BROKEN_START)
    i1 = js.find(BROKEN_ZI)
    if i0 < 0 or i1 < i0:
        raise SystemExit("helper block anchors not found")

    js = js[:i0] + FIXED + js[i1 + len(BROKEN_ZI) :]
    js = js.replace("OB(),xB(),yB();", "OB(),streleInitEmbedTap(),streleInitDaysOverlay();")

    JS.write_text(js, encoding="utf-8")
    print("Fixed name collisions and zi() corruption")


if __name__ == "__main__":
    main()
