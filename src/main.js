import "./styles.css";
import { api } from "./api.js";
import { geocodeAddress } from "./geocode.js";
import { createStrikeMap } from "./map.js";
import mascotUrl from "./assets/strelko-mascot.svg?url";
import {
  COMPANY,
  LEGAL_PAGES,
  resolveLegalPageId,
  renderLegalPage,
  renderCookieBanner,
  setCookieConsent,
} from "./legal.js";

const YEAR = new Date().getFullYear();
const SEARCH_RADIUS_KM = 20;

let state = {
  view: "landing",
  legalPage: null,
  user: null,
  credits: null,
  alerts: null,
  plans: [],
  paymentsEnabled: false,
  selectedPlan: "premium",
  selected: null,
  preview: null,
  searchResult: null,
  loading: false,
};

function $(sel, root = document) {
  return root.querySelector(sel);
}

function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function formatPlaceName(label) {
  if (!label) return "";
  return label.split(",")[0].trim();
}

function renderSelectedPlace() {
  const place = formatPlaceName(state.selected?.label);
  if (!place) {
    return `<p class="selected-place hidden" id="selected-place" aria-hidden="true"></p>`;
  }
  return `<p class="selected-place" id="selected-place">${escapeHtml(place)}</p>`;
}

function getToken() {
  return localStorage.getItem("strelko_token");
}

function setToken(t) {
  if (t) localStorage.setItem("strelko_token", t);
  else localStorage.removeItem("strelko_token");
}

async function refreshUser() {
  if (!getToken()) {
    state.user = null;
    state.credits = null;
    state.paymentsEnabled = false;
    return;
  }
  try {
    state.user = await api.whoami();
    const [credits, alerts] = await Promise.all([api.credits(), api.alerts()]);
    state.credits = credits;
    state.alerts = alerts;
    state.paymentsEnabled = !!credits.payments_enabled;
  } catch {
    setToken(null);
    state.user = null;
    state.credits = null;
    state.alerts = null;
    state.paymentsEnabled = false;
  }
}

async function loadPlans() {
  try {
    const res = await api.plans();
    state.plans = res.plans || [];
    state.paymentsEnabled = !!res.payments_enabled;
  } catch {
    state.plans = [];
  }
}

function getPlanById(id) {
  return state.plans.find((p) => p.id === id);
}

function shouldShowPremiumUpsell() {
  if (!state.user) return false;
  const planId = state.credits?.plan_id;
  if (planId === "premium" || planId === "business" || planId === "enterprise") return false;
  return true;
}

function renderInsufficientCreditsUpsell() {
  const basic = getPlanById("basic");
  const premium = getPlanById("premium");
  const basicPrice = basic?.price_eur || "4,99";
  const premiumPrice = premium?.price_eur || "9,99";
  const basicCredits = basic?.monthly_credits || 3;
  const premiumCredits = premium?.monthly_credits || 20;
  const perSearch = (parseFloat(premiumPrice.replace(",", ".")) / premiumCredits)
    .toFixed(2)
    .replace(".", ",");
  return `
    <div class="premium-upsell-402">
      <p class="premium-upsell-402-lead">
        <strong>Potrebujete vsaj 1 kredit</strong> za podroben pregled z zemljevidom.
      </p>
      <div class="plan-compare-mini">
        <div class="plan-compare-col">
          <span class="plan-compare-name">Osnovni</span>
          <span class="plan-compare-price">${escapeHtml(basicPrice)} € / mesec</span>
          <span>${basicCredits} pregledov</span>
          <span class="plan-compare-miss">Brez SMS opozoril</span>
        </div>
        <div class="plan-compare-col plan-compare-col--rec">
          <span class="plan-compare-badge">Priporočeno</span>
          <span class="plan-compare-name">Premium</span>
          <span class="plan-compare-price">${escapeHtml(premiumPrice)} € / mesec</span>
          <span>${premiumCredits} pregledov · ~${perSearch} € / pregled</span>
          <span class="plan-compare-hit">SMS ob MeteoAlarm opozorilih</span>
        </div>
      </div>
    </div>`;
}

function renderPremiumResultsNudge() {
  if (!shouldShowPremiumUpsell()) return "";
  const strikes = state.searchResult?.total_strikes ?? 0;
  const text =
    strikes > 0
      ? "V bližini so bile strele. Premium vam pošlje SMS, ko ARSO izda novo opozorilo v vaši okolici."
      : "Premium vključuje SMS ob MeteoAlarm opozorilih — bodite obveščeni, preden se nevihta približa.";
  return `
    <aside class="premium-results-nudge">
      <div class="premium-results-nudge-copy">
        <strong>Opozorila v realnem času (Premium)</strong>
        <p>${text}</p>
      </div>
      <button type="button" class="btn btn-primary btn-sm" data-action="premium-upsell">Izberi Premium</button>
    </aside>`;
}

function strelkoLogoSvg() {
  return `<svg viewBox="0 0 64 64" width="48" height="48" aria-hidden="true">
    <circle cx="32" cy="32" r="28" fill="#1e3a5f"/>
    <path d="M36 10L24 34h10l-4 20 18-28H34l2-16z" fill="#f5c542"/>
  </svg>`;
}

function iconShield() {
  return `<svg viewBox="0 0 48 48" fill="none"><path d="M24 4L8 12v12c0 10 6.5 18.5 16 20 9.5-1.5 16-10 16-20V12L24 4z" stroke="#60a5fa" stroke-width="2" fill="rgba(96,165,250,0.1)"/><path d="M18 24l4 4 8-8" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/></svg>`;
}

function iconMap() {
  return `<svg viewBox="0 0 48 48" fill="none"><rect x="6" y="10" width="36" height="28" rx="4" stroke="#f5c542" stroke-width="2"/><circle cx="18" cy="22" r="3" fill="#f5c542"/><path d="M6 32l12-10 8 6 16-18" stroke="#60a5fa" stroke-width="2"/></svg>`;
}

function iconInsurance() {
  return `<svg viewBox="0 0 48 48" fill="none"><rect x="10" y="8" width="28" height="32" rx="3" stroke="#94a3b8" stroke-width="2"/><path d="M16 20h16M16 28h12" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round"/><path d="M30 8v6h6" stroke="#f5c542" stroke-width="2"/></svg>`;
}

