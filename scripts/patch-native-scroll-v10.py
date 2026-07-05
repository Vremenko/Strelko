#!/usr/bin/env python3
"""Native scroll over chart iframes: pointer-events none + parent tap/days toolbar."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = ROOT / "dist/assets/index-DijleoXU.js"
CSS = ROOT / "dist/assets/index-b2ecBo4-.css"

NATIVE_CSS = """
/* —— native chart scroll (v10) —— */
#archive-embed,#archive-embed-full{pointer-events:none!important;touch-action:pan-y}
.stat-embed-toolbar{pointer-events:auto;display:flex;align-items:center;margin:0 0 .75rem;gap:.75rem}
.stat-embed-toolbar .toolbar-label{color:var(--muted);font-size:.875rem}
.stat-embed-toolbar select{min-height:40px;padding:.35rem .75rem;border-radius:8px;border:1px solid var(--border);background:var(--bg-card);color:var(--text);font:inherit}
"""

O_WRAP_OLD = """      >
        <p class="archive-charts-placeholder" aria-hidden="true">Nalagam grafe …</p>
      </div>
      <div
        class="archive-map-wrap"""

O_WRAP_NEW = """      >
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

JG_OLD = 'new URLSearchParams({days:"30",controls:"1",stats:"1"'
JG_NEW = 'new URLSearchParams({days:"30",controls:e==="preview"?"1":"0",stats:"1"'

WHEEL_OLD = (
    'if(((p=i.data)==null?void 0:p.type)==="strele-embed-wheel"){'
    'const l=[document.getElementById("archive-embed"),document.getElementById("archive-embed-full")]'
    '.find(d=>d&&d.contentWindow===i.source);'
    'l&&window.scrollBy({top:i.data.deltaY||0,left:i.data.deltaX||0,behavior:"auto"});return}'
)

WHEEL_NEW = (
    'if(((p=i.data)==null?void 0:p.type)==="strele-embed-wheel"){'
    'fetch("http://localhost:7377/ingest/2b501dc8-b972-417d-996d-322ca0fd3930",{method:"POST",'
    'headers:{"Content-Type":"application/json","X-Debug-Session-Id":"0ca70e"},'
    'body:JSON.stringify({sessionId:"0ca70e",location:"index:synthetic-scroll",'
    'message:"synthetic scrollBy",data:{dy:i.data.deltaY||0,dx:i.data.deltaX||0},'
    'timestamp:Date.now(),hypothesisId:"A",runId:"native-v10"})}).catch(()=>{});return}'
)

INIT_HELPERS = r"""function xB(){if(window.__streleEmbedTap)return;window.__streleEmbedTap=1;let a=null,b=0,c=0,d=!1;document.addEventListener("touchstart",function(e){if(e.touches.length!==1)return;var f=e.target.closest(".archive-charts-embed-wrap,.archive-charts-embed-wrap--full");if(!f||f.querySelector("#stat-embed-toolbar")&&f.querySelector("#stat-embed-toolbar").contains(e.target))return;a=f.querySelector("iframe.archive-charts-embed");if(!a)return;b=e.touches[0].clientX;c=e.touches[0].clientY;d=!1},{passive:!0});document.addEventListener("touchmove",function(e){if(!a||e.touches.length!==1)return;(Math.abs(e.touches[0].clientX-b)>10||Math.abs(e.touches[0].clientY-c)>10)&&(d=!0)},{passive:!0});document.addEventListener("touchend",function(e){if(!a||d){a=null;return}var f=a.getBoundingClientRect(),g=e.changedTouches[0].clientX,h=e.changedTouches[0].clientY;if(g<f.left||g>f.right||h<f.top||h>f.bottom){a=null;return}a.contentWindow&&a.contentWindow.postMessage({type:"strele-embed-chart-tap",clientX:g,clientY:h},"*");fetch("http://localhost:7377/ingest/2b501dc8-b972-417d-996d-322ca0fd3930",{method:"POST",headers:{"Content-Type":"application/json","X-Debug-Session-Id":"0ca70e"},body:JSON.stringify({sessionId:"0ca70e",location:"index:chart-tap",message:"forward chart tap",data:{x:g,y:h},timestamp:Date.now(),hypothesisId:"tap",runId:"native-v10"})}).catch(()=>{});a=null},{passive:!0});document.addEventListener("click",function(e){var f=e.target.closest(".archive-charts-embed-wrap,.archive-charts-embed-wrap--full");if(!f||f.querySelector("#stat-embed-toolbar")&&f.querySelector("#stat-embed-toolbar").contains(e.target))return;var g=f.querySelector("iframe.archive-charts-embed");g&&g.contentWindow&&g.contentWindow.postMessage({type:"strele-embed-chart-tap",clientX:e.clientX,clientY:e.clientY},"*")})}function wB(){var e=document.getElementById("stat-days-select");if(!e||e.dataset.bound)return;e.dataset.bound="1";e.addEventListener("change",function(){var t=document.getElementById("archive-embed-full");t&&t.contentWindow&&t.contentWindow.postMessage({type:"strele-embed-set-days",days:Number(e.value)},"*")})}"""

ZI_OLD = "OB();oe.view===\"landing\""
ZI_NEW = "OB(),xB(),wB();oe.view===\"landing\""


def main() -> None:
    css = CSS.read_text(encoding="utf-8")
    if "native chart scroll (v10)" not in css:
        css = css.rstrip() + NATIVE_CSS
        CSS.write_text(css, encoding="utf-8")
        print("CSS: added native scroll v10 rules")
    else:
        print("CSS: v10 already present")

    js = JS.read_text(encoding="utf-8")
    changed = False

    if O_WRAP_OLD not in js:
        if "stat-embed-toolbar" in js:
            print("JS: oB toolbar already present")
        else:
            raise SystemExit("oB wrap anchor not found")
    else:
        js = js.replace(O_WRAP_OLD, O_WRAP_NEW, 1)
        changed = True
        print("JS: added stat-embed-toolbar to oB")

    if JG_OLD not in js:
        if 'controls:e==="preview"?"1":"0"' in js:
            print("JS: Jg controls already patched")
        else:
            raise SystemExit("Jg anchor not found")
    else:
        js = js.replace(JG_OLD, JG_NEW, 1)
        changed = True
        print("JS: Jg full embed controls=0")

    if WHEEL_OLD not in js:
        if "synthetic scrollBy" in js:
            print("JS: wheel handler already instrumented")
        else:
            raise SystemExit("strele-embed-wheel handler not found")
    else:
        js = js.replace(WHEEL_OLD, WHEEL_NEW, 1)
        changed = True
        print("JS: disabled synthetic scrollBy (log only)")

    if "function xB()" not in js:
        anchor = "function zi(){"
        if anchor not in js:
            raise SystemExit("zi() anchor not found")
        js = js.replace(anchor, INIT_HELPERS + anchor, 1)
        changed = True
        print("JS: added xB/wB helpers")

    if ZI_OLD not in js:
        if "xB(),wB()" in js:
            print("JS: zi already calls xB/wB")
        else:
            raise SystemExit("zi OB() anchor not found")
    else:
        js = js.replace(ZI_OLD, ZI_NEW, 1)
        changed = True
        print("JS: zi calls xB/wB")

    if changed:
        JS.write_text(js, encoding="utf-8")


if __name__ == "__main__":
    main()
