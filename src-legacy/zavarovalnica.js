/** Pomoč pri zavarovalnici — stran z uvodom in iskalnikom. */

export function isZavarovalnicaView(state) {
  return state.view === "zavarovalnica";
}

export function renderZavarovalnicaPage(state, { escapeHtml, renderSearchOverlay, renderSelectedPlace }) {
  const busy = state.loading || (state.preview && isZavarovalnicaView(state));
  const locationValue = escapeHtml(
    state.locationQuery || state.selected?.label || ""
  );
  return `
    <section class="zavarovalnica-page">
      <header class="zavarovalnica-hero">
        <h2>Vam je <em>strela</em> poškodovala klimatsko napravo, televizijo ali drugo elektroniko?</h2>
      </header>
      <div class="zavarovalnica-intro">
        <p class="zavarovalnica-lead">Strelko preveri udare strel v bližini vašega naslova in pripravi pregleden izpis, ki vam lahko pomaga pri komunikaciji z zavarovalnico.</p>
        <p class="zavarovalnica-lead">Na podlagi razpoložljivih podatkov prikažemo, ali so bili v izbranem obdobju v okolici vašega naslova zaznani udari strel. Rezultate si lahko ogledate na zemljevidu in v tabeli ter jih shranite kot PDF izpis.</p>
      </div>
      <div class="zavarovalnica-grid">
        <div class="zavarovalnica-block zavarovalnica-block--how">
          <h3 class="zavarovalnica-subtitle">Kako deluje</h3>
          <ol class="zavarovalnica-steps">
            <li>Vnesete naslov, kjer je nastala škoda, ter izberete obdobje pregleda.</li>
            <li>Strelko preveri zaznane udare strel v izbranem radiju okoli naslova.</li>
            <li>Rezultate prikaže na zemljevidu in v tabeli.</li>
            <li>Pregled lahko shranite kot PDF in ga uporabite kot prilogo pri prijavi škode zavarovalnici.</li>
          </ol>
        </div>
        <div class="zavarovalnica-block zavarovalnica-block--benefits">
          <h3 class="zavarovalnica-subtitle">Kaj vključuje pregled</h3>
          <ul class="zavarovalnica-list">
            <li>pregled zaznanih udarov strel v bližini izbranega naslova,</li>
            <li>zemljevid z lokacijami udarov in označeno lokacijo naslova,</li>
            <li>čas in oddaljenost posameznih udarov strel,</li>
            <li>povzetek rezultatov za izbrano obdobje,</li>
            <li>možnost izvoza oziroma shranjevanja pregleda v PDF obliki.</li>
          </ul>
        </div>
      </div>
      <div class="search-card search-card--inline${busy ? " search-card--busy" : ""}">
        ${renderSearchOverlay()}
        <div class="search-card-body">
          <h3 class="search-card-title">Preverite udare strel v bližini</h3>
          <p class="search-card-intro">Vnesite naslov, izberite radij in obdobje pregleda. Po kliku na gumb se bodo prikazali udari strel v okolici izbrane lokacije.</p>
          <div class="location-field">
            <input id="location-input" class="search-input" type="text" placeholder="npr. Ženjak 4, Benedikt" autocomplete="off" value="${locationValue}" ${state.loading ? "disabled" : ""} />
            <ul class="suggestions hidden" id="suggestions"></ul>
          </div>
          ${renderSelectedPlace()}
          <button type="button" class="btn btn-primary btn-search-full" id="btn-search" ${state.loading ? "disabled" : ""}>Prikaži rezultate</button>
        </div>
      </div>
    </section>`;
}

export function resultsPanelClass(state) {
  return isZavarovalnicaView(state) ? " results-panel--zavarovalnica" : "";
}

export function resultsBackNav(state) {
  return isZavarovalnicaView(state) ? "zavarovalnica" : "landing";
}
