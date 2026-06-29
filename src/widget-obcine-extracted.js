// ---------------------------------------------------------------------------
// Widget občine — extracted from strelko-widget.js bundle (readable reconstruction)
// Merge into main.js: add state fields, constants, functions below; wire routing,
// render(), bindEvents(), and app init (loadPublicWidgetObcineList + syncPublicWidgetObMidFromCoords).
// Assumes existing: state, $(), escapeHtml(), render(), navigateToView() or equivalent.
// ---------------------------------------------------------------------------

// --- State fields (add to main `state` object) --------------------------------

/*
  publicWidgetObMids: [11027849],
  publicWidgetTitle: "",
  publicWidgetObcine: [],
  publicWidgetTheme: "dark",
  publicWidgetMapZoomLocked: false,
  publicWidgetMapZoom: 13,
  publicWidgetMultiMode: false,
*/

// --- Constants ----------------------------------------------------------------

const PUBLIC_WIDGET_DEFAULT_OB_MID = 11027849;
const PUBLIC_WIDGET_MAX_OBCINE = 10;
const PUBLIC_WIDGET_MAP_ZOOM_MIN = 9;
const PUBLIC_WIDGET_MAP_ZOOM_MAX = 16;
const PUBLIC_WIDGET_MAP_ZOOM_STEP = 0.25;

// --- Core helpers -------------------------------------------------------------

function getPublicWidgetObMids() {
  const mids = (state.publicWidgetObMids || []).filter(Boolean);
  return mids.length ? mids.slice(0, PUBLIC_WIDGET_MAX_OBCINE) : [PUBLIC_WIDGET_DEFAULT_OB_MID];
}

function publicWidgetObcinaName(obMid) {
  return state.publicWidgetObcine.find((o) => o.ob_mid === obMid)?.name || `OB_MID ${obMid}`;
}

function setPublicWidgetObMids(mids) {
  const unique = [];
  mids.forEach((m) => {
    const n = Number(m);
    if (n > 0 && !unique.includes(n)) unique.push(n);
  });
  state.publicWidgetObMids = unique.slice(0, PUBLIC_WIDGET_MAX_OBCINE);
  if (state.publicWidgetObMids.length > 1) state.publicWidgetMultiMode = true;
  if (state.publicWidgetObMids.length <= 1) state.publicWidgetTitle = "";
}

function isPublicWidgetMultiExpanded() {
  return state.publicWidgetMultiMode || getPublicWidgetObMids().length > 1;
}

function setPrimaryPublicWidgetObcina(obMid) {
  const n = Number(obMid);
  if (!n) return;
  const rest = getPublicWidgetObMids().filter((m) => m !== n);
  setPublicWidgetObMids([n, ...rest]);
}

function togglePublicWidgetMultiMode() {
  if (isPublicWidgetMultiExpanded()) {
    if (getPublicWidgetObMids().length > 1) setPublicWidgetObMids([getPublicWidgetObMids()[0]]);
    state.publicWidgetMultiMode = false;
  } else {
    state.publicWidgetMultiMode = true;
  }
}

function addPublicWidgetObcina(obMid) {
  const mids = getPublicWidgetObMids();
  const n = Number(obMid);
  if (!n || mids.includes(n) || mids.length >= PUBLIC_WIDGET_MAX_OBCINE) return false;
  setPublicWidgetObMids([...mids, n]);
  return true;
}

function removePublicWidgetObcina(obMid) {
  const rest = getPublicWidgetObMids().filter((m) => m !== Number(obMid));
  setPublicWidgetObMids(rest.length ? rest : [PUBLIC_WIDGET_DEFAULT_OB_MID]);
}

function setPublicWidgetTheme(theme) {
  state.publicWidgetTheme = theme === "light" ? "light" : "dark";
}

function resetPublicWidgetToDefaults() {
  state.publicWidgetObMids = [PUBLIC_WIDGET_DEFAULT_OB_MID];
  state.publicWidgetTitle = "";
  state.publicWidgetMapZoomLocked = false;
  state.publicWidgetMapZoom = 13;
  state.publicWidgetMultiMode = false;
  setPublicWidgetTheme("dark");
}

