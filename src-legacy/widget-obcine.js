/** Widget občine — predogled in embed koda. */

const DEFAULT_OB_MID = 11027849;

export function initWidgetObcineState(state) {
  if (state.publicWidgetObMid == null) state.publicWidgetObMid = DEFAULT_OB_MID;
  if (!state.publicWidgetObMids?.length) state.publicWidgetObMids = [DEFAULT_OB_MID];
  if (!state.publicWidgetTheme) state.publicWidgetTheme = "dark";
  if (!state.publicWidgetPreviewSize) state.publicWidgetPreviewSize = "compact";
  if (!state.publicWidgetObcine) state.publicWidgetObcine = [];
}

function widgetObMid(state) {
  return (
    state.publicWidgetObMid ||
    Number(document.querySelector("#public-widget-obcina")?.value) ||
    state.publicWidgetObcine[0]?.ob_mid ||
    DEFAULT_OB_MID
  );
}

function widgetReady(state) {
  return !!widgetObMid(state);
}

function widgetPreviewSize(state) {
  return state.publicWidgetPreviewSize === "full" ? "full" : "compact";
}

function widgetCenter(state) {
  if (state.publicWidgetLat != null && state.publicWidgetLon != null) {
    return {
      lat: state.publicWidgetLat,
      lon: state.publicWidgetLon,
      label: (state.publicWidgetLabel || "").trim(),
    };
  }
  return null;
}

function buildWidgetParams(state, size) {
  const params = new URLSearchParams();
  const mid = widgetObMid(state);
  if (mid) params.set("ob_mid", String(mid));
  const center = widgetCenter(state);
  if (center) {
    params.set("lat", String(center.lat));
    params.set("lon", String(center.lon));
    if (center.label) params.set("label", center.label.slice(0, 80));
  }
  params.set("theme", state.publicWidgetTheme || "dark");
  params.set("size", size === "full" ? "full" : "compact");
  params.set("api", `${location.origin}/widget/api`);
  return params;
}

function widgetPreviewPath(state, size) {
  const params = buildWidgetParams(state, size);
  return params.has("ob_mid")
    ? `/widget/obcina-widget.html?${params}`
    : `/widget/obcina-widget.html?size=${size === "full" ? "full" : "compact"}`;
}

function widgetEmbedHtml(state, size, escapeHtml) {
  const full = size === "full";
  const theme = state.publicWidgetTheme || "dark";
  const bg = theme === "dark" ? "#333333" : "#f7f7f8";
  const frameId = `strele-obcina-${full ? "full" : "compact"}-${Math.random().toString(36).slice(2, 8)}`;
  const src = `${location.origin}${widgetPreviewPath(state, size)}`;
  return `<div style="width:100%;max-width:${full ? "960" : "450"}px;margin:0 auto"><iframe id="${frameId}" src="${src}" title="Udari strel v občini — Strelko" style="width:100%;max-width:${full ? "960" : "450"}px;height:${full ? "640" : "420"}px;border:none;border-radius:14px;display:block;margin:0 auto;background:${bg}"></iframe><script>(function(){var f=document.getElementById("${frameId}");if(!f)return;window.addEventListener("message",function(ev){if(!ev.data||ev.data.type!=="strele-embed-resize"||ev.source!==f.contentWindow)return;var h=Math.max(320,Math.min(1400,+ev.data.height||0));if(h>0)f.style.height=h+"px";});})();<\/script></div>`;
}

function ensureWidgetResizeListener($) {
  if (window.__wPR) return;
  window.__wPR = 1;
  window.addEventListener("message", (ev) => {
    if (!ev.data || ev.data.type !== "strele-embed-resize") return;
    const frame = $("#public-widget-iframe");
    if (!frame || ev.source !== frame.contentWindow) return;
    const h = Math.max(320, Math.min(1400, +ev.data.height || 0));
    if (h > 0) frame.style.height = `${h}px`;
  });
}

