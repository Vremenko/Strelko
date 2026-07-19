/**
 * Gost na ceniku ne sme videti »kmalu na voljo«.
 * Zagon: npx tsx scripts/verify-pricing-guest-cta.ts
 */
import assert from "node:assert/strict";
import {
  guestObSkodiCtaLabel,
  guestPodpornikCtaLabel,
  resolvePaymentsAvailability,
} from "../src/lib/pricing-cta.ts";
import { obSkodiPurchaseCtaLabel } from "../src/lib/ob-skodi-tokens.ts";

assert.equal(guestObSkodiCtaLabel(), "Za nakup žetonov se prijavite.");
assert.equal(guestPodpornikCtaLabel(), "Za aktivacijo paketa Podpornik se prijavite.");
assert.match(obSkodiPurchaseCtaLabel(3, false), /kmalu na voljo/);

assert.equal(
  resolvePaymentsAvailability({
    paymentsResolved: false,
    paymentsEnabled: false,
    plansError: null,
  }),
  "loading"
);
assert.equal(
  resolvePaymentsAvailability({
    paymentsResolved: true,
    paymentsEnabled: true,
    plansError: null,
  }),
  "enabled"
);
assert.equal(
  resolvePaymentsAvailability({
    paymentsResolved: true,
    paymentsEnabled: false,
    plansError: null,
  }),
  "disabled"
);
assert.equal(
  resolvePaymentsAvailability({
    paymentsResolved: false,
    paymentsEnabled: false,
    plansError: "x",
  }),
  "error"
);

/** Simulacija CTA izbire za gosta — ne glede na payments. */
function guestLabel(payments: ReturnType<typeof resolvePaymentsAvailability>): string {
  void payments;
  return guestObSkodiCtaLabel();
}
for (const s of ["loading", "enabled", "disabled", "error"] as const) {
  assert.equal(guestLabel(s), "Za nakup žetonov se prijavite.");
  assert.ok(!guestLabel(s).includes("kmalu"));
}

console.log("verify-pricing-guest-cta: OK");