// --- URL / embed helpers ------------------------------------------------------

function publicWidgetParams() {
  const params = new URLSearchParams();
  const mids = getPublicWidgetObMids();
  if (mids.length === 1) {
    params.set("ob_mid", String(mids[0]));
  } else {
    params.set("ob_mids", mids.join(","));
  }
  const title = (state.publicWidgetTitle || "").trim();
  if (mids.length > 1 && title) params.set("title", title.slice(0, 80));
  if (state.publicWidgetTheme === "light") params.set("theme", "light");
  if (state.publicWidgetMapZoomLocked) {
    params.set("map_zoom", formatPublicWidgetMapZoom(state.publicWidgetMapZoom));
  }
  return params;
}

function publicWidgetPreviewIframeSrc() {
  const params = publicWidgetParams();
  if (!state.publicWidgetMapZoomLocked) params.set("map_preview", "1");
  return `/widget/obcina.html?${params.toString()}`;
}

function publicWidgetEmbedSrc() {
  return `${location.origin}/widget/obcina.html?${publicWidgetParams().toString()}`;
}

function publicWidgetEmbedHtml() {
  return `<iframe src="${publicWidgetEmbedSrc()}" title="Strele v občini" loading="lazy" style="width:100%;max-width:440px;min-height:400px;height:440px;border:none;border-radius:12px"></iframe>`;
}

// --- Map zoom helpers ---------------------------------------------------------

function clampPublicWidgetMapZoom(zoom) {
  const step = PUBLIC_WIDGET_MAP_ZOOM_STEP;
  const n = Number(zoom);
  if (!Number.isFinite(n)) return 13;
  const clamped = Math.min(PUBLIC_WIDGET_MAP_ZOOM_MAX, Math.max(PUBLIC_WIDGET_MAP_ZOOM_MIN, n));
  return Math.round(clamped / step) * step;
}

