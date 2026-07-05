#!/usr/bin/env python3
"""Fix tooltips (geom hit-test) + days overlay at embed toolbar position."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = ROOT / "dist/assets/index-DijleoXU.js"
CSS = ROOT / "dist/assets/index-b2ecBo4-.css"

O_WRAP_WITH_TOOLBAR = """      >
        <div class="stat-embed-toolbar" id="stat-embed-toolbar">
          <label class="toolbar-field stat-embed-days">
            <span class="toolbar-label">Obdobje</span>
            <select id="stat-days-select" aria-label="Obdobje">
              <option value="7">7 dni</option>
              <option value="14">14 dni</option>
              <option value="30" selected>30 dni</option>
              <option value="90">90 dni</option>
            </select>
          </label>
        </div>
        <p class="archive-charts-placeholder" aria-hidden="true">Nalagam grafe …</p>
      </div>
      <div
        class="archive-map-wrap"""

O_WRAP_PLAIN = """      >
        <p class="archive-charts-placeholder" aria-hidden="true">Nalagam grafe …</p>
      </div>
      <div
        class="archive-map-wrap"""

JG_CONTROLS_OFF = 'controls:e==="preview"?"1":"0"'
JG_CONTROLS_ON = 'controls:"1"'

OLD_HELPERS_START = "function xB(){if(window.__streleEmbedTap)"
OLD_HELPERS_END = '},"*")})}function zi(){'

NEW_HELPERS = r"""function CB(t,e){for(var i of["archive-embed-full","archive-embed"]){var l=document.getElementById(i);if(!l)continue;var u=l.getBoundingClientRect();if(t>=u.left&&t<=u.right&&e>=u.top&&e<=u.bottom)return l}return null}function DB(t,e){var i=document.getElementById("stat-days-overlay");if(!i||i.hidden)return!1;var l=i.getBoundingClientRect();return t>=l.left&&t<=l.right&&e>=l.top&&e<=l.bottom}function EB(t,e,i){t&&t.contentWindow&&t.contentWindow.postMessage({type:"strele-embed-chart-tap",clientX:e,clientY:i},"*");fetch("http://localhost:7377/ingest/2b501dc8-b972-417d-996d-322ca0fd3930",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"0ca70e"},body:JSON.stringify({sessionId:"0ca70e",location:"index:chart-tap",message:"forward chart tap",data:{x:e,y:i},timestamp:Date.now(),hypothesisId:"tap",runId:"native-v11"})}).catch(function(){})}function xB(){if(window.__streleEmbedTap)return;window.__streleEmbedTap=1;var t=null,e=0,i=0,l=!1;document.addEventListener("touchstart",function(u){if(u.touches.length!==1)return;var p=u.touches[0].clientX,d=u.touches[0].clientY;if(DB(p,d))return;t=CB(p,d);if(!t)return;e=p;i=d;l=!1},{passive:!0});document.addEventListener("touchmove",function(u){if(!t||u.touches.length!==1)return;(Math.abs(u.touches[0].clientX-e)>10||Math.abs(u.touches[0].clientY-i)>10)&&(l=!0)},{passive:!0});document.addEventListener("touchend",function(u){if(!t||l){t=null;return}var p=u.changedTouches[0].clientX,d=u.changedTouches[0].clientY,o=t.getBoundingClientRect();if(p<o.left||p>o.right||d<o.top||d>o.bottom||DB(p,d)){t=null;return}EB(t,p,d);t=null},{passive:!0});document.addEventListener("click",function(u){if(DB(u.clientX,u.clientY))return;var p=CB(u.clientX,u.clientY);p&&EB(p,u.clientX,u.clientY)})}function yB(){if(window.__streleDaysOverlay)return;window.__streleDaysOverlay=1;var t=document.createElement("div");t.id="stat-days-overlay",t.hidden=!0,t.innerHTML='<select id="stat-days-overlay-select" aria-label="Obdobje"><option value="7">7 dni</option><option value="14">14 dni</option><option value="30">30 dni</option><option value="90">90 dni</option></select>',document.body.appendChild(t);var e=t.querySelector("select"),i=null,l=null;function u(){if(!i||!i.contentWindow)return;i.contentWindow.postMessage({type:"strele-embed-request-days-rect"},"*")}e.addEventListener("change",function(){i&&i.contentWindow&&i.contentWindow.postMessage({type:"strele-embed-set-days",days:Number(e.value)},"*")}),window.addEventListener("message",function(p){var d,o,w,k,I;if(((d=p.data)==null?void 0:d.type)!=="strele-embed-days-rect")return;l=[document.getElementById("archive-embed"),document.getElementById("archive-embed-full")].find(function(R){return R&&R.contentWindow===p.source})||l,i=l||i;var V=+p.data.top||0,Z=+p.data.left||0,Q=+p.data.width||0,K=+p.data.height||0;if(!Q||!K||!l){t.hidden=!0;return}t.hidden=!1,t.style.top=V+"px",t.style.left=Z+"px",t.style.width=Q+"px",t.style.height=K+"px",w=String(p.data.days||30),e.value!==w&&(e.value=w),fetch("http://localhost:7377/ingest/2b501dc8-b972-417d-996d-322ca0fd3930",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"0ca70e"},body:JSON.stringify({sessionId:"0ca70e",location:"index:days-overlay",message:"position overlay",data:{top:V,left:Z,w:Q,h:K,days:w},timestamp:Date.now(),hypothesisId:"days",runId:"native-v11"})}).catch(function(){})}),window.addEventListener("scroll",function(){clearTimeout(k),k=setTimeout(u,40)},{passive:!0}),window.addEventListener("resize",function(){clearTimeout(I),I=setTimeout(u,40)},{passive:!0})}function zi(){"""

