#!/usr/bin/env python3
"""Stabilize Google Sign-In button: full width, fixed 44px height, no jitter."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = ROOT / "dist/assets/index-DijleoXU.js"
CSS = ROOT / "dist/assets/index-b2ecBo4-.css"

OLD_RENDER_V1 = (
    'function renderStrelkoGoogleSignIn(){const t=ot("#strelko-google-signin");'
    'if(!t||!STRELKO_GOOGLE_CLIENT_ID||t.dataset.gsiRendered==="1")return;'
    'loadStrelkoGoogleGsiScript().then(()=>{if(t.dataset.gsiRendered==="1")return;'
    'window.google.accounts.id.initialize({client_id:STRELKO_GOOGLE_CLIENT_ID,callback:e=>{'
    'e.credential&&completeStrelkoGoogleLogin(e.credential).catch(i=>{const l=ot("#auth-error");'
    'l&&(l.textContent=i.message||"Google prijava ni uspela.",l.classList.remove("hidden"))})},'
    'auto_select:!1,locale:"sl"});window.google.accounts.id.renderButton(t,{type:"standard",'
    'theme:"filled_black",size:"large",text:"signin_with",shape:"rectangular",width:320,locale:"sl"});'
    't.dataset.gsiRendered="1"}).catch(i=>{'
    't.innerHTML=`<p class="form-error">${fi(i.message)}</p>`})}'
)

NEW_RENDER = (
    'function renderStrelkoGoogleSignIn(){const t=ot("#strelko-google-signin");'
    'if(!t||!STRELKO_GOOGLE_CLIENT_ID||t.dataset.gsiRendered==="1")return;'
    'loadStrelkoGoogleGsiScript().then(()=>{if(t.dataset.gsiRendered==="1")return;'
    'window.google.accounts.id.initialize({client_id:STRELKO_GOOGLE_CLIENT_ID,callback:e=>{'
    'e.credential&&completeStrelkoGoogleLogin(e.credential).catch(i=>{const l=ot("#auth-error");'
    'l&&(l.textContent=i.message||"Google prijava ni uspela.",l.classList.remove("hidden"))})},'
    'auto_select:!1,locale:"sl"});'
    'const w=Math.min(400,Math.max(200,Math.floor(t.getBoundingClientRect().width||t.clientWidth||320)));'
    'window.google.accounts.id.renderButton(t,{type:"standard",theme:"filled_black",size:"large",'
    'text:"signin_with",shape:"rectangular",width:w,locale:"sl"});t.dataset.gsiRendered="1"}).catch(i=>{'
    't.innerHTML=`<p class="form-error">${fi(i.message)}</p>`})}'
)

OLD_CSS = (
    ".auth-google-wrap{width:100%;display:flex;justify-content:center;align-items:center;"
    "min-height:44px;margin-top:.15rem;overflow:hidden}"
)

NEW_CSS = (
    ".auth-google-wrap{width:100%;height:44px;min-height:44px;display:block;overflow:hidden;"
    "margin-top:.15rem;position:relative}"
    ".auth-google-wrap>div{width:100%!important;height:44px!important;display:block!important}"
    ".auth-google-wrap iframe{width:100%!important;height:44px!important;display:block!important;margin:0!important}"
)

OLD_SUBMIT = '<button type="submit" class="btn btn-primary">${e?"Prijava":"Ustvari račun"}</button>'
NEW_SUBMIT = '<button type="submit" class="btn btn-primary btn-block">${e?"Prijava":"Ustvari račun"}</button>'


def main() -> None:
    js = JS.read_text()
    css = CSS.read_text()

    if OLD_RENDER_V1 in js:
        js = js.replace(OLD_RENDER_V1, NEW_RENDER, 1)
        print("JS: renderStrelkoGoogleSignIn updated")
    elif "Math.max(200,Math.floor(t.getBoundingClientRect().width" in js:
        print("JS: renderStrelkoGoogleSignIn already v2")
    else:
        raise SystemExit("JS renderStrelkoGoogleSignIn pattern not found")

    if OLD_SUBMIT in js:
        js = js.replace(OLD_SUBMIT, NEW_SUBMIT, 1)
        print("JS: auth submit btn-block")
    elif "btn btn-primary btn-block" in js[js.find("function LB(") : js.find("function LB(") + 1200]:
        print("JS: auth submit already btn-block")
    else:
        raise SystemExit("JS auth submit pattern not found")

    JS.write_text(js)

    if OLD_CSS in css:
        css = css.replace(OLD_CSS, NEW_CSS, 1)
        print("CSS: auth-google-wrap updated")
    elif ".auth-google-wrap>div{width:100%!important;height:44px" in css:
        print("CSS: auth-google-wrap already v2")
    else:
        raise SystemExit("CSS auth-google-wrap pattern not found")

    CSS.write_text(css)


if __name__ == "__main__":
    main()