function renderHeader() {
  const logged = !!state.user;
  return `
    <header class="site-header${logged ? " site-header--logged-in" : " site-header--guest"}">
      <a href="#" class="logo" data-nav="landing">
        ${strelkoLogoSvg()}
        <div><h1>Strelko</h1><span>Vaš zaveznik pri zavarovalnici</span></div>
      </a>
      <nav class="nav-actions">
        ${
          logged
            ? `<span class="credits-badge">${state.credits?.plan_name_sl ? `<span class="plan-badge">${escapeHtml(state.credits.plan_name_sl)}</span> · ` : ""}Krediti: <strong>${state.credits?.credits_balance ?? "—"}</strong></span>
               <button type="button" class="btn btn-ghost" data-action="credits">Paketi</button>
               <button type="button" class="btn btn-ghost" data-action="alerts">Opozorila</button>
               ${state.credits?.billing_portal_available ? `<button type="button" class="btn btn-ghost" data-action="billing">Naročnina</button>` : ""}
               <button type="button" class="btn btn-ghost" data-action="logout">Odjava</button>`
            : `<button type="button" class="btn btn-ghost" data-action="login">Prijava</button>
               <button type="button" class="btn btn-primary" data-action="register">Registracija</button>`
        }
      </nav>
    </header>`;
}

function searchScanSvg() {
  return `<svg class="search-scan-bolt" viewBox="0 0 64 64" width="72" height="72" aria-hidden="true">
    <circle class="search-scan-ring" cx="32" cy="32" r="28" fill="none" stroke="rgba(96,165,250,0.35)" stroke-width="2"/>
    <circle class="search-scan-ring search-scan-ring--2" cx="32" cy="32" r="20" fill="none" stroke="rgba(245,197,66,0.4)" stroke-width="2"/>
    <path d="M38 8L22 36h12l-6 20 22-32H36l2-16z" fill="#f5c542" stroke="#fff" stroke-width="1"/>
  </svg>`;
}

function renderSearchOverlay() {
  const active = state.loading || (state.preview && state.view === "landing");
  if (!active) return "";

  if (state.loading) {
    return `
      <div class="search-overlay is-active" role="status" aria-live="polite">
        <div class="search-scanning">
          ${searchScanSvg()}
          <p class="search-scan-title">Iskanje strel</p>
          <p class="search-scan-dots"><span>.</span><span>.</span><span>.</span></p>
        </div>
      </div>`;
  }

  const p = state.preview;
  const cls = p.has_nearby_strikes ? "warn" : "ok";
  const loginBtn = p.requires_login
    ? `<button type="button" class="btn btn-primary" data-action="login">Prijavite se za podrobnosti</button>`
    : "";
  return `
    <div class="search-overlay search-overlay--result is-active" role="region" aria-live="polite">
      <div class="search-overlay-result alert-card ${cls}">
        <h3>${p.has_nearby_strikes ? "⚡ Strele zaznane v bližini" : "✓ Brez udarov v radiju"}</h3>
        <p class="search-overlay-msg">${escapeHtml(p.message_sl)}</p>
        <div class="search-overlay-actions">
          ${loginBtn}
          <button type="button" class="btn btn-ghost" data-action="new-location">Zahtevajte novo lokacijo</button>
        </div>
      </div>
    </div>`;
}

function renderPreviewTeaser() {
  const p = state.preview;
  if (!p) return "";
  const place = escapeHtml(
    p.location_label || formatPlaceName(state.selected?.label) || "vaša lokacija"
  );
  const nearest = p.nearest_km != null ? `${p.nearest_km.toFixed(1)} km` : "—";
  const nearestDate = p.nearest_date ? escapeHtml(String(p.nearest_date)) : "—";
  const visibleRows = (p.teaser_daily || [])
    .map(
      (d) =>
        `<li><strong>${escapeHtml(String(d.datum))}</strong> · ${d.stevilo_strel} ${
          d.stevilo_strel === 1 ? "udar" : "udarov"
        }</li>`
    )
    .join("");
  const fakeRows = Array.from({ length: 6 }, (_, i) => {
    const day = 12 - i;
    return `<tr><td>2025-06-${String(day).padStart(2, "0")}</td><td>●●</td><td>●● km</td><td>●●:●●</td></tr>`;
  }).join("");

  return `
    <section class="results-panel preview-teaser">
      <p class="preview-teaser-badge">Brezplačen predogled</p>
      <h3 class="results-panel-title">⚡ Strele zaznane — ${place}</h3>
      <p class="preview-teaser-lead">${escapeHtml(p.message_sl)}</p>
      <div class="stats-grid">
        <div class="stat-box"><div class="num">${p.total_strikes}</div><div class="lbl">Skupaj udarov</div></div>
        <div class="stat-box"><div class="num">${p.days_with_strikes}</div><div class="lbl">Dni z udari</div></div>
        <div class="stat-box"><div class="num">${nearest}</div><div class="lbl">Najbližji udar</div></div>
      </div>
      ${visibleRows ? `<ul class="preview-teaser-visible">${visibleRows}</ul>` : ""}
      <p class="preview-teaser-hint">Najbližji udarec: <strong>${nearestDate}</strong> · natančen čas in lokacije so skriti.</p>
      <div class="preview-blur-block">
        <div class="preview-blur-content" aria-hidden="true">
          <div class="preview-fake-map">
            <span class="preview-fake-pin" style="left:22%;top:35%"></span>
            <span class="preview-fake-pin" style="left:58%;top:48%"></span>
            <span class="preview-fake-pin" style="left:41%;top:62%"></span>
            <span class="preview-fake-radius"></span>
          </div>
          <table class="daily-table preview-fake-table">
            <thead><tr><th>Datum</th><th>Št. strel</th><th>Najbližje</th><th>Čas</th></tr></thead>
            <tbody>${fakeRows}</tbody>
          </table>
        </div>
        <div class="preview-blur-cta">
          <h4>Odklenite celoten pregled</h4>
          <p>Zemljevid udarov, natančni časi, dnevni pregled in podlaga za zavarovalnico.</p>
          <ul class="preview-blur-perks">
            <li>Interaktivni zemljevid vseh udarcev</li>
            <li>Točen čas in oddaljenost vsake strele</li>
            <li>SMS opozorila ob nevihti (Premium)</li>
          </ul>
          <div class="preview-blur-actions">
            <button type="button" class="btn btn-primary" data-action="register">Registracija — 1 brezplačen pregled</button>
            <button type="button" class="btn btn-ghost" data-action="login">Prijava</button>
            <button type="button" class="btn btn-ghost" data-action="premium-upsell">Paketi od 4,99 €</button>
          </div>
        </div>
      </div>
      <button type="button" class="btn btn-ghost preview-teaser-back" data-nav="landing">Nova preiskava</button>
    </section>`;
}

