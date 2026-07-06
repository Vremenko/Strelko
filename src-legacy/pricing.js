import { formatSlDecimal } from "./dates.js";

export const STRELKO_VAT_RATE = 0.22;
export const STRELKO_VAT_RATE_PERCENT = 22;

function parseEurAmount(value) {
  if (value == null || value === "") return null;
  const n = parseFloat(String(value).replace(",", ".").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function splitGrossPriceEur(gross) {
  const net = gross / (1 + STRELKO_VAT_RATE);
  const vat = gross - net;
  return {
    net: formatSlDecimal(net, 2),
    vat: formatSlDecimal(vat, 2),
    gross: formatSlDecimal(gross, 2),
  };
}

export function planPriceBreakdown(plan) {
  if (!plan || plan.contact_only) return null;
  const grossRaw = plan.price_gross_eur || plan.price_eur;
  if (!grossRaw || /dogovoru/i.test(grossRaw)) return null;

  if (plan.price_net_eur && plan.price_vat_eur && plan.price_gross_eur) {
    return {
      net: plan.price_net_eur,
      vat: plan.price_vat_eur,
      gross: plan.price_gross_eur,
      vatRate: plan.vat_rate_percent ?? STRELKO_VAT_RATE_PERCENT,
    };
  }

  const gross = parseEurAmount(grossRaw);
  if (gross == null) return null;
  return { ...splitGrossPriceEur(gross), vatRate: STRELKO_VAT_RATE_PERCENT };
}

export function renderPlanPriceHtml(plan, { escapeHtml }) {
  if (!plan || plan.contact_only) {
    return `<p class="plan-price"><strong>${escapeHtml(plan?.price_eur || "Po dogovoru")}</strong></p>`;
  }

  const breakdown = planPriceBreakdown(plan);
  if (!breakdown) {
    return `<p class="plan-price"><strong>${escapeHtml(plan.price_eur)}</strong> € / mesec</p>`;
  }

  return `<p class="plan-price"><strong>${escapeHtml(breakdown.gross)}</strong> € / mesec</p>
          <p class="plan-price-vat">vklj. ${breakdown.vatRate}% DDV · brez DDV ${escapeHtml(breakdown.net)} € · DDV ${escapeHtml(breakdown.vat)} €</p>`;
}

export function formatPlanGrossLabel(plan, fallback = "") {
  const breakdown = planPriceBreakdown(plan);
  if (breakdown) return `${breakdown.gross} €`;
  if (plan?.price_eur) return `${plan.price_eur} €`;
  return fallback;
}
