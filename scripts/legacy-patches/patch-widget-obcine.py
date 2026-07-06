#!/usr/bin/env python3
"""Posodobitev /widget-obcine — en predogled s preklopom osnovni/razširjeni."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from patch_css_block import strip_css_block

JS_PATH = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("dist/assets/index-DijleoXU.js")
CSS_PATH = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("dist/assets/index-b2ecBo4-.css")

CSS_MARKER = "/* —— widget občine page —— */"

JS_ANCHOR_STARTS = (
    "function yB(){oe.publicWidgetMode",
    "function yB(){oe.publicWidgetObMids",
)

JS_OLD_WIDGET_LISTENERS = (
    '(k=ot("#public-widget-obcina"))==null||k.addEventListener("change",ge=>{NBw(ge.target.value).then(()=>na()?zi():zl())}),(Z=ot("#public-widget-theme"))==null||Z.addEventListener("change",ge=>{oe.publicWidgetTheme=ge.target.value,na()?zi():zl()}),(Q=ot("#public-widget-defaults"))==null||Q.addEventListener("click",()=>{yB(),NBw(Uu).then(()=>na()?zi():zl())}),(be=ot("#public-widget-copy-compact"))==null||be.addEventListener("click",()=>{const ge=ot("#public-widget-embed-compact");ge&&navigator.clipboard&&navigator.clipboard.writeText(ge.value).catch(()=>{})}),(Ee=ot("#public-widget-copy-full"))==null||Ee.addEventListener("click",()=>{const ge=ot("#public-widget-embed-full");ge&&navigator.clipboard&&navigator.clipboard.writeText(ge.value).catch(()=>{})})'
)

JS_DUAL_WIDGET_LISTENERS = (
    '(k=ot("#public-widget-obcina"))==null||k.addEventListener("change",ge=>{NBw(ge.target.value).then(()=>na()&&zl())}),(Z=ot("#public-widget-theme"))==null||Z.addEventListener("change",ge=>{oe.publicWidgetTheme=ge.target.value,na()&&zl()}),(Q=ot("#public-widget-defaults"))==null||Q.addEventListener("click",()=>{yB(),NBw(Uu).then(()=>na()?zi():zl())}),(be=ot("#public-widget-copy-compact"))==null||be.addEventListener("click",()=>{const ge=ot("#public-widget-embed-compact");ge&&navigator.clipboard&&navigator.clipboard.writeText(ge.value).catch(()=>{})}),(Ee=ot("#public-widget-copy-full"))==null||Ee.addEventListener("click",()=>{const ge=ot("#public-widget-embed-full");ge&&navigator.clipboard&&navigator.clipboard.writeText(ge.value).catch(()=>{})})'
)

JS_TOGGLE_WIDGET_LISTENERS = (
    '(k=ot("#public-widget-obcina"))==null||k.addEventListener("change",ge=>{NBw(ge.target.value).then(()=>na()&&zl())}),(Z=ot("#public-widget-theme"))==null||Z.addEventListener("change",ge=>{oe.publicWidgetTheme=ge.target.value,na()&&zl()}),(Q=ot("#public-widget-defaults"))==null||Q.addEventListener("click",()=>{yB(),NBw(Uu).then(()=>na()?zi():zl())}),(be=ot("#public-widget-copy"))==null||be.addEventListener("click",()=>{const ge=ot("#public-widget-embed-code");ge&&navigator.clipboard&&navigator.clipboard.writeText(ge.value).catch(()=>{})}),(J=ot("#public-widget-mode-compact"))==null||J.addEventListener("click",()=>{oe.publicWidgetPreviewSize="compact",na()&&zl()}),(Ee=ot("#public-widget-mode-full"))==null||Ee.addEventListener("click",()=>{oe.publicWidgetPreviewSize="full",na()&&zl()})'
)

JS_DOCKER_OLD_LISTENERS = (
    '(w=ot("#public-widget-add-obcina"))==null||w.addEventListener("click",()=>{const ge=ot("#public-widget-obcina-add"),de=Number(ge==null?void 0:ge.value);!de||!Z3(de)||(oe.publicWidgetMultiMode=!0,na()?zi():zl())}),(k=ot("#public-widget-obcina"))==null||k.addEventListener("change",ge=>{$3(ge.target.value),na()?zi():zl()}),(I=ot("#public-widget-multi-toggle"))==null||I.addEventListener("click",()=>{U3(),na()?zi():zl()}),(R=ot("#public-widget-selected"))==null||R.addEventListener("click",ge=>{const de=ge.target.closest("[data-remove-ob-mid]");de&&(q3(de.dataset.removeObMid),na()?zi():zl())}),(V=ot("#public-widget-title"))==null||V.addEventListener("input",ge=>{oe.publicWidgetTitle=ge.target.value.slice(0,80),zl()}),(Z=ot("#public-widget-theme"))==null||Z.addEventListener("change",ge=>{QP(ge.target.value),na()?zi():zl()}),(Q=ot("#public-widget-defaults"))==null||Q.addEventListener("click",()=>{yB(),na()?zi():zl()}),xB(),(K=ot("#public-widget-map-lock"))==null||K.addEventListener("click",()=>{var ge;oe.publicWidgetMapZoom=Vl(((ge=ot("#public-widget-map-zoom"))==null?void 0:ge.value)??oe.publicWidgetMapZoom),oe.publicWidgetMapZoomLocked=!0,na()?zi():zl()}),(J=ot("#public-widget-map-unlock"))==null||J.addEventListener("click",()=>{oe.publicWidgetMapZoomLocked=!1,na()?zi():zl()}),(ve=ot("#public-widget-map-zoom"))==null||ve.addEventListener("input",ge=>{oe.publicWidgetMapZoomLocked||(oe.publicWidgetMapZoom=Vl(ge.target.value),Bp(),Oy(oe.publicWidgetMapZoom))}),(be=ot("#public-widget-map-zoom-out"))==null||be.addEventListener("click",()=>{oe.publicWidgetMapZoomLocked||(oe.publicWidgetMapZoom=Vl(oe.publicWidgetMapZoom-xg),Bp(),Oy(oe.publicWidgetMapZoom))}),(Ee=ot("#public-widget-map-zoom-in"))==null||Ee.addEventListener("click",()=>{oe.publicWidgetMapZoomLocked||(oe.publicWidgetMapZoom=Vl(oe.publicWidgetMapZoom+xg),Bp(),Oy(oe.publicWidgetMapZoom))})'
)

JS_RESIZE_GLOBAL_OLD = 'document.getElementById("public-obcina-widget-iframe")'
JS_RESIZE_GLOBAL_NEW = 'document.getElementById("public-widget-iframe")'

JS_OLD_AB_TAIL = "})})}}function EB(){"
JS_NEW_AB_TAIL = "})})}await RWw()}function EB(){"

JS_OLD_EJ_INIT = "zi(),kB(),AB().then(()=>{na()&&zi()})"
JS_NEW_EJ_INIT = 'oe.view==="widget-obcine"&&(oe.publicWidgetObMid=oe.publicWidgetObMid||Uu),zi(),kB(),AB().then(()=>{na()&&zl()})'

JS_RESIZE_DUAL = (
    'document.getElementById("public-widget-iframe-compact"),document.getElementById("public-widget-iframe-full")'
)
JS_RESIZE_SINGLE = 'document.getElementById("public-widget-iframe")'

WIDGET_JS = r"""function yB(){oe.publicWidgetMode="obcina",oe.publicWidgetObMid=Uu,oe.publicWidgetObMids=[Uu],oe.publicWidgetTitle="",oe.publicWidgetLabel="",oe.publicWidgetTheme=oe.publicWidgetTheme||"dark",oe.publicWidgetLat=null,oe.publicWidgetLon=null,oe.publicWidgetMultiMode=!1,oe.publicWidgetPreviewSize=oe.publicWidgetPreviewSize||"compact"}function publicWidgetCenter(){return oe.publicWidgetLat!=null&&oe.publicWidgetLon!=null?{lat:oe.publicWidgetLat,lon:oe.publicWidgetLon,label:(oe.publicWidgetLabel||"").trim()}:null}function widgetObMid(){return oe.publicWidgetObMid||Number((ot("#public-widget-obcina")||{}).value)||da()[0]||Uu}function widgetReady(){return!!widgetObMid()}function widgetPreviewSize(){return oe.publicWidgetPreviewSize==="full"?"full":"compact"}async function NBw(t){const e=Number(t)||Uu;oe.publicWidgetObMid=e,oe.publicWidgetObMids=[e];try{const i=await fetch(`/widget/api/obcina-widget?ob_mid=${e}`);if(!i.ok)return;const l=await i.json(),u=l.bounds;u&&u.length>=2&&(oe.publicWidgetLat=(u[0][0]+u[1][0])/2,oe.publicWidgetLon=(u[0][1]+u[1][1])/2,oe.publicWidgetLabel=l.obcina||"")}catch{}}async function RWw(){await NBw(widgetObMid()),na()&&zl()}function eMw(t){const e=new URLSearchParams,i=widgetObMid();i&&e.set("ob_mid",String(i));const l=publicWidgetCenter();if(l){e.set("lat",String(l.lat)),e.set("lon",String(l.lon));const p=l.label||"";p&&e.set("label",p.slice(0,80))}return e.set("theme",oe.publicWidgetTheme||"dark"),e.set("size",t==="full"?"full":"compact"),e.set("api",`${location.origin}/widget/api`),e}function tMw(t){const e=eMw(t);return e.has("ob_mid")?`/widget/obcina-widget.html?${e.toString()}`:`/widget/obcina-widget.html?size=${t==="full"?"full":"compact"}`}function jMw(t){const e=eMw(t);return e.has("ob_mid")?`${location.origin}/widget/obcina-widget.html?${e.toString()}`:`${location.origin}/widget/obcina-widget.html?size=${t==="full"?"full":"compact"}`}function iMw(t){const e=t==="full",i=oe.publicWidgetTheme||"dark",l=i==="dark"?"#333333":"#f7f7f8",u="strele-obcina-"+(e?"full":"compact")+"-"+Math.random().toString(36).slice(2,8);return`<div style="width:100%;max-width:${e?"960":"450"}px;margin:0 auto"><iframe id="${u}" src="${jMw(t)}" title="Udari strel v občini — Strelko" style="width:100%;max-width:${e?"960":"450"}px;height:${e?"640":"420"}px;border:none;border-radius:14px;display:block;margin:0 auto;background:${l}"></iframe><script>(function(){var f=document.getElementById("${u}");if(!f)return;window.addEventListener("message",function(ev){if(!ev.data||ev.data.type!=="strele-embed-resize"||ev.source!==f.contentWindow)return;var h=Math.max(320,Math.min(1400,+ev.data.height||0));if(h>0)f.style.height=h+"px";});})();<\/script></div>`}function wB(){if(window.__wPR)return;window.__wPR=1;window.addEventListener("message",function(ev){if(!ev.data||ev.data.type!=="strele-embed-resize")return;var f=ot("#public-widget-iframe");if(!f||ev.source!==f.contentWindow)return;var h=Math.max(320,Math.min(1400,+ev.data.height||0));if(h>0)f.style.height=h+"px"})}function zl(){wB();const t=widgetReady(),e=widgetPreviewSize(),i=ot("#public-widget-iframe"),l=ot("#public-widget-embed-code"),u=ot("#public-widget-size-hint"),p=ot("#public-widget-preview-frame"),d=ot("#public-widget-mode-compact"),o=ot("#public-widget-mode-full");if(i){if(t){const w=tMw(e);i.src!==w&&(i.src=w);const mob=window.matchMedia("(max-width:899px)").matches;i.style.height=mob?e==="full"?"520px":"360px":e==="full"?"640px":"420px";i.style.minHeight=mob?e==="full"?"420px":"320px":""}i.classList.toggle("widget-obcine-iframe--compact",e!=="full"),i.classList.toggle("widget-obcine-iframe--full",e==="full")}p&&(p.classList.toggle("widget-preview-frame--compact",e!=="full"),p.classList.toggle("widget-preview-frame--full",e==="full")),l&&(l.value=t?iMw(e):"Izberite občino …"),u&&(u.textContent=e==="full"?"Priporočena širina 700–1000 px · vključuje mini zemljevid":"Priporočena širina 300–450 px · za stranski stolpec"),d&&(d.classList.toggle("widget-mode-btn--active",e!=="full"),d.setAttribute("aria-selected",e!=="full"?"true":"false")),o&&(o.classList.toggle("widget-mode-btn--active",e==="full"),o.setAttribute("aria-selected",e==="full"?"true":"false"))}function TB(t){const e=Number(t)||Uu;return oe.publicWidgetObcine.length?oe.publicWidgetObcine.map(i=>`<option value="${i.ob_mid}"${Number(i.ob_mid)===e?" selected":""}>${fi(i.name)}</option>`).join(""):`<option value="${e}" selected>Nalagam seznam občin …</option>`}function na(){return oe.view==="widget-obcine"}function PB(){const t=widgetReady(),e=widgetPreviewSize(),i=t?iMw(e):"",l=oe.publicWidgetObcine.length>0,u=oe.publicWidgetObMid||da()[0]||Uu,p=oe.publicWidgetTheme||"dark",d=e==="full";return`
    <div class="widget-obcine-panel">
      <div class="widget-obcine-settings-bar search-card search-card--inline">
        <div class="search-card-body">
          <div class="widget-obcine-settings-row">
            <div class="widget-obcine-field">
              <label class="widget-code-label" for="public-widget-obcina">Občina</label>
              <select id="public-widget-obcina" class="widget-obcina-select"${l?"":' disabled aria-busy="true"'}>
                ${TB(u)}
              </select>
            </div>
            <div class="widget-obcine-field">
              <label class="widget-code-label" for="public-widget-theme">Tema widgeta</label>
              <select id="public-widget-theme" class="widget-obcina-select">
                <option value="dark"${p==="dark"?" selected":""}>Temna (privzeto)</option>
                <option value="light"${p==="light"?" selected":""}>Svetla</option>
              </select>
            </div>
            <div class="widget-obcine-field widget-obcine-field--action">
              <button type="button" class="btn btn-ghost btn-sm" id="public-widget-defaults">Privzete nastavitve</button>
            </div>
          </div>
        </div>
      </div>
      <div class="widget-obcine-preview-card">
        <div class="widget-obcine-preview-toolbar">
          <div class="widget-mode-toggle" role="tablist" aria-label="Velikost widgeta">
            <button type="button" id="public-widget-mode-compact" class="widget-mode-btn${d?"":" widget-mode-btn--active"}" role="tab"${d?"":" aria-selected=\"true\""}>Osnovni</button>
            <button type="button" id="public-widget-mode-full" class="widget-mode-btn${d?" widget-mode-btn--active":""}" role="tab"${d?" aria-selected=\"true\"":""}>Razširjeni</button>
          </div>
          <p id="public-widget-size-hint" class="widget-field-hint widget-obcine-size-hint">${d?"Priporočena širina 700–1000 px · vključuje mini zemljevid":"Priporočena širina 300–450 px · za stranski stolpec"}</p>
        </div>
        <div id="public-widget-preview-frame" class="widget-preview-frame${d?" widget-preview-frame--full":" widget-preview-frame--compact"}">
          <iframe id="public-widget-iframe" class="widget-obcine-iframe${d?" widget-obcine-iframe--full":" widget-obcine-iframe--compact"}" src="${t?tMw(e):"about:blank"}" title="Predogled widgeta"></iframe>
        </div>
        <label class="widget-code-label" for="public-widget-embed-code">Embed koda</label>
        <textarea id="public-widget-embed-code" class="widget-embed-code widget-obcine-embed-code" readonly rows="4">${t?i:"Izberite občino …"}</textarea>
        <button type="button" class="btn btn-ghost btn-sm widget-copy-btn" id="public-widget-copy">Kopiraj kodo</button>
      </div>
    </div>`}function MB(){return`
    <section class="widget-obcine-page">
      <div class="widget-obcine-head">
        <h2>Widget udarov strel za spletne strani</h2>
        <p class="widget-obcine-lead">Brezplačen informativni widget za vdelavo na vašo spletno stran. Prikazuje udare strel v izbrani občini — zadnjih 24 ur, čas zadnje strele in skupno število v zadnjih 30 dneh.</p>
      </div>
      ${PB()}
    </section>`}"""

CSS_APPEND = """
/* —— widget občine page —— */
.widget-obcine-page{max-width:920px;margin:0 auto 2.5rem;padding:2.5rem 0 0}
.widget-obcine-page .widget-obcine-head{text-align:left;margin-bottom:1.35rem}
.widget-obcine-page .widget-obcine-head h2{margin:0 0 .65rem;font-size:clamp(1.2rem,3.5vw,1.85rem);line-height:1.25;font-weight:800;color:var(--text)}
.widget-obcine-page .widget-obcine-lead{margin:0;font-size:.92rem;color:var(--muted);line-height:1.55;max-width:42rem}
.widget-obcine-panel{display:flex;flex-direction:column;gap:1.25rem;margin-top:1.25rem}
.widget-obcine-page .search-card--inline{max-width:none;margin:0;text-align:left}
.widget-obcine-settings-row{display:flex;flex-wrap:wrap;align-items:flex-end;gap:1rem 1.25rem}
.widget-obcine-field{flex:1 1 10rem;min-width:0}
.widget-obcine-field--action{flex:0 0 auto;display:flex;align-items:flex-end;padding-bottom:.1rem}
.widget-obcine-page .search-card-body label,.widget-obcine-page .search-options{text-align:left}
.widget-mode-toggle{display:inline-flex;border:1px solid var(--border);border-radius:10px;overflow:hidden;margin:0}
.widget-mode-btn{flex:0 0 auto;background:transparent;border:none;color:var(--muted);font:inherit;font-size:.88rem;font-weight:700;padding:.55rem 1rem;cursor:pointer;transition:background .15s,color .15s;white-space:nowrap}
.widget-mode-btn+.widget-mode-btn{border-left:1px solid var(--border)}
.widget-mode-btn--active{background:rgba(5,165,206,.16);color:var(--blue)}
.widget-mode-btn:hover:not(.widget-mode-btn--active){background:rgba(255,255,255,.05);color:var(--text)}
.widget-obcine-preview-card{background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:1.15rem 1.25rem 1.25rem}
.widget-obcine-preview-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:.75rem 1.25rem;margin:0 0 1rem}
.widget-obcine-size-hint{margin:0;flex:1 1 12rem}
.widget-preview-frame{background:#1a1a1a;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:.65rem;margin:0 0 1rem;display:flex;justify-content:center}
.widget-obcine-iframe{border:none;border-radius:14px;display:block;margin:0 auto;background:#333333;width:100%}
.widget-obcine-iframe--compact{max-width:450px;height:420px}
.widget-obcine-iframe--full{max-width:960px;height:640px}
.widget-obcine-embed-code{width:100%;min-height:5.5rem;font-family:ui-monospace,monospace;font-size:.78rem;line-height:1.45;resize:vertical;margin-bottom:.45rem}
.widget-copy-btn{margin-bottom:0}
.widget-field-hint{font-size:.78rem;color:var(--muted);line-height:1.45}
@media(max-width:899px){
.widget-obcine-page{max-width:100%;padding-top:1.5rem}
.widget-obcine-preview-frame{padding:.5rem}
.widget-obcine-iframe--full,.widget-obcine-iframe--compact{max-width:100%;width:100%}
.widget-obcine-iframe--full{min-height:420px}
.widget-obcine-field{flex:1 1 calc(50% - .5rem);min-width:min(100%,11rem)}
.widget-obcine-field--action{flex:1 1 100%;justify-content:flex-start;padding-bottom:0}
.widget-obcine-preview-toolbar{align-items:flex-start}
}
@media(max-width:479px){
.widget-obcine-field{flex:1 1 100%}
}
"""


def strip_css(css: str) -> str:
    return strip_css_block(css, CSS_MARKER)


def patch_listeners(js: str) -> str:
    if 'publicWidgetPreviewSize="compact",na()&&zl()' in js:
        return js
    for old in (JS_OLD_WIDGET_LISTENERS, JS_DUAL_WIDGET_LISTENERS, JS_DOCKER_OLD_LISTENERS):
        if old in js:
            return js.replace(old, JS_TOGGLE_WIDGET_LISTENERS, 1)
    raise SystemExit("Widget listeners patch failed")


def patch_js(js: str) -> str:
    start = -1
    for anchor in JS_ANCHOR_STARTS:
        start = js.find(anchor)
        if start >= 0:
            break
    if start < 0:
        raise SystemExit("Widget JS anchor (yB) not found")

    end_marker = "function q2(t){"
    end = js.find(end_marker, start)
    if end < 0:
        raise SystemExit("Widget JS end anchor (q2) not found")

    js = js[:start] + WIDGET_JS + js[end:]
    js = patch_listeners(js)

    if JS_OLD_AB_TAIL in js:
        js = js.replace(JS_OLD_AB_TAIL, JS_NEW_AB_TAIL, 1)
    elif "await RWw()" not in js:
        raise SystemExit("AB() RWw patch failed")

    if JS_OLD_EJ_INIT in js:
        js = js.replace(JS_OLD_EJ_INIT, JS_NEW_EJ_INIT, 1)
    elif JS_NEW_EJ_INIT not in js:
        raise SystemExit("ej init patch failed")

    if JS_RESIZE_DUAL in js:
        js = js.replace(JS_RESIZE_DUAL, JS_RESIZE_SINGLE, 1)
    if JS_RESIZE_GLOBAL_OLD in js:
        js = js.replace(JS_RESIZE_GLOBAL_OLD, JS_RESIZE_GLOBAL_NEW, 1)
        js = js.replace('l.id==="public-obcina-widget-iframe"', 'l.id==="public-widget-iframe"', 1)

    return js


def patch_css(css: str) -> str:
    css = strip_css(css)
    return css.rstrip() + CSS_APPEND


def verify_untouched_css(css: str) -> None:
    required = (
        "mobile nav (hamburger)",
        "chart scroll pass-through",
        "footer layout",
    )
    missing = [m for m in required if m not in css]
    if missing:
        raise SystemExit(f"CSS safety check failed — missing blocks: {missing}")


def main() -> None:
    mode = sys.argv[3] if len(sys.argv) > 3 else "apply"
    js = JS_PATH.read_text(encoding="utf-8")
    css = CSS_PATH.read_text(encoding="utf-8")
    if mode == "revert":
        css = strip_css(css) + "\n"
    else:
        js = patch_js(js)
        css = patch_css(css)
        verify_untouched_css(css)
    JS_PATH.write_text(js, encoding="utf-8")
    CSS_PATH.write_text(css, encoding="utf-8")
    print(f"{'Reverted' if mode == 'revert' else 'Patched'} {JS_PATH} and {CSS_PATH}")


if __name__ == "__main__":
    main()