function renderPreviewNoStrikes() {
  const p = state.preview;
  if (!p) return "";
  const place = escapeHtml(
    p.location_label || formatPlaceName(state.selected?.label) || "vaša lokacija"
  );

  return `
    <section class="results-panel preview-teaser preview-no-strikes">
      <p class="preview-teaser-badge preview-teaser-badge--ok">Brez udarov v radiju</p>
      <h3 class="results-panel-title">✓ Brez strel — ${place}</h3>
      <p class="preview-teaser-lead">${escapeHtml(p.message_sl)}</p>
      <div class="stats-grid">
        <div class="stat-box"><div class="num">0</div><div class="lbl">Udarov v 30 dneh</div></div>
        <div class="stat-box"><div class="num">${SEARCH_RADIUS_KM} km</div><div class="lbl">Preverjen radij</div></div>
        <div class="stat-box"><div class="num">30</div><div class="lbl">Dni pregleda</div></div>
      </div>
      <div class="preview-meteoalarm-offer">
        <div class="preview-meteoalarm-head">${iconShield()}</div>
        <h4>Bodite pripravljeni na naslednjo nevihto</h4>
        <p>
          Trenutno ni zabeleženih udarov, a nevihte se lahko hitro približajo.
          Z <strong>MeteoAlarm</strong> SMS prejmete opozorilo ARSO, ko je v vaši okolici
          izdano vremensko opozorilo — še preden strela udari.
        </p>
        <ul class="preview-blur-perks">
          <li>SMS ob rdečem ali oranžnem MeteoAlarm opozorilu</li>
          <li>Lokacija po vaši izbiri (dom, vikend, objekt)</li>
          <li>Vključeno v paketu Premium (9,99 €/mesec)</li>
        </ul>
        <div class="preview-blur-actions">
          <button type="button" class="btn btn-primary" data-action="register">Registracija — vključi opozorila</button>
          <button type="button" class="btn btn-ghost" data-action="login">Prijava</button>
          <button type="button" class="btn btn-ghost" data-action="premium-upsell">Paket Premium od 9,99 €</button>
        </div>
      </div>
      <button type="button" class="btn btn-ghost preview-teaser-back" data-nav="landing">Nova preiskava</button>
    </section>`;
}

async function openMeteoAlarmUpsellAfterAuth() {
  state.selectedPlan = "premium";
  if (state.alerts?.sms_eligible) {
    showAlertsModal();
  } else {
    showCreditsModal({ meteoalarmUpsell: true });
  }
}

function renderLanding() {
  const overlayBusy = state.loading || (state.preview && state.view === "landing");
  return `
    <section class="hero">
      <img src="${mascotUrl}" alt="Strelko maskota" class="hero-mascot" width="120" height="120" />
      <h2>Vam je udar <em>strele</em> uničil klimatsko napravo ali televizijo?</h2>
      <p class="lead lead-follow">
        Strelko vam lahko pomaga povrniti stroške z informativnim pregledom udarov strel v bližini.
      </p>
      <div class="search-card${overlayBusy ? " search-card--busy" : ""}">
        ${renderSearchOverlay()}
        <div class="search-card-body">
          <label for="location-input">Vnesite naslov ali kraj (Slovenija in okolica)</label>
          <input id="location-input" class="search-input" type="text" placeholder="npr. Celje, Slovenska 1" autocomplete="off" ${state.loading ? "disabled" : ""} />
          <ul class="suggestions hidden" id="suggestions"></ul>
          ${renderSelectedPlace()}
          <button type="button" class="btn btn-primary btn-search-full" id="btn-search" ${state.loading ? "disabled" : ""}>
            Preveri
          </button>
        </div>
      </div>
    </section>
    <section class="features">
      <div class="feature">${iconMap()}<h4>Zemljevid udarov</h4><p>Pregled strel okoli vašega doma na interaktivnem zemljevidu.</p></div>
      <div class="feature">${iconShield()}<h4>MeteoAlarm opozorila</h4><p>SMS ob vremenskih opozorilih v bližini vaše lokacije (Premium in Poslovni).</p></div>
      <div class="feature">${iconInsurance()}<h4>Pomoč pri zavarovalnici</h4><p>Podatki za dokazovanje bližnjih udarov strel pri zavrnitvi škode.</p></div>
    </section>`;
}

function renderResults() {
  const r = state.searchResult;
  if (!r) return "";
  const rows = r.daily
    .map(
      (d) => `
    <tr>
      <td>${d.datum}</td>
      <td>${d.stevilo_strel}</td>
      <td>${d.oddaljenost_najblizje_km != null ? d.oddaljenost_najblizje_km.toFixed(1) + " km" : "—"}</td>
      <td>${d.cas_najblizje_strele ? new Date(d.cas_najblizje_strele).toLocaleString("sl-SI") : "—"}</td>
    </tr>`
    )
    .join("");

  const periodLabel = `Obdobje: ${r.date_from} – ${r.date_to} (zadnjih 30 dni)`;

  return `
    <section class="results-panel">
      <h3 class="results-panel-title">⚡ Pregled strel – ${escapeHtml(r.location_label || "vaša lokacija")}</h3>
      <div class="stats-grid">
        <div class="stat-box"><div class="num">${r.total_strikes}</div><div class="lbl">Skupaj udarov</div></div>
        <div class="stat-box"><div class="num">${r.daily.length}</div><div class="lbl">Dni z udari</div></div>
        <div class="stat-box"><div class="num">${r.credits_remaining}</div><div class="lbl">Preostali krediti</div></div>
      </div>
      <p style="color:var(--muted);font-size:0.85rem">${periodLabel}</p>
      ${renderPremiumResultsNudge()}
      <div id="strike-map"></div>
      <div class="daily-table-scroll">
        <table class="daily-table">
          <thead><tr><th>Datum</th><th>Št. strel</th><th>Najbližje</th><th>Čas najbližje</th></tr></thead>
          <tbody>${rows || "<tr><td colspan='4'>Ni dnevnih zapisov</td></tr>"}</tbody>
        </table>
      </div>
      <p style="margin-top:1.5rem;font-size:0.85rem;color:var(--muted)">
        Te podatke lahko uporabite kot informativno podlago pri komunikaciji z zavarovalnico.
        Za uradno potrdilo se obrnite na pristojne institucije.
      </p>
      <div class="results-actions">
        ${
          state.credits?.pdf_reports_available
            ? `<button type="button" class="btn btn-primary" data-action="download-pdf" id="btn-download-pdf">Prenesi PDF poročilo</button>`
            : `<p class="pdf-upsell">PDF poročilo za zavarovalnico je na voljo v paketu <strong>Poslovni</strong>.</p>`
        }
        <button type="button" class="btn btn-ghost" data-nav="landing">Nova preiskava</button>
      </div>
    </section>`;
}

function getSelectedPlanMeta() {
  return (
    state.plans.find((p) => p.id === state.selectedPlan) || {
      id: state.selectedPlan,
      contact_only: state.selectedPlan === "enterprise",
      contact_email: "podpora@meteoinfo.si",
    }
  );
}

