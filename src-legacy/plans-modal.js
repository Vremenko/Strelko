import { formatSlDecimal } from "./dates.js";
import { formatPlanGrossLabel, planPriceBreakdown, renderPlanPriceHtml } from "./pricing.js";
import { seasonLabelSl } from "./season.js";

export function defaultPlansFallback() {
  return [
    {
      id: "ob_skodi",
      name_sl: "Ob škodi",
      tagline_sl: "Za dokaz pri zavarovalnici",
      price_eur: "4,50",
      price_suffix_sl: " / mesec",
      billing_mode: "subscription",
      monthly_credits: 5,
      max_locations: 2,
      pdf_per_period: 1,
      features_sl: [
        "5 podrobnih pregledov / mesec",
        "Do 2 lokacij",
        "1× PDF poročilo / mesec",
        "Velja vse leto",
      ],
      recommended: false,
    },
    {
      id: "podpornik",
      name_sl: "Podpornik",
      tagline_sl: "Statistika strel in widget za vašo stran",
      price_eur: "8,50",
      price_suffix_sl: " do konca sezone",
      billing_mode: "season_pass",
      monthly_credits: 5,
      max_locations: 1,
      pdf_per_period: 0,
      features_sl: [
        "Polni arhiv med sezono",
        "5 pregledov lokacije / sezono",
        "Widget za 1 spletno stran",
        "Pozimi arhiv brezplačen za vse",
      ],
      recommended: true,
    },
  ];
}

export function checkoutButtonLabel(planId, plans) {
  const p = plans.find((x) => x.id === planId);
  if (planId === "podpornik") return "Kupi Podpornik";
  if (planId === "ob_skodi") return "Naroči Ob škodi";
  return p?.billing_mode === "season_pass" ? "Kupi paket" : "Naroči se";
}

export function renderInsufficientCreditsUpsell(plans, escapeHtml) {
  const skoda = plans.find((p) => p.id === "ob_skodi") || defaultPlansFallback()[0];
  const pod = plans.find((p) => p.id === "podpornik") || defaultPlansFallback()[1];
  return `
    <div class="premium-upsell-402">
      <p class="premium-upsell-402-lead">
        <strong>Potrebujete vsaj 1 pregled</strong> za podroben zemljevid in tabelo.
      </p>
      <div class="plan-compare-mini">
        <div class="plan-compare-col">
          <span class="plan-compare-name">${escapeHtml(skoda.name_sl)}</span>
          <span class="plan-compare-price">${escapeHtml(formatPlanGrossLabel(skoda, "4,50 €"))}${escapeHtml(skoda.price_suffix_sl || "/mesec")}</span>
          <span>${skoda.monthly_credits} pregledov · PDF</span>
        </div>
        <div class="plan-compare-col plan-compare-col--rec">
          <span class="plan-compare-badge">Sezona</span>
          <span class="plan-compare-name">${escapeHtml(pod.name_sl)}</span>
          <span class="plan-compare-price">${escapeHtml(formatPlanGrossLabel(pod, "8,50 €"))}${escapeHtml(pod.price_suffix_sl || "")}</span>
          <span>Arhiv + widget</span>
        </div>
      </div>
    </div>`;
}