function formatPublicWidgetMapZoom(zoom) {
  const v = clampPublicWidgetMapZoom(zoom);
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function postPublicWidgetZoomToIframe(zoom) {
  const iframe = document.getElementById("public-obcina-widget-iframe");
  iframe?.contentWindow?.postMessage(
    { type: "strele-widget-set-zoom", zoom: clampPublicWidgetMapZoom(zoom) },
    "*"
  );
}

function syncPublicWidgetPreviewZoom() {
  const locked = state.publicWidgetMapZoomLocked;
  const slider = $("#public-widget-map-zoom");
  const valEl = $("#public-widget-map-zoom-val");
  const lockBtn = $("#public-widget-map-lock");
  const unlockBtn = $("#public-widget-map-unlock");
  const outBtn = $("#public-widget-map-zoom-out");
  const inBtn = $("#public-widget-map-zoom-in");
  const zoom = clampPublicWidgetMapZoom(state.publicWidgetMapZoom);
  if (slider) {
    slider.value = String(zoom);
    slider.disabled = locked;
  }
  if (valEl) valEl.textContent = formatPublicWidgetMapZoom(zoom);
  lockBtn?.classList.toggle("hidden", locked);
  unlockBtn?.classList.toggle("hidden", !locked);
  outBtn?.toggleAttribute("disabled", locked);
  inBtn?.toggleAttribute("disabled", locked);
}

let publicWidgetMapMessageListenerAttached = false;

function initPublicWidgetMapMessageListener() {
  if (publicWidgetMapMessageListenerAttached) return;
  publicWidgetMapMessageListenerAttached = true;
  window.addEventListener("message", (ev) => {
    if (ev.data?.type === "strele-widget-map-state" && !state.publicWidgetMapZoomLocked) {
      state.publicWidgetMapZoom = clampPublicWidgetMapZoom(ev.data.zoom);
      syncPublicWidgetPreviewZoom();
    }
  });
}

function refreshPublicWidgetPreview() {
  const previewSrc = publicWidgetPreviewIframeSrc();
  const iframe = document.getElementById("public-obcina-widget-iframe");
  if (iframe) {
    const abs = new URL(previewSrc, location.origin).href;
    if (iframe.src !== abs) iframe.src = previewSrc;
  }
  const embedCode = document.querySelector(".widget-panel--public .widget-embed-code");
  if (embedCode) embedCode.value = publicWidgetEmbedHtml();
  const titleInput = $("#public-widget-title");
  if (titleInput && titleInput.value !== state.publicWidgetTitle) {
    titleInput.value = state.publicWidgetTitle || "";
  }
  syncPublicWidgetPreviewZoom();
}

function isWidgetObcineView() {
  return state.view === "widget-obcine";
}

function widgetObcineRerenderOrRefresh() {
  if (isWidgetObcineView()) render();
  else refreshPublicWidgetPreview();
}

// --- Render sub-templates -----------------------------------------------------

function renderPublicWidgetAddObcinaOptions() {
  const selected = new Set(getPublicWidgetObMids());
  const available = state.publicWidgetObcine.filter((o) => !selected.has(o.ob_mid));
  if (available.length) {
    return `<option value="" selected disabled>Izberite občino …</option>${available
      .map((o) => `<option value="${o.ob_mid}">${escapeHtml(o.name)}</option>`)
      .join("")}`;
  }
  return `<option value="" selected disabled>${
    selected.size >= PUBLIC_WIDGET_MAX_OBCINE
      ? "Dosežen limit 10 občin"
      : "Vse občine so že dodane"
  }</option>`;
}

function renderPublicWidgetPrimaryObcinaOptions(primaryMid) {
  if (!state.publicWidgetObcine.length) {
    return `<option value="${primaryMid}" selected>Nalagam seznam občin …</option>`;
  }
  return state.publicWidgetObcine
    .map(
      (o) =>
        `<option value="${o.ob_mid}"${o.ob_mid === primaryMid ? " selected" : ""}>${escapeHtml(o.name)}</option>`
    )
    .join("");
}

function renderPublicWidgetSelectedObcineList() {
  const extra = getPublicWidgetObMids().slice(1);
  if (!extra.length) {
    return '<li class="widget-obcina-selected-empty">Dodajte občine spodaj — glavna občina ostane zgoraj.</li>';
  }
  return extra
    .map(
      (mid) => `
        <li class="widget-obcina-selected-item">
          <span>${escapeHtml(publicWidgetObcinaName(mid))}</span>
          <button type="button" class="widget-obcina-remove btn btn-ghost btn-sm" data-remove-ob-mid="${mid}" aria-label="Odstrani ${escapeHtml(publicWidgetObcinaName(mid))}">×</button>
        </li>`
    )
    .join("");
}

// --- renderPublicObcinaWidgetPanel (was zB) -----------------------------------

function renderPublicObcinaWidgetPanel() {
  const previewSrc = publicWidgetPreviewIframeSrc();
  const embedHtml = publicWidgetEmbedHtml();
  const listLoaded = state.publicWidgetObcine.length > 0;
  const theme = state.publicWidgetTheme === "light" ? "light" : "dark";
  const mids = getPublicWidgetObMids();
  const primaryMid = mids[0] || PUBLIC_WIDGET_DEFAULT_OB_MID;
  const multiExpanded = isPublicWidgetMultiExpanded();
  const hasMultiple = mids.length > 1;
  const atLimit = mids.length >= PUBLIC_WIDGET_MAX_OBCINE;

  return `
    <section class="widget-panel widget-panel--public">
      <div class="widget-obcina-field">
        <div class="widget-obcina-primary-row">
          <div class="widget-obcina-primary-select">
            <label class="widget-code-label" for="public-widget-obcina">Občina</label>
            <select id="public-widget-obcina" class="widget-obcina-select"${listLoaded ? "" : ' disabled aria-busy="true"'}>
              ${renderPublicWidgetPrimaryObcinaOptions(primaryMid)}
            </select>
          </div>
          <button type="button" class="btn btn-ghost btn-sm widget-obcina-multi-toggle" id="public-widget-multi-toggle">${
            hasMultiple ? "Samo ena občina" : multiExpanded ? "Skrij več občin" : "Več občin"
          }</button>
        </div>
        <div id="public-widget-multi-panel" class="widget-obcina-multi-panel${multiExpanded ? "" : " hidden"}">
          <p class="widget-field-hint widget-obcina-multi-lead">Dodajte do ${PUBLIC_WIDGET_MAX_OBCINE - 1} dodatnih občin (skupaj z glavno največ ${PUBLIC_WIDGET_MAX_OBCINE}).</p>
          <ul id="public-widget-selected" class="widget-obcina-selected" aria-live="polite">
            ${renderPublicWidgetSelectedObcineList()}
          </ul>
          <div class="widget-obcina-add-row">
            <select id="public-widget-obcina-add" class="widget-obcina-select"${listLoaded && !atLimit ? "" : " disabled"}>
              ${
                listLoaded
                  ? renderPublicWidgetAddObcinaOptions()
                  : '<option value="" selected disabled>Nalagam seznam občin …</option>'
              }
            </select>
            <button type="button" class="btn btn-ghost btn-sm" id="public-widget-add-obcina"${listLoaded && !atLimit ? "" : " disabled"}>Dodaj</button>
          </div>
          <div class="widget-obcina-field widget-obcina-title-field widget-obcina-title-field--nested${hasMultiple ? "" : " hidden"}">
            <label class="widget-code-label" for="public-widget-title">Ime widgeta</label>
            <input type="text" id="public-widget-title" class="widget-obcina-text" maxlength="80" placeholder="npr. Gorenjska regija" value="${escapeHtml(state.publicWidgetTitle || "")}" />
            <p class="widget-field-hint">Pri več občinah nastavite lasten naslov namesto „Občina …“.</p>
          </div>
        </div>
      </div>
      <div class="widget-obcina-field">
        <label class="widget-code-label" for="public-widget-theme">Izhodiščna tema</label>
        <select id="public-widget-theme" class="widget-obcina-select">
          <option value="dark"${theme === "dark" ? " selected" : ""}>Temna</option>
          <option value="light"${theme === "light" ? " selected" : ""}>Svetla</option>
        </select>
        <p class="widget-field-hint">Svetla ali temna tema widgeta.</p>
      </div>
      <div class="widget-obcina-field">
        <label class="widget-code-label" for="public-widget-map-zoom">Približek zemljevida</label>
        <div class="widget-map-zoom-row">
          <button type="button" class="btn btn-ghost btn-sm widget-map-zoom-btn" id="public-widget-map-zoom-out" aria-label="Oddalji">−</button>
          <input type="range" id="public-widget-map-zoom" class="widget-map-zoom-slider" min="${PUBLIC_WIDGET_MAP_ZOOM_MIN}" max="${PUBLIC_WIDGET_MAP_ZOOM_MAX}" step="${PUBLIC_WIDGET_MAP_ZOOM_STEP}" value="${clampPublicWidgetMapZoom(state.publicWidgetMapZoom)}"${state.publicWidgetMapZoomLocked ? " disabled" : ""} />
          <button type="button" class="btn btn-ghost btn-sm widget-map-zoom-btn" id="public-widget-map-zoom-in" aria-label="Približaj">+</button>
          <span id="public-widget-map-zoom-val" class="widget-map-zoom-val">${formatPublicWidgetMapZoom(state.publicWidgetMapZoom)}</span>
        </div>
        <div class="widget-map-zoom-actions">
          <button type="button" class="btn btn-ghost btn-sm${state.publicWidgetMapZoomLocked ? " hidden" : ""}" id="public-widget-map-lock">Zakleni pogled</button>
          <button type="button" class="btn btn-ghost btn-sm${state.publicWidgetMapZoomLocked ? "" : " hidden"}" id="public-widget-map-unlock">Spremeni približek</button>
        </div>
        <p class="widget-field-hint">${
          state.publicWidgetMapZoomLocked
            ? "Približek je zaklenjen in vključen v kodo za vdelavo."
            : "Prilagodite približek v predogledu (drsnik, kolešček miške ali gumba +/−), nato ga zaklenite."
        }</p>
      </div>
      <div class="widget-customize-actions">
        <button type="button" class="btn btn-ghost btn-sm" id="public-widget-defaults">Privzete nastavitve</button>
      </div>
      <div class="widget-embed-preview">
        <iframe id="public-obcina-widget-iframe" class="archive-map-iframe" src="${previewSrc}" title="Widget strel v občini" loading="lazy"></iframe>
      </div>
      <label class="widget-code-label">Koda za vdelavo</label>
      <textarea class="widget-embed-code" readonly rows="4">${escapeHtml(embedHtml)}</textarea>
    </section>`;
}

// --- renderWidgetObcinePage (was DB) ------------------------------------------

function renderWidgetObcinePage() {
  return `
    <section class="widget-obcine-page">
      <button type="button" class="widget-obcine-back btn btn-ghost" data-nav="landing">← Nazaj na Strelko</button>
      <div class="widget-obcine-head">
        <h2>Widget strel za občino</h2>
        <p class="widget-obcine-lead">Brezplačen javni widget za vašo občino ali skupino občin (do ${PUBLIC_WIDGET_MAX_OBCINE}) — urni profil in mini zemljevid zadnjih 24 h ob nevihti, sicer mesečna statistika. Izberite občino, po želji poimenujte widget, nastavite približek zemljevida in kopirajte kodo za vdelavo. Brez prijave.</p>
      </div>
      ${renderPublicObcinaWidgetPanel()}
    </section>`;
}

// --- renderHeader — header-quick-links structure --------------------------------

function renderHeader() {
  const loggedIn = !!state.user;
  return `
    <header class="site-header${loggedIn ? " site-header--logged-in" : " site-header--guest"}">
      <a href="#" class="logo" data-nav="landing">
        ${renderLogoSvg()}
        <div><h1>Strelko</h1><span>Vaš zaveznik pri zavarovalnici</span></div>
      </a>
      <div class="header-quick-links">
        <a href="/statistika" class="header-arhiv-link" data-nav="statistika">Arhiv</a>
        <a href="/widget-obcine" class="header-arhiv-link" data-nav="widget-obcine">Widget</a>
      </div>
      <nav class="nav-actions">
        <a href="/statistika" class="btn btn-ghost" data-nav="statistika">Arhiv strel</a>
        <a href="/widget-obcine" class="btn btn-ghost" data-nav="widget-obcine">Widget občine</a>
        ${
          loggedIn
            ? `<span class="credits-badge">${
                state.credits?.plan_name_sl
                  ? `<span class="plan-badge">${escapeHtml(state.credits.plan_name_sl)}</span> · `
                  : ""
              }Krediti: <strong>${state.credits?.credits_balance ?? "—"}</strong></span>
               <button type="button" class="btn btn-ghost" data-action="credits">Paketi</button>
               ${
                 state.credits?.billing_portal_available
                   ? '<button type="button" class="btn btn-ghost" data-action="billing">Naročnina</button>'
                   : ""
               }
               <button type="button" class="btn btn-ghost" data-action="logout">Odjava</button>`
            : `<button type="button" class="btn btn-ghost" data-action="login">Prijava</button>
               <button type="button" class="btn btn-primary" data-action="register">Registracija</button>`
        }
      </nav>
    </header>`;
}

// Placeholder — replace with existing renderLogoSvg() from main.js
function renderLogoSvg() {
  return "";
}

// --- Async: občine list + geo resolution --------------------------------------

function applyPublicWidgetObcineList(rows) {
  state.publicWidgetObcine = rows
    .filter((r) => r.ob_mid && r.name)
    .sort((a, b) => a.name.localeCompare(b.name, "sl"));
  if (isWidgetObcineView()) render();
}

async function loadPublicWidgetObcineList() {
  if (state.publicWidgetObcine.length) return;
  try {
    const res = await fetch("/widget/api/obcine-map?days=365");
    if (res.ok) {
      const data = await res.json();
      applyPublicWidgetObcineList(
        data.map((row) => ({ ob_mid: row.ob_id ?? row.ob_mid, name: row.obcina }))
      );
      return;
    }
  } catch {
    /* fall through to GeoJSON */
  }
  try {
    const res = await fetch("/widget/public/data/OB-lite.geojson");
    if (!res.ok) return;
    const geo = await res.json();
    applyPublicWidgetObcineList(
      (geo.features || []).map((f) => ({
        ob_mid: f.properties?.OB_MID,
        name: f.properties?.OB_UIME,
      }))
    );
  } catch {
    /* ignore */
  }
}

async function resolvePublicWidgetObMidFromGeo(lat, lon) {
  try {
    const res = await fetch(
      `/widget/api/obcina-by-coords?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
    );
    if (!res.ok) return;
    const data = await res.json();
    if (data?.ob_mid) {
      state.publicWidgetObMids = [data.ob_mid];
      if (isWidgetObcineView()) render();
    }
  } catch {
    /* ignore */
  }
}

async function syncPublicWidgetObMidFromCoords() {
  if (getPublicWidgetObMids().length && state.publicWidgetObMids?.length) return;

  if (state.searchResult?.lat != null && state.searchResult?.lon != null) {
    await resolvePublicWidgetObMidFromGeo(state.searchResult.lat, state.searchResult.lon);
    return;
  }

  if (!navigator.geolocation) {
    state.publicWidgetObMids = [PUBLIC_WIDGET_DEFAULT_OB_MID];
    return;
  }

  await new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        if (latitude >= 45.4 && latitude <= 46.9 && longitude >= 13.3 && longitude <= 16.6) {
          await resolvePublicWidgetObMidFromGeo(latitude, longitude);
        }
        if (!state.publicWidgetObMids?.length) {
          state.publicWidgetObMids = [PUBLIC_WIDGET_DEFAULT_OB_MID];
        }
        resolve();
      },
      () => {
        if (!state.publicWidgetObMids?.length) {
          state.publicWidgetObMids = [PUBLIC_WIDGET_DEFAULT_OB_MID];
        }
        resolve();
      },
      { timeout: 4000, maximumAge: 120000 }
    );
  });
}

// --- Routing snippets (merge into resolveViewFromPath / navigateToView) --------

function resolveViewFromPath(pathname = window.location.pathname) {
  if (pathname === "/statistika" || pathname === "/statistika/") return "statistika";
  if (pathname === "/widget-obcine" || pathname === "/widget-obcine/") return "widget-obcine";
  return "landing";
}

function navigateToView(view = "landing") {
  state.legalPage = null;
  state.view = view;
  const path =
    view === "statistika" ? "/statistika" : view === "widget-obcine" ? "/widget-obcine" : "/";
  window.history.pushState({ view }, "", path);
  render();
  window.scrollTo(0, 0);
}

// In render(): when state.view === "widget-obcine", use renderWidgetObcinePage()

// --- Event binding snippets (call from bindEvents after render) -----------------

function bindPublicWidgetPageControls() {
  $("#public-widget-add-obcina")?.addEventListener("click", () => {
    const sel = $("#public-widget-obcina-add");
    const mid = Number(sel?.value);
    if (!mid || !addPublicWidgetObcina(mid)) return;
    state.publicWidgetMultiMode = true;
    widgetObcineRerenderOrRefresh();
  });

  $("#public-widget-obcina")?.addEventListener("change", (ev) => {
    setPrimaryPublicWidgetObcina(ev.target.value);
    widgetObcineRerenderOrRefresh();
  });

  $("#public-widget-multi-toggle")?.addEventListener("click", () => {
    togglePublicWidgetMultiMode();
    widgetObcineRerenderOrRefresh();
  });

  $("#public-widget-selected")?.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-remove-ob-mid]");
    if (!btn) return;
    removePublicWidgetObcina(btn.dataset.removeObMid);
    widgetObcineRerenderOrRefresh();
  });

  $("#public-widget-title")?.addEventListener("input", (ev) => {
    state.publicWidgetTitle = ev.target.value.slice(0, 80);
    refreshPublicWidgetPreview();
  });

  $("#public-widget-theme")?.addEventListener("change", (ev) => {
    setPublicWidgetTheme(ev.target.value);
    widgetObcineRerenderOrRefresh();
  });

  $("#public-widget-defaults")?.addEventListener("click", () => {
    resetPublicWidgetToDefaults();
    widgetObcineRerenderOrRefresh();
  });

  initPublicWidgetMapMessageListener();

  $("#public-widget-map-lock")?.addEventListener("click", () => {
    state.publicWidgetMapZoom = clampPublicWidgetMapZoom(
      $("#public-widget-map-zoom")?.value ?? state.publicWidgetMapZoom
    );
    state.publicWidgetMapZoomLocked = true;
    widgetObcineRerenderOrRefresh();
  });

  $("#public-widget-map-unlock")?.addEventListener("click", () => {
    state.publicWidgetMapZoomLocked = false;
    widgetObcineRerenderOrRefresh();
  });

  $("#public-widget-map-zoom")?.addEventListener("input", (ev) => {
    if (state.publicWidgetMapZoomLocked) return;
    state.publicWidgetMapZoom = clampPublicWidgetMapZoom(ev.target.value);
    syncPublicWidgetPreviewZoom();
    postPublicWidgetZoomToIframe(state.publicWidgetMapZoom);
  });

  $("#public-widget-map-zoom-out")?.addEventListener("click", () => {
    if (state.publicWidgetMapZoomLocked) return;
    state.publicWidgetMapZoom = clampPublicWidgetMapZoom(
      state.publicWidgetMapZoom - PUBLIC_WIDGET_MAP_ZOOM_STEP
    );
    syncPublicWidgetPreviewZoom();
    postPublicWidgetZoomToIframe(state.publicWidgetMapZoom);
  });

  $("#public-widget-map-zoom-in")?.addEventListener("click", () => {
    if (state.publicWidgetMapZoomLocked) return;
    state.publicWidgetMapZoom = clampPublicWidgetMapZoom(
      state.publicWidgetMapZoom + PUBLIC_WIDGET_MAP_ZOOM_STEP
    );
    syncPublicWidgetPreviewZoom();
    postPublicWidgetZoomToIframe(state.publicWidgetMapZoom);
  });
}

// Nav handler snippet (inside document.querySelectorAll("[data-nav]") loop):
/*
  if (el.dataset.nav === "widget-obcine") {
    state.preview = null;
    state.searchResult = null;
    navigateToView("widget-obcine");
    return;
  }
*/

// App init snippet (after first render):
/*
  loadPublicWidgetObcineList();
  syncPublicWidgetObMidFromCoords().then(() => {
    if (isWidgetObcineView()) render();
  });
*/

// Iframe resize listener snippet (window "message" handler):
/*
  if (ev.data?.type === "strele-embed-resize") {
    const iframe = [
      document.getElementById("archive-embed"),
      document.getElementById("archive-embed-full"),
      document.getElementById("archive-map-iframe"),
      document.getElementById("public-obcina-widget-iframe"),
    ].find((el) => el && el.contentWindow === ev.source);
    if (iframe) {
      const cur = parseFloat(iframe.style.height) || iframe.height;
      const isArchiveEmbed = iframe.id === "archive-embed";
      const isPublicWidget = iframe.id === "public-obcina-widget-iframe";
      const isArchiveMap = iframe.id === "archive-map-iframe";
      const next = isArchiveEmbed
        ? ev.data.height
        : Math.max(isPublicWidget ? 400 : isArchiveMap ? 520 : 320, ev.data.height);
      if (Math.abs(cur - next) < 2) return;
      iframe.style.height = `${next}px`;
    }
  }
*/