function renderCreditsModal({
  insufficientCredits = false,
  checkoutError = "",
  meteoalarmUpsell = false,
} = {}) {
  const paymentsDisabled = !state.paymentsEnabled;
  const selectedMeta = getSelectedPlanMeta();
  const contactOnly = !!selectedMeta.contact_only;
  const contactEmail = selectedMeta.contact_email || "podpora@meteoinfo.si";
  const plans = state.plans.length
    ? state.plans
    : [
        {
          id: "basic",
          name_sl: "Osnovni",
          tagline_sl: "Za en dom ob škodi",
          price_eur: "4,99",
          monthly_credits: 3,
          features_sl: [
            "3 pregledi / mesec",
            "Zemljevid udarov",
            "30 dni nazaj",
            "Polni podatki za zavarovalnico",
          ],
          recommended: false,
          business: false,
          contact_only: false,
        },
        {
          id: "premium",
          name_sl: "Premium",
          tagline_sl: "Več objektov in opozorila ob nevihti",
          price_eur: "9,99",
          monthly_credits: 20,
          features_sl: [
            "20 pregledov / mesec",
            "SMS ob MeteoAlarm opozorilih",
            "E-poštna opozorila",
          ],
          recommended: true,
          business: false,
          contact_only: false,
        },
        {
          id: "business",
          name_sl: "Poslovni",
          tagline_sl: "Za manjše ekipe in posrednike",
          price_eur: "149,00",
          monthly_credits: 100,
          features_sl: ["100 pregledov / mesec", "PDF poročilo"],
          recommended: false,
          business: true,
          contact_only: false,
        },
        {
          id: "enterprise",
          name_sl: "Po naročilu",
          tagline_sl: "Za zavarovalnice in večje organizacije",
          price_eur: "Po dogovoru",
          monthly_credits: 0,
          features_sl: ["Prilagojen obseg", "Več uporabnikov", "Prednostna podpora"],
          recommended: false,
          business: true,
          contact_only: true,
          contact_email: "podpora@meteoinfo.si",
        },
      ];

  const planCards = plans
    .map((p) => {
      const selected = state.selectedPlan === p.id;
      const cls = [
        "plan-card",
        selected ? "is-selected" : "",
        p.recommended ? "is-recommended" : "",
        p.business ? "is-business" : "",
        p.contact_only ? "is-enterprise" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const features = (p.features_sl || [])
        .map((f) => `<li>${escapeHtml(f)}</li>`)
        .join("");
      const priceSuffix = p.contact_only ? "" : " EUR / mesec";
      const basicPlan = plans.find((x) => x.id === "basic");
      const basicCr = basicPlan?.monthly_credits || 3;
      const premCr = p.monthly_credits || 20;
      const basicPrice = parseFloat(String(basicPlan?.price_eur || "4,99").replace(",", "."));
      const premPrice = parseFloat(String(p.price_eur || "9,99").replace(",", "."));
      const perSearchRatio =
        p.recommended && basicCr > 0 && premCr > 0
          ? (basicPrice / basicCr / (premPrice / premCr)).toFixed(1).replace(".", ",")
          : null;
      const valueProp = p.recommended
        ? `<p class="plan-value-prop">+5 €/mesec · ${perSearchRatio}× cenejši pregled · SMS vključen</p>`
        : "";
      const missProp =
        p.id === "basic"
          ? `<p class="plan-miss-prop">Brez SMS · dovolj za en primer škode</p>`
          : "";
      return `
        <button type="button" class="${cls}" data-plan="${p.id}" aria-pressed="${selected}">
          ${p.recommended ? `<span class="plan-ribbon">Priporočeno</span>` : ""}
          <h4>${escapeHtml(p.name_sl)}</h4>
          <p class="plan-tagline">${escapeHtml(p.tagline_sl)}</p>
          <p class="plan-price"><strong>${escapeHtml(p.price_eur)}</strong>${priceSuffix}</p>
          ${valueProp}
          ${missProp}
          <ul class="plan-features">${features}</ul>
        </button>`;
    })
    .join("");

  const contactPanel = contactOnly
    ? `<p class="enterprise-contact-note">
         Paket po meri za vašo organizacijo. Pišite nam na
         <a href="mailto:${escapeHtml(contactEmail)}?subject=${encodeURIComponent("Strelko – po naročilu")}">${escapeHtml(contactEmail)}</a>
         in pripravimo ponudbo.
       </p>`
    : "";

  return `
    <div class="modal-overlay" id="credits-modal">
      <div class="modal modal-plans">
        <h3>${
          insufficientCredits
            ? "Ni dovolj kreditov"
            : meteoalarmUpsell
              ? "MeteoAlarm SMS opozorila"
              : "Izberite paket"
        }</h3>
        ${
          meteoalarmUpsell && !insufficientCredits
            ? `<p class="credits-modal-lead">Premium vključuje SMS ob ARSO / MeteoAlarm opozorilih v bližini shranjene lokacije.</p>`
            : ""
        }
        ${
          insufficientCredits
            ? renderInsufficientCreditsUpsell()
            : ""
        }
        ${
          checkoutError
            ? `<p class="form-error" id="checkout-error">${escapeHtml(checkoutError)}</p>`
            : `<p class="form-error hidden" id="checkout-error"></p>`
        }
        <p style="font-size:0.85rem;color:var(--muted);margin-bottom:1rem">1 kredit = 1 podroben pregled lokacije z zemljevidom. Naročnina se obnovi mesečno.</p>
        <div class="plan-grid plan-grid--4">${planCards}</div>
        ${contactPanel}
        <div class="payment-methods${contactOnly ? " hidden" : ""}" id="payment-methods">
          <span class="pay-badge recommended">Kartica</span>
          <span class="pay-badge recommended">Apple Pay</span>
          <span class="pay-badge recommended">Google Pay</span>
        </div>
        ${
          paymentsDisabled && !contactOnly
            ? `<p class="form-error">Plačila trenutno niso na voljo. Poskusite pozneje ali pišite na podporo.</p>`
            : ""
        }
        ${
          contactOnly
            ? `<a class="btn btn-primary" id="btn-contact-enterprise" style="width:100%;margin-top:1rem;display:block;text-align:center"
                 href="mailto:${escapeHtml(contactEmail)}?subject=${encodeURIComponent("Strelko – po naročilu")}">Kontaktirajte nas</a>`
            : `<button type="button" class="btn btn-primary" id="btn-checkout" style="width:100%;margin-top:1rem" ${
                paymentsDisabled ? "disabled" : ""
              }>${state.selectedPlan === "premium" ? "Naroči Premium" : "Naroči se"}</button>`
        }
        <button type="button" class="btn btn-ghost" data-action="close-modal" style="width:100%;margin-top:0.5rem">Prekliči</button>
      </div>
    </div>`;
}

function renderCheckoutSuccessModal(creditsAdded, balance, planName) {
  const msg =
    creditsAdded > 0
      ? `Dodanih <strong>${creditsAdded}</strong> kreditov. Stanje: <strong>${balance}</strong>.`
      : planName
        ? `Naročnina <strong>${escapeHtml(planName)}</strong> je aktivna. Krediti se dodajo ob plačilu računa. Stanje: <strong>${balance}</strong>.`
        : `Naročnina je aktivna. Stanje kreditov: <strong>${balance}</strong>.`;
  return `
    <div class="modal-overlay" id="checkout-success-modal">
      <div class="modal">
        <h3>Naročnina uspešna</h3>
        <p>${msg}</p>
        <button type="button" class="btn btn-primary" data-action="close-checkout-success" style="width:100%;margin-top:1rem">
          Nadaljuj
        </button>
      </div>
    </div>`;
}

function renderAuthModal(mode) {
  const isLogin = mode === "login";
  return `
    <div class="modal-overlay" id="auth-modal">
      <div class="modal">
        <h3>${isLogin ? "Prijava" : "Registracija"}</h3>
        <form id="auth-form">
          <input type="email" name="email" placeholder="E-pošta" required autocomplete="email" />
          <input type="password" name="password" placeholder="Geslo" required minlength="8" autocomplete="${isLogin ? "current-password" : "new-password"}" />
          ${
            isLogin
              ? ""
              : `<label class="checkbox-row auth-legal-consent">
            <input type="checkbox" name="terms_accepted" required />
            <span>Strinjam se s <a href="/pogoji-uporabe" data-legal="terms">pogoji uporabe</a>,
            <a href="/zasebnost" data-legal="privacy">politiko zasebnosti Strelko</a> in
            <a href="${COMPANY.privacyPolicyUrl}" target="_blank" rel="noopener">politiko zasebnosti Meteoinfo</a>.</span>
          </label>`
          }
          <p class="form-error hidden" id="auth-error"></p>
          <button type="submit" class="btn btn-primary">${isLogin ? "Prijava" : "Ustvari račun"}</button>
        </form>
        <p style="text-align:center;font-size:0.85rem;color:var(--muted);margin-top:1rem">
          ${isLogin ? "Nimate računa?" : "Že imate račun?"}
          <a href="#" data-action="${isLogin ? "register" : "login"}">${isLogin ? "Registracija" : "Prijava"}</a>
        </p>
        <button type="button" class="btn btn-ghost" data-action="close-modal" style="width:100%;margin-top:0.5rem">Zapri</button>
      </div>
    </div>`;
}

function renderDisclaimer() {
  return `
    <aside class="disclaimer">
      <strong>Opozorilo:</strong> Prikazani podatki so izključno informativne narave in se lahko razlikujejo od uradnih evidenc.
      Meteoinfo d.o.o. ne prevzema odgovornosti za odločitve zavarovalnic ali točnost podatkov v posameznem primeru.
      Za uradne postopke se obrnite na pristojne institucije in zavarovalnico.
    </aside>`;
}

function renderFooter() {
  const legalLinks = Object.entries(LEGAL_PAGES)
    .map(([id, page]) => `<a href="${page.path}" data-legal="${id}">${page.title}</a>`)
    .join("");
  return `
    <footer class="site-footer">
      <p>&copy; ${YEAR} <strong>${COMPANY.shortName}</strong> · Strelko</p>
      <p><a href="${COMPANY.website}" target="_blank" rel="noopener">meteoinfo.si</a> · <a href="mailto:${COMPANY.email}">${COMPANY.email}</a></p>
      <nav class="legal-footer-nav" aria-label="Pravne informacije">
        ${legalLinks}
        <a href="${COMPANY.privacyPolicyUrl}" target="_blank" rel="noopener">Politika zasebnosti Meteoinfo</a>
      </nav>
      <p class="site-footer-source">
        Vir podatkov o udarih strel:
        <a href="https://meteo.hr/" target="_blank" rel="noopener">DHMZ (meteo.hr)</a>
      </p>
    </footer>`;
}

function navigateToLegal(pageId) {
  const page = LEGAL_PAGES[pageId];
  if (!page) return;
  state.legalPage = pageId;
  window.history.pushState({ legalPage: pageId }, "", page.path);
  render();
  window.scrollTo(0, 0);
}

function navigateToApp(view = "landing") {
  state.legalPage = null;
  state.view = view;
  const path = view === "landing" ? "/" : window.location.pathname;
  window.history.pushState({ view }, "", path === "/" || path.includes("verify") ? "/" : "/");
  render();
}

function render() {
  const app = $("#app");
  let body = "";
  if (state.legalPage) body = renderLegalPage(state.legalPage);
  else if (state.view === "landing") body = renderLanding();
  else if (state.view === "preview-teaser") body = renderPreviewTeaser();
  else if (state.view === "preview-no-strikes") body = renderPreviewNoStrikes();
  else if (state.view === "results") {
    body =
      (state.user
        ? `<div class="credits-bar">
             <span>👋 ${escapeHtml(state.user.email)}${state.credits?.plan_name_sl ? ` · ${escapeHtml(state.credits.plan_name_sl)}` : ""} · Krediti: <strong>${state.credits?.credits_balance ?? 0}</strong></span>
             <button type="button" class="btn btn-primary btn-sm" data-action="credits">Paketi</button>
           </div>`
        : "") + renderResults();
  }

  app.innerHTML = `
    <div class="hero-bg"></div>
    <div class="lightning-flash"></div>
    <div class="content-wrap">
      ${renderHeader()}
      ${body}
      ${renderDisclaimer()}
      ${renderFooter()}
    </div>
    ${renderCookieBanner()}`;

  bindEvents();

  if (state.view === "results" && state.searchResult) {
    requestAnimationFrame(() => {
      createStrikeMap("strike-map", {
        lat: state.searchResult.lat,
        lon: state.searchResult.lon,
        radiusKm: state.searchResult.radius_km,
        strikes: state.searchResult.strikes || [],
      });
    });
  }
}

function bindEvents() {
  $("#btn-search")?.addEventListener("click", runPreview);

  const input = $("#location-input");
  let debounce;
  input?.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => fetchSuggestions(input.value), 400);
  });
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runPreview();
    }
  });

  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      if (el.dataset.nav === "landing") {
        state.preview = null;
        state.searchResult = null;
        navigateToApp("landing");
        return;
      }
      state.view = el.dataset.nav;
      state.preview = null;
      state.searchResult = null;
      render();
    });
  });

  document.querySelectorAll("[data-legal]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      navigateToLegal(el.dataset.legal);
    });
  });

  $("#cookie-banner")?.querySelector('[data-action="accept-cookies"]')?.addEventListener("click", () => {
    setCookieConsent();
    $("#cookie-banner")?.remove();
  });

  document.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", () => handleAction(el.dataset.action));
  });
}