ZI_WB = "OB(),xB(),wB();oe.view===\"landing\""
ZI_YB = "OB(),xB(),yB();oe.view===\"landing\""

CSS_OLD = """
.stat-embed-toolbar{pointer-events:auto;display:flex;align-items:center;margin:0 0 .75rem;gap:.75rem}
.stat-embed-toolbar .toolbar-label{color:var(--muted);font-size:.875rem}
.stat-embed-toolbar select{min-height:40px;padding:.35rem .75rem;border-radius:8px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);font:inherit}
"""

CSS_NEW = """
.stat-days-overlay{position:fixed;z-index:60;pointer-events:auto;margin:0;padding:0;box-sizing:border-box}
.stat-days-overlay select{width:100%;height:100%;box-sizing:border-box;font:inherit;font-size:.8125rem;padding:.35rem .65rem;border-radius:8px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);min-height:36px;cursor:pointer}
"""


def main() -> None:
    js = JS.read_text(encoding="utf-8")
    changed = False

    if O_WRAP_WITH_TOOLBAR in js:
        js = js.replace(O_WRAP_WITH_TOOLBAR, O_WRAP_PLAIN, 1)
        changed = True
        print("JS: removed parent stat-embed-toolbar")

    if JG_CONTROLS_OFF in js:
        js = js.replace(JG_CONTROLS_OFF, JG_CONTROLS_ON, 1)
        changed = True
        print("JS: Jg controls=1 restored")

    i0 = js.find(OLD_HELPERS_START)
    i1 = js.find(OLD_HELPERS_END)
    if i0 >= 0 and i1 > i0:
        js = js[:i0] + NEW_HELPERS + js[i1 + len("function zi(){") :]
        changed = True
        print("JS: replaced xB/wB with geom xB + yB overlay")
    elif "function CB(t,e)" in js:
        print("JS: v11 helpers already present")
    else:
        raise SystemExit("xB/wB block not found")

    if ZI_WB in js:
        js = js.replace(ZI_WB, ZI_YB, 1)
        changed = True
        print("JS: zi calls yB instead of wB")
    elif ZI_YB in js:
        print("JS: zi already calls yB")

    if changed:
        JS.write_text(js, encoding="utf-8")

    css = CSS.read_text(encoding="utf-8")
    if ".stat-days-overlay" not in css:
        css = css.replace(CSS_OLD, CSS_NEW)
        if ".stat-days-overlay" not in css:
            css = css.rstrip() + CSS_NEW
        CSS.write_text(css, encoding="utf-8")
        print("CSS: stat-days-overlay styles")
    else:
        print("CSS: overlay styles already present")


if __name__ == "__main__":
    main()