export function refreshWidgetPreview(state, $) {
  ensureWidgetResizeListener($);
  const ready = widgetReady(state);
  const size = widgetPreviewSize(state);
  const iframe = $("#public-widget-iframe");
  const code = $("#public-widget-embed-code");
  const hint = $("#public-widget-size-hint");
  const frame = $("#public-widget-preview-frame");
  const btnCompact = $("#public-widget-mode-compact");
  const btnFull = $("#public-widget-mode-full");
  const isFull = size === "full";

  if (iframe) {
    if (ready) {
      const path = widgetPreviewPath(state, size);
      if (iframe.src !== path) iframe.src = path;
      const mob = window.matchMedia("(max-width:899px)").matches;
      iframe.style.height = mob
        ? isFull
          ? "520px"
          : "360px"
        : isFull
          ? "640px"
          : "420px";
      iframe.style.minHeight = mob ? (isFull ? "420px" : "320px") : "";
    }
    iframe.classList.toggle("widget-obcine-iframe--compact", !isFull);
    iframe.classList.toggle("widget-obcine-iframe--full", isFull);
  }

  frame?.classList.toggle("widget-preview-frame--compact", !isFull);
  frame?.classList.toggle("widget-preview-frame--full", isFull);

  if (code) {
    code.value = ready ? widgetEmbedHtml(state, size, (s) => s) : "Izberite občino …";
  }
  if (hint) {
    hint.textContent = isFull
      ? "Priporočena širina 700–1000 px · vključuje mini zemljevid"
      : "Priporočena širina 300–450 px · za stranski stolpec";
  }
  if (btnCompact) {
    btnCompact.classList.toggle("widget-mode-btn--active", !isFull);
    btnCompact.setAttribute("aria-selected", !isFull ? "true" : "false");
  }
  if (btnFull) {
    btnFull.classList.toggle("widget-mode-btn--active", isFull);
    btnFull.setAttribute("aria-selected", isFull ? "true" : "false");
  }
}

export async function loadObcinaWidgetMeta(state, obMid) {
  const mid = Number(obMid) || DEFAULT_OB_MID;
  state.publicWidgetObMid = mid;
  state.publicWidgetObMids = [mid];
  try {
    const res = await fetch(`/widget/api/obcina-widget?ob_mid=${mid}`);
    if (!res.ok) return;
    const data = await res.json();
    const bounds = data.bounds;
    if (bounds?.length >= 2) {
      state.publicWidgetLat = (bounds[0][0] + bounds[1][0]) / 2;
      state.publicWidgetLon = (bounds[0][1] + bounds[1][1]) / 2;
      state.publicWidgetLabel = data.obcina || "";
    }
  } catch {
    /* ignore */
  }
}

function obcinaOptions(state, selectedMid, escapeHtml) {
  const mid = Number(selectedMid) || DEFAULT_OB_MID;
  if (state.publicWidgetObcine.length) {
    return state.publicWidgetObcine
      .map(
        (o) =>
          `<option value="${o.ob_mid}"${Number(o.ob_mid) === mid ? " selected" : ""}>${escapeHtml(o.name)}</option>`
      )
      .join("");
  }
  return `<option value="${mid}" selected>Nalagam seznam občin …</option>`;
}

function renderWidgetPanel(state, escapeHtml) {
  const ready = widgetReady(state);
  const size = widgetPreviewSize(state);
  const embedCode = ready ? widgetEmbedHtml(state, size, escapeHtml) : "";
  const hasList = state.publicWidgetObcine.length > 0;
  const selected = state.publicWidgetObMid || state.publicWidgetObcine[0]?.ob_mid || DEFAULT_OB_MID;
  const theme = state.publicWidgetTheme || "dark";
  const isFull = size === "full";

  return `
    <div class="widget-obcine-panel">
      <div class="widget-obcine-settings-bar search-card search-card--inline">
        <div class="search-card-body">
          <div class="widget-obcine-settings-row">
            <div class="widget-obcine-field">
              <label class="widget-code-label" for="public-widget-obcina">Občina</label>
              <select id="public-widget-obcina" class="widget-obcina-select"${hasList ? "" : ' disabled aria-busy="true"'}>
                ${obcinaOptions(state, selected, escapeHtml)}
              </select>
            </div>
            <div class="widget-obcine-field">
              <label class="widget-code-label" for="public-widget-theme">Tema widgeta</label>
              <select id="public-widget-theme" class="widget-obcina-select">
                <option value="dark"${theme === "dark" ? " selected" : ""}>Temna (privzeto)</option>
                <option value="light"${theme === "light" ? " selected" : ""}>Svetla</option>
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
            <button type="button" id="public-widget-mode-compact" class="widget-mode-btn${isFull ? "" : " widget-mode-btn--active"}" role="tab"${isFull ? "" : ' aria-selected="true"'}>Osnovni</button>
            <button type="button" id="public-widget-mode-full" class="widget-mode-btn${isFull ? " widget-mode-btn--active" : ""}" role="tab"${isFull ? ' aria-selected="true"' : ""}>Razširjeni</button>
          </div>
          <p id="public-widget-size-hint" class="widget-field-hint widget-obcine-size-hint">${isFull ? "Priporočena širina 700–1000 px · vključuje mini zemljevid" : "Priporočena širina 300–450 px · za stranski stolpec"}</p>
        </div>
        <div id="public-widget-preview-frame" class="widget-preview-frame${isFull ? " widget-preview-frame--full" : " widget-preview-frame--compact"}">
          <iframe id="public-widget-iframe" class="widget-obcine-iframe${isFull ? " widget-obcine-iframe--full" : " widget-obcine-iframe--compact"}" src="${ready ? widgetPreviewPath(state, size) : "about:blank"}" title="Predogled widgeta"></iframe>
        </div>
        <label class="widget-code-label" for="public-widget-embed-code">Embed koda</label>
        <textarea id="public-widget-embed-code" class="widget-embed-code widget-obcine-embed-code" readonly rows="4">${ready ? embedCode : "Izberite občino …"}</textarea>
        <button type="button" class="btn btn-ghost btn-sm widget-copy-btn" id="public-widget-copy">Kopiraj kodo</button>
      </div>
    </div>`;
}