async function fetchSuggestions(q) {
  const ul = $("#suggestions");
  if (!ul || !q || q.length < 3) {
    ul?.classList.add("hidden");
    return;
  }
  try {
    const items = await geocodeAddress(q);
    ul.innerHTML = items
      .map(
        (it, i) =>
          `<li data-idx="${i}" data-lat="${it.lat}" data-lon="${it.lon}">${escapeHtml(it.label)}</li>`
      )
      .join("");
    ul.classList.remove("hidden");
    ul.querySelectorAll("li").forEach((li) => {
      li.addEventListener("click", () => {
        state.selected = {
          lat: parseFloat(li.dataset.lat),
          lon: parseFloat(li.dataset.lon),
          label: li.textContent,
        };
        const inp = $("#location-input");
        if (inp) inp.value = state.selected.label;
        ul.classList.add("hidden");
        runPreview();
      });
    });
  } catch {
    ul.classList.add("hidden");
  }
}

async function runPreview() {
  const input = $("#location-input");
  const q = input?.value?.trim();
  if (!q) return alert("Vnesite lokacijo.");

  state.loading = true;
  render();

  try {
    if (!state.selected || state.selected.label !== q) {
      const items = await geocodeAddress(q);
      state.selected = items[0];
      if (input) input.value = state.selected.label;
    }
    state.preview = await api.preview({
      lat: state.selected.lat,
      lon: state.selected.lon,
      radius_km: SEARCH_RADIUS_KM,
      days: 30,
      label: state.selected.label,
    });
    if (state.preview.requires_login && state.user) {
      await runFullSearch();
      return;
    }
    if (!state.user && state.preview.has_nearby_strikes) {
      state.view = "preview-teaser";
    } else if (!state.user && !state.preview.has_nearby_strikes) {
      state.view = "preview-no-strikes";
    }
  } catch (e) {
    alert(e.message || "Napaka pri preverjanju.");
  } finally {
    state.loading = false;
    render();
  }
}