export function renderCreditsModalHtml({
  plans,
  selectedPlan,
  paymentsEnabled,
  insufficientCredits = false,
  checkoutError = "",
  seasonMeta = {},
  escapeHtml,
}) {
  const list = plans.length ? plans : defaultPlansFallback();
  const seasonNote = seasonMeta.season_label_sl || seasonLabelSl();
  const archiveFree = !!seasonMeta.archive_free_now;

  const planCards = list
    .map((p) => {
      const selected = selectedPlan === p.id;
      const cls = ["plan-card", selected ? "is-selected" : "", p.recommended ? "is-recommended" : ""]
        .filter(Boolean)
        .join(" ");
      const features = (p.features_sl || []).map((f) => `<li>${escapeHtml(f)}</li>`).join("");
      const vatLine = planPriceBreakdown(p);
      const vatNote = vatLine
        ? `<p class="plan-price-vat">vklj. ${vatLine.vatRate}% DDV</p>`
        : "";
      return `
        <button type="button" class="${cls}" data-plan="${p.id}" aria-pressed="${selected}">
          ${p.recommended ? `<span class="plan-ribbon">Priporočeno</span>` : ""}
          <h4>${escapeHtml(p.name_sl)}</h4>
          <p class="plan-tagline">${escapeHtml(p.tagline_sl)}</p>
          ${renderPlanPriceHtml(p, { escapeHtml })}
          ${vatNote}
          <ul class="plan-features">${features}</ul>
        </button>`;
    })
    .join("");

  const intro = archiveFree
    ? `<p class="credits-modal-lead">Pozimi je <strong>statistika strel brezplačna za vse</strong>. Med sezono (${escapeHtml(seasonNote)}) odklenite polni arhiv s paketom Podpornik.</p>`
    : `<p class="credits-modal-lead">Sezona strel: <strong>${escapeHtml(seasonNote)}</strong>. Izberite paket za podrobne preglede ali polni arhiv.</p>`;

  return `
    <div class="modal-overlay" id="credits-modal">
      <div class="modal modal-plans modal-plans--dual">
        <h3>${insufficientCredits ? "Ni dovolj pregledov" : "Izberite paket"}</h3>
        ${intro}
        ${insufficientCredits ? renderInsufficientCreditsUpsell(list, escapeHtml) : ""}
        ${
          checkoutError
            ? `<p class="form-error" id="checkout-error">${escapeHtml(checkoutError)}</p>`
            : `<p class="form-error hidden" id="checkout-error"></p>`
        }
        <div class="plan-grid plan-grid--2">${planCards}</div>
        <p class="plans-footnote">1 pregled = podroben zemljevid in tabela za eno lokacijo (14 dni). Vse cene vključujejo 22&nbsp;% DDV.</p>
        <div class="payment-methods" id="payment-methods">
          <span class="pay-badge recommended">Kartica</span>
          <span class="pay-badge recommended">Apple Pay</span>
          <span class="pay-badge recommended">Google Pay</span>
        </div>
        ${
          !paymentsEnabled
            ? `<p class="form-error">Plačila trenutno niso na voljo. Poskusite pozneje.</p>`
            : ""
        }
        <button type="button" class="btn btn-primary" id="btn-checkout" style="width:100%;margin-top:1rem" ${
          !paymentsEnabled ? "disabled" : ""
        }>${checkoutButtonLabel(selectedPlan, list)}</button>
        <button type="button" class="btn btn-ghost" data-action="close-modal" style="width:100%;margin-top:0.5rem">Prekliči</button>
      </div>
    </div>`;
}

export function renderCheckoutSuccessHtml({ creditsAdded, balance, planId, planName, escapeHtml }) {
  const isSeason = planId === "podpornik";
  const msg = isSeason
    ? `Paket <strong>${escapeHtml(planName || "Podpornik")}</strong> je aktiven do konca sezone. Na voljo imate <strong>${balance}</strong> pregledov in widget.`
    : creditsAdded > 0
      ? `Dodanih <strong>${creditsAdded}</strong> pregledov. Stanje: <strong>${balance}</strong>.`
      : planName
        ? `Paket <strong>${escapeHtml(planName)}</strong> je aktiven. Stanje: <strong>${balance}</strong> pregledov.`
        : `Paket je aktiven. Stanje: <strong>${balance}</strong> pregledov.`;
  return `
    <div class="modal-overlay" id="checkout-success-modal">
      <div class="modal">
        <h3>${isSeason ? "Hvala za podporo!" : "Plačilo uspešno"}</h3>
        <p>${msg}</p>
        <button type="button" class="btn btn-primary" data-action="close-checkout-success" style="width:100%;margin-top:1rem">
          Nadaljuj
        </button>
      </div>
    </div>`;
}
