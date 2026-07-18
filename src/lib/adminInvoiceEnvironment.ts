/** Oznake okolja/izvora računa (trajni podatki z API-ja). */

export type InvoiceEnvTone = "prod" | "test" | "neutral";

export function stripeEnvLabel(inv: {
  stripe_livemode?: boolean | null;
  stripe_session_id?: string | null;
  stripe_invoice_id?: string | null;
}): { label: string; tone: InvoiceEnvTone } {
  const hasStripe = Boolean(
    (inv.stripe_session_id || "").trim() || (inv.stripe_invoice_id || "").trim()
  );
  if (!hasStripe) return { label: "Brez Stripe", tone: "neutral" };
  if (inv.stripe_livemode === true) return { label: "Produkcija", tone: "prod" };
  if (inv.stripe_livemode === false) return { label: "Testno", tone: "test" };
  return { label: "Neznano", tone: "neutral" };
}

export function fursEnvLabel(inv: {
  furs_environment?: string | null;
}): { label: string; tone: InvoiceEnvTone } {
  const env = (inv.furs_environment || "").trim().toLowerCase();
  if (env === "prod") return { label: "Produkcija", tone: "prod" };
  if (env === "test") return { label: "Testno", tone: "test" };
  return { label: "Ni poslano", tone: "neutral" };
}

const SOURCE_SL: Record<string, string> = {
  stripe_checkout: "Stripe Checkout",
  stripe_subscription: "Stripe naročnina",
  admin_issue_missing: "Admin – manjkajoči račun",
  cli_test: "CLI test",
  other: "Drugo",
};

export function invoiceSourceLabel(source?: string | null): string {
  const key = (source || "").trim() || "other";
  return SOURCE_SL[key] || SOURCE_SL.other;
}