async function downloadPdfReport() {
  const r = state.searchResult;
  if (!r || !state.credits?.pdf_reports_available) return;
  const btn = $("#btn-download-pdf");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Pripravljam PDF …";
  }
  try {
    const body = {
      lat: r.lat,
      lon: r.lon,
      radius_km: r.radius_km,
      label: r.location_label,
      days: 30,
    };
    const blob = await api.downloadReportPdf(body);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `strelko-porocilo_${r.date_from}_${r.date_to}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    alert(e.message || "PDF ni na voljo.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Prenesi PDF poročilo";
    }
  }
}

async function runFullSearch() {
  if (!state.user) {
    showAuthModal("login");
    return;
  }
  if (!state.selected) return;

  state.loading = true;
  render();
  try {
    const body = {
      lat: state.selected.lat,
      lon: state.selected.lon,
      radius_km: SEARCH_RADIUS_KM,
      label: state.selected.label,
      days: 30,
    };
    state.searchResult = await api.search(body);
    state.credits = {
      ...(state.credits || {}),
      credits_balance: state.searchResult.credits_remaining,
    };
    state.view = "results";
  } catch (e) {
    if (e.status === 402) {
      state.selectedPlan = "premium";
      showCreditsModal({ insufficientCredits: true });
    } else if (e.status === 401) {
      setToken(null);
      showAuthModal("login");
    } else {
      alert(e.message || "Napaka pri iskanju.");
    }
  } finally {
    state.loading = false;
    render();
  }
}

function showAuthModal(mode) {
  document.body.insertAdjacentHTML("beforeend", renderAuthModal(mode));
  const overlay = $("#auth-modal");
  $("#auth-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const email = fd.get("email");
    const password = fd.get("password");
    const errEl = $("#auth-error");
    try {
      if (mode === "login") {
        const tok = await api.login(email, password);
        setToken(tok.access_token);
      } else {
        await api.register(email, password);
        alert("Račun ustvarjen. Preverite e-pošto za aktivacijo, nato se prijavite.");
        overlay?.remove();
        showAuthModal("login");
        return;
      }
      await refreshUser();
      overlay?.remove();
      if (state.preview?.requires_login) await runFullSearch();
      else if (state.view === "preview-no-strikes") await openMeteoAlarmUpsellAfterAuth();
      else render();
    } catch (ex) {
      if (errEl) {
        errEl.textContent = ex.message || "Napaka";
        errEl.classList.remove("hidden");
      }
    }
  });
  overlay?.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", () => {
      const a = el.dataset.action;
      if (a === "close-modal") overlay.remove();
      else if (a === "login" || a === "register") {
        overlay.remove();
        showAuthModal(a);
      }
    });
  });
}

function renderAlertsModal() {
  const a = state.alerts || {};
  const eligible = !!a.sms_eligible;
  const emailAvailable = !!a.email_available;
  const emailOk = !!a.email_verified;
  const place =
    a.saved_label ||
    (a.saved_lat != null ? `${a.saved_lat.toFixed(4)}, ${a.saved_lon.toFixed(4)}` : "");
  const useSelected =
    state.selected &&
    (!a.saved_lat || state.selected.label !== a.saved_label);
  return `
    <div class="modal-overlay" id="alerts-modal">
      <div class="modal modal-plans">
        <h3>MeteoAlarm opozorila</h3>
        ${
          !eligible
            ? `<p class="form-error">Opozorila so vključena v paketih <strong>Premium</strong> in <strong>Poslovni</strong>.</p>
               <button type="button" class="btn btn-primary" data-action="credits-from-alerts" style="width:100%;margin-bottom:0.75rem">Izberi paket</button>`
            : `<p style="font-size:0.85rem;color:var(--muted)">Obvestilo po SMS, ko ARSO / MeteoAlarm izda opozorilo v bližini shranjene lokacije. Vir: <a href="https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-slovenia" target="_blank" rel="noopener">MeteoAlarm SI</a>.</p>
               <p style="font-size:0.8rem;color:var(--muted)">SMS ta mesec: <strong>${a.sms_sent_this_month ?? 0}</strong> / ${a.sms_monthly_limit ?? 0}${emailAvailable ? ` · E-pošta: <strong>${a.emails_sent_this_month ?? 0}</strong> / ${a.email_monthly_limit ?? 0}` : ""}</p>`
        }
        <form id="alerts-form" class="alerts-form">
          <label class="checkbox-row">
            <input type="checkbox" name="alert_enabled" ${a.alert_enabled ? "checked" : ""} ${eligible ? "" : "disabled"} />
            Vklopi SMS opozorila
          </label>
          <label for="alert-phone">Mobilna številka (E.164, npr. +38640123456)</label>
          <input id="alert-phone" name="alert_phone" type="tel" placeholder="+386…" value="${escapeHtml(a.alert_phone || "")}" ${eligible ? "" : "disabled"} />
          ${
            emailAvailable
              ? `<label class="checkbox-row">
            <input type="checkbox" name="alert_email_enabled" ${a.alert_email_enabled ? "checked" : ""} ${eligible && emailOk ? "" : "disabled"} />
            Vklopi e-poštna opozorila
          </label>
          ${
            eligible && !emailOk
              ? `<p style="font-size:0.8rem;color:var(--muted);margin:0 0 0.5rem">E-pošta: potrdite e-poštni naslov v profilu (preverite mapo Prejeto).</p>`
              : eligible && a.account_email
                ? `<p style="font-size:0.8rem;color:var(--muted);margin:0 0 0.5rem">E-pošta: <strong>${escapeHtml(a.account_email)}</strong></p>`
                : ""
          }`
              : ""
          }
          <label for="alert-label">Lokacija za opozorila</label>
          <input id="alert-label" name="saved_label" type="text" placeholder="Naslov ali kraj" value="${escapeHtml(place)}" ${eligible ? "" : "disabled"} />
          ${
            useSelected
              ? `<button type="button" class="btn btn-ghost btn-sm" id="btn-use-selected-loc">Uporabi trenutno iskanje: ${escapeHtml(formatPlaceName(state.selected.label))}</button>`
              : ""
          }
          <input type="hidden" name="saved_lat" id="alert-lat" value="${a.saved_lat ?? state.selected?.lat ?? ""}" />
          <input type="hidden" name="saved_lon" id="alert-lon" value="${a.saved_lon ?? state.selected?.lon ?? ""}" />
          <label for="alert-radius">Radij opozorila: <span id="alert-radius-val">${a.alert_radius_km ?? 20}</span> km</label>
          <input id="alert-radius" name="alert_radius_km" type="range" min="5" max="50" step="5" value="${a.alert_radius_km ?? 20}" ${eligible ? "" : "disabled"} />
          <p class="form-error hidden" id="alerts-error"></p>
          <button type="submit" class="btn btn-primary" style="width:100%" ${eligible ? "" : "disabled"}>Shrani</button>
        </form>
        <button type="button" class="btn btn-ghost" data-action="close-modal" style="width:100%;margin-top:0.5rem">Zapri</button>
      </div>
    </div>`;
}

function showAlertsModal() {
  $("#alerts-modal")?.remove();
  document.body.insertAdjacentHTML("beforeend", renderAlertsModal());
  const radius = $("#alert-radius");
  radius?.addEventListener("input", () => {
    const lbl = $("#alert-radius-val");
    if (lbl) lbl.textContent = radius.value;
  });
  $("#btn-use-selected-loc")?.addEventListener("click", () => {
    if (!state.selected) return;
    const lat = $("#alert-lat");
    const lon = $("#alert-lon");
    const label = $("#alert-label");
    if (lat) lat.value = state.selected.lat;
    if (lon) lon.value = state.selected.lon;
    if (label) label.value = state.selected.label;
  });
  $("#alerts-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errEl = $("#alerts-error");
    const fd = new FormData(e.target);
    const body = {
      alert_enabled: fd.get("alert_enabled") === "on",
      alert_email_enabled: fd.get("alert_email_enabled") === "on",
      alert_phone: fd.get("alert_phone") || null,
      saved_label: fd.get("saved_label") || null,
      saved_lat: fd.get("saved_lat") ? parseFloat(fd.get("saved_lat")) : null,
      saved_lon: fd.get("saved_lon") ? parseFloat(fd.get("saved_lon")) : null,
      alert_radius_km: parseFloat(fd.get("alert_radius_km") || "20"),
    };
    try {
      state.alerts = await api.updateAlerts(body);
      await refreshUser();
      $("#alerts-modal")?.remove();
      render();
    } catch (ex) {
      if (errEl) {
        errEl.textContent = ex.message || "Napaka";
        errEl.classList.remove("hidden");
      }
    }
  });
  $("#alerts-modal")?.querySelector('[data-action="close-modal"]')?.addEventListener("click", () => {
    $("#alerts-modal")?.remove();
  });
  $("#alerts-modal")?.querySelector('[data-action="credits-from-alerts"]')?.addEventListener("click", () => {
    $("#alerts-modal")?.remove();
    state.selectedPlan = "premium";
    showCreditsModal();
  });
}

function updateCreditsModalPlanSelection() {
  const meta = getSelectedPlanMeta();
  const contactOnly = !!meta.contact_only;
  $("#credits-modal")?.querySelectorAll("[data-plan]").forEach((el) => {
    const selected = el.dataset.plan === state.selectedPlan;
    el.classList.toggle("is-selected", selected);
    el.setAttribute("aria-pressed", String(selected));
  });
  $("#payment-methods")?.classList.toggle("hidden", contactOnly);
}

function refreshCreditsModalActions({
  insufficientCredits = false,
  checkoutError = "",
  meteoalarmUpsell = false,
} = {}) {
  const modal = $("#credits-modal");
  if (!modal) return;
  const meta = getSelectedPlanMeta();
  const contactOnly = !!meta.contact_only;
  const contactEmail = meta.contact_email || "podpora@meteoinfo.si";
  const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent("Strelko – po naročilu")}`;

  let note = modal.querySelector(".enterprise-contact-note");
  if (contactOnly) {
    if (!note) {
      note = document.createElement("p");
      note.className = "enterprise-contact-note";
      modal.querySelector(".plan-grid")?.after(note);
    }
    note.innerHTML = `Paket po meri za vašo organizacijo. Pišite nam na <a href="${mailto}">${escapeHtml(contactEmail)}</a> in pripravimo ponudbo.`;
  } else if (note) {
    note.remove();
  }

  const checkoutBtn = $("#btn-checkout");
  const contactBtn = $("#btn-contact-enterprise");
  if (contactOnly) {
    checkoutBtn?.remove();
    if (!contactBtn) {
      const a = document.createElement("a");
      a.id = "btn-contact-enterprise";
      a.className = "btn btn-primary";
      a.style.cssText = "width:100%;margin-top:1rem;display:block;text-align:center";
      a.href = mailto;
      a.textContent = "Kontaktirajte nas";
      modal.querySelector('[data-action="close-modal"]')?.before(a);
    }
  } else {
    contactBtn?.remove();
    if (!checkoutBtn) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "btn-checkout";
      btn.className = "btn btn-primary";
      btn.style.cssText = "width:100%;margin-top:1rem";
      btn.textContent = state.selectedPlan === "premium" ? "Naroči Premium" : "Naroči se";
      if (!state.paymentsEnabled) btn.disabled = true;
      modal.querySelector('[data-action="close-modal"]')?.before(btn);
      bindCheckoutButton(btn, { insufficientCredits, checkoutError, meteoalarmUpsell });
    } else {
      checkoutBtn.textContent = state.selectedPlan === "premium" ? "Naroči Premium" : "Naroči se";
    }
  }
  updateCreditsModalPlanSelection();
}