export function renderWidgetObcinePage(state, escapeHtml) {
  return `
    <section class="widget-obcine-page">
      <div class="widget-obcine-head">
        <h2>Widget udarov strel za spletne strani</h2>
        <p class="widget-obcine-lead">Brezplačen informativni widget za vdelavo na vašo spletno stran. Prikazuje udare strel v izbrani občini — zadnjih 24 ur, čas zadnje strele in skupno število v zadnjih 30 dneh.</p>
      </div>
      ${renderWidgetPanel(state, escapeHtml)}
    </section>`;
}

export async function loadPublicWidgetObcineList(state, render) {
  if (state.publicWidgetObcine.length) return;
  const apply = (rows) => {
    state.publicWidgetObcine = rows
      .filter((r) => r.ob_mid && r.name)
      .sort((a, b) => a.name.localeCompare(b.name, "sl"));
    if (state.view === "widget-obcine") render();
  };
  try {
    const res = await fetch("/widget/api/obcine-map?days=365");
    if (res.ok) {
      const data = await res.json();
      apply(data.map((row) => ({ ob_mid: row.ob_id ?? row.ob_mid, name: row.obcina })));
      return;
    }
  } catch {
    /* fall through */
  }
  try {
    const res = await fetch("/widget/public/data/OB-lite.geojson");
    if (!res.ok) return;
    const geo = await res.json();
    apply(
      (geo.features || []).map((f) => ({
        ob_mid: f.properties?.OB_MID,
        name: f.properties?.OB_UIME,
      }))
    );
  } catch {
    /* ignore */
  }
}

export function resetWidgetDefaults(state) {
  state.publicWidgetMode = "obcina";
  state.publicWidgetObMid = DEFAULT_OB_MID;
  state.publicWidgetObMids = [DEFAULT_OB_MID];
  state.publicWidgetTitle = "";
  state.publicWidgetLabel = "";
  state.publicWidgetTheme = state.publicWidgetTheme || "dark";
  state.publicWidgetLat = null;
  state.publicWidgetLon = null;
  state.publicWidgetMultiMode = false;
  state.publicWidgetPreviewSize = state.publicWidgetPreviewSize || "compact";
}

export function bindWidgetObcineControls(state, { $, render }) {
  const rerender = () => {
    if (state.view === "widget-obcine") render();
    else refreshWidgetPreview(state, $);
  };

  $("#public-widget-obcina")?.addEventListener("change", async (ev) => {
    await loadObcinaWidgetMeta(state, ev.target.value);
    rerender();
  });

  $("#public-widget-theme")?.addEventListener("change", (ev) => {
    state.publicWidgetTheme = ev.target.value;
    rerender();
  });

  $("#public-widget-defaults")?.addEventListener("click", async () => {
    resetWidgetDefaults(state);
    await loadObcinaWidgetMeta(state, DEFAULT_OB_MID);
    rerender();
  });

  $("#public-widget-copy")?.addEventListener("click", () => {
    const ta = $("#public-widget-embed-code");
    if (ta && navigator.clipboard) {
      navigator.clipboard.writeText(ta.value).catch(() => {});
    }
  });

  $("#public-widget-mode-compact")?.addEventListener("click", () => {
    state.publicWidgetPreviewSize = "compact";
    rerender();
  });

  $("#public-widget-mode-full")?.addEventListener("click", () => {
    state.publicWidgetPreviewSize = "full";
    rerender();
  });
}

export async function initWidgetObcinePage(state, { render, $ }) {
  initWidgetObcineState(state);
  if (!state.publicWidgetObMid) state.publicWidgetObMid = DEFAULT_OB_MID;
  await loadObcinaWidgetMeta(state, widgetObMid(state));
  refreshWidgetPreview(state, $);
}
