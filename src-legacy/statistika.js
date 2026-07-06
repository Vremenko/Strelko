import {
  archiveEmbedUrl,
  archiveMapEmbedUrl,
  hasArchiveFullAccess,
} from "./archive-embed.js";

export function renderLandingArchivePreview(state, escapeHtml) {
  const loggedIn = !!state.user;
  const embedSrc = archiveEmbedUrl(loggedIn, "preview");
  return `
    <section class="archive-charts-preview" id="statistika-strel">
      <h3 class="archive-charts-title">Statistika strel v Sloveniji</h3>
      <div
        class="archive-charts-embed-wrap"
        id="archive-embed-wrap"
        data-embed-src="${embedSrc}"
        data-embed-scope="preview"
      ><p class="archive-charts-placeholder" aria-hidden="true">Nalagam statistiko …</p>
      </div>
      <div class="archive-charts-actions">
        <button type="button" class="btn btn-primary archive-charts-more" data-nav="statistika" data-stat-tab="grafi">
          Več grafov
        </button>
      </div>
    </section>`;
}

export function renderStatistikaPage(state) {
  const loggedIn = !!state.user;
  const embedSrc = archiveEmbedUrl(loggedIn, "full");
  const mapSrc = archiveMapEmbedUrl(30);
  const tab = state.statistikaTab || "grafi";
  const fullAccess = hasArchiveFullAccess();
  return `
    <section class="archive-charts-page">
      <div class="archive-charts-head">
        <h2>Statistika strel v Sloveniji</h2>
        <p class="archive-charts-lead">Dnevni potek, urni profil, regije${
          fullAccess ? " in občine" : " — polni arhiv s paketom Podpornik"
        }.</p>
        <div class="stat-tabs" role="tablist" aria-label="Pogled">
          <button
            type="button"
            class="stat-tab${tab === "grafi" ? " stat-tab--active" : ""}"
            role="tab"
            aria-selected="${tab === "grafi"}"
            data-stat-tab="grafi"
          >Grafi</button>
          <button
            type="button"
            class="stat-tab${tab === "zemljevid" ? " stat-tab--active" : ""}"
            role="tab"
            aria-selected="${tab === "zemljevid"}"
            data-stat-tab="zemljevid"
          >Zemljevid</button>
        </div>
      </div>
      <div
        class="archive-charts-embed-wrap archive-charts-embed-wrap--full${tab === "grafi" ? "" : " stat-panel--hidden"}"
        id="archive-embed-full-wrap"
        data-embed-src="${embedSrc}"
        data-embed-scope="full"
      ><p class="archive-charts-placeholder" aria-hidden="true">Nalagam grafe …</p>
      </div>
      <div
        class="archive-map-wrap${tab === "zemljevid" ? "" : " stat-panel--hidden"}"
        id="archive-map-wrap"
        data-map-src="${mapSrc}"
      >
        <p class="archive-charts-placeholder" aria-hidden="true">Nalagam zemljevid …</p>
      </div>
    </section>`;
}

export function bindStatTabs(state, { render, navigateToView }) {
  document.querySelectorAll("[data-stat-tab]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = el.dataset.statTab;
      if (!tab) return;
      state.statistikaTab = tab;
      if (state.view === "statistika") {
        navigateToView(state, "statistika", { statTab: tab, render });
      }
    });
  });
}