function bindCheckoutButton(btn, { insufficientCredits = false, checkoutError = "" } = {}) {
  btn.addEventListener("click", async () => {
    const errEl = $("#checkout-error");
    if (btn.disabled) return;
    btn.disabled = true;
    const prev = btn.textContent;
    btn.textContent = "Pripravljam naročnino …";
    if (errEl) {
      errEl.textContent = "";
      errEl.classList.add("hidden");
    }
    try {
      const { checkout_url } = await api.checkout(state.selectedPlan);
      window.location.href = checkout_url;
    } catch (e) {
      const msg = e.message || "Naročnina ni na voljo.";
      if (errEl) {
        errEl.textContent = msg;
        errEl.classList.remove("hidden");
      }
      btn.disabled = !state.paymentsEnabled;
      btn.textContent = prev;
    }
  });
}

function showCreditsModal({
  insufficientCredits = false,
  checkoutError = "",
  meteoalarmUpsell = false,
} = {}) {
  $("#credits-modal")?.remove();
  document.body.insertAdjacentHTML(
    "beforeend",
    renderCreditsModal({ insufficientCredits, checkoutError, meteoalarmUpsell })
  );
  $("#credits-modal")?.querySelectorAll("[data-plan]").forEach((el) => {
    el.addEventListener("click", () => {
      if (state.selectedPlan === el.dataset.plan) return;
      state.selectedPlan = el.dataset.plan;
      refreshCreditsModalActions({ insufficientCredits, checkoutError, meteoalarmUpsell });
    });
  });
  const btn = $("#btn-checkout");
  if (btn) bindCheckoutButton(btn, { insufficientCredits, checkoutError, meteoalarmUpsell });
  $("#credits-modal")?.querySelector('[data-action="close-modal"]')?.addEventListener("click", () => {
    $("#credits-modal")?.remove();
  });
}

function showCheckoutSuccessModal(creditsAdded, balance, planName) {
  $("#checkout-success-modal")?.remove();
  document.body.insertAdjacentHTML(
    "beforeend",
    renderCheckoutSuccessModal(creditsAdded, balance, planName)
  );
  $("#checkout-success-modal")
    ?.querySelector('[data-action="close-checkout-success"]')
    ?.addEventListener("click", () => {
      $("#checkout-success-modal")?.remove();
    });
}

function handleAction(action) {
  switch (action) {
    case "login":
      showAuthModal("login");
      break;
    case "register":
      showAuthModal("register");
      break;
    case "logout":
      setToken(null);
      state.user = null;
      state.credits = null;
      render();
      break;
    case "alerts":
      if (!state.user) showAuthModal("login");
      else showAlertsModal();
      break;
    case "credits":
      if (!state.user) showAuthModal("login");
      else showCreditsModal();
      break;
    case "premium-upsell":
      state.selectedPlan = "premium";
      if (!state.user) showAuthModal("login");
      else
        showCreditsModal({
          meteoalarmUpsell: state.view === "preview-no-strikes",
        });
      break;
    case "billing":
      if (!state.user) showAuthModal("login");
      else openBillingPortal();
      break;
    case "close-modal":
      $("#auth-modal")?.remove();
      $("#credits-modal")?.remove();
      $("#alerts-modal")?.remove();
      break;
    case "close-checkout-success":
      $("#checkout-success-modal")?.remove();
      break;
    case "download-pdf":
      downloadPdfReport();
      break;
    case "accept-cookies":
      setCookieConsent();
      $("#cookie-banner")?.remove();
      break;
    case "new-location":
      state.preview = null;
      state.selected = null;
      state.loading = false;
      state.view = "landing";
      render();
      requestAnimationFrame(() => $("#location-input")?.focus());
      break;
    default:
      break;
  }
}

async function openBillingPortal() {
  try {
    const { portal_url } = await api.billingPortal();
    window.location.href = portal_url;
  } catch (e) {
    alert(e.message || "Portal za naročnino ni na voljo.");
  }
}

async function handleCheckoutReturn() {
  const params = new URLSearchParams(window.location.search);
  const checkout = params.get("checkout");
  if (!checkout) return;

  window.history.replaceState({}, "", window.location.pathname);

  if (checkout === "cancel") {
    showCreditsModal({ checkoutError: "Plačilo je bilo preklicano." });
    return;
  }

  if (checkout !== "success") return;
  const sid = params.get("session_id");
  if (!sid || !getToken()) return;
  try {
    const res = await api.verifyCheckout(sid);
    state.credits = { credits_balance: res.credits_balance };
    state.paymentsEnabled = true;
    await refreshUser();
    showCheckoutSuccessModal(
      res.credits_added,
      res.credits_balance,
      state.credits?.plan_name_sl
    );
    render();
  } catch (e) {
    showCreditsModal({
      checkoutError: e.message || "Naročnine ni bilo mogoče potrditi. Če je bila kartica bremenjena, kontaktirajte podporo.",
    });
  }
}

function renderVerifyEmail(status, message) {
  const app = $("#app");
  const icon = status === "ok" ? "✓" : status === "loading" ? "…" : "✕";
  const title =
    status === "ok"
      ? "E-pošta potrjena"
      : status === "loading"
        ? "Potrjujem e-pošto …"
        : "Potrditev ni uspela";
  app.innerHTML = `
    <div class="hero-bg"></div>
    <div class="content-wrap">
      <section class="verify-email-panel">
        <div class="verify-email-card ${status}">
          <p class="verify-email-icon">${icon}</p>
          <h2>${title}</h2>
          <p>${escapeHtml(message)}</p>
          ${status === "ok" ? `<button type="button" class="btn btn-primary" data-nav="landing">Nadaljuj na Strelko</button>` : ""}
          ${status === "error" ? `<button type="button" class="btn btn-ghost" data-action="login">Prijava</button>` : ""}
        </div>
      </section>
      ${renderFooter()}
    </div>`;
  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      window.history.replaceState({}, "", "/");
      state.view = "landing";
      render();
    });
  });
  document.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", () => handleAction(el.dataset.action));
  });
}

async function handleVerifyEmailPage() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  renderVerifyEmail("loading", "Prosimo počakajte …");
  if (!token) {
    renderVerifyEmail("error", "Manjka žeton za potrditev. Uporabite povezavo iz e-pošte.");
    return;
  }
  try {
    const res = await api.verifyEmail(token);
    renderVerifyEmail(
      "ok",
      res.message || "Račun je aktiviran. Zdaj se lahko prijavite in preverite udare strel."
    );
    window.history.replaceState({}, "", "/verify-email?verified=1");
  } catch (e) {
    renderVerifyEmail(
      "error",
      typeof e.data?.detail === "string"
        ? e.data.detail
        : "Povezava je neveljavna ali je potekla. Registrirajte se znova ali zahtevajte novo povezavo."
    );
  }
}

async function init() {
  if (window.location.pathname.includes("/verify-email")) {
    await handleVerifyEmailPage();
    return;
  }
  const legalId = resolveLegalPageId(window.location.pathname);
  if (legalId) state.legalPage = legalId;

  window.addEventListener("popstate", () => {
    const id = resolveLegalPageId(window.location.pathname);
    if (id) {
      state.legalPage = id;
    } else {
      state.legalPage = null;
    }
    render();
  });

  await loadPlans();
  await refreshUser();
  await handleCheckoutReturn();
  render();
}

init();
