/**
 * Ciljni preverbi logike Obnovi naročnino (brez Vitest).
 * Zagon: npx tsx scripts/verify-portal-restore.ts
 */
import assert from "node:assert/strict";
import {
  getPodpornikOverview,
  isSubscriptionNotRestorableError,
  PODPORNIK_RENEWAL_NOTICE,
} from "../src/lib/portal-account.ts";
import type { Credits } from "../src/types/index.ts";

const activeCanceling: Credits = {
  plan_id: "podpornik",
  has_subscription: true,
  billing_portal_available: true,
  subscription_cancel_at_period_end: true,
  subscription_current_period_end: "2026-08-16",
};

const activeRenewing: Credits = {
  ...activeCanceling,
  subscription_cancel_at_period_end: false,
};

const inactive: Credits = {
  plan_id: "ob_skodi",
  has_subscription: false,
  billing_portal_available: false,
};

const canceledOverview = getPodpornikOverview(activeCanceling);
assert.equal(canceledOverview.active, true);
assert.equal(canceledOverview.cancelScheduled, true);
assert.equal(canceledOverview.canRestore, true);
assert.equal(canceledOverview.canCancel, false);
assert.equal(canceledOverview.expiryLabel, "Velja do 16. avgusta 2026");
assert.match(canceledOverview.cancelNotice || "", /ne bo samodejno/);

const renewingOverview = getPodpornikOverview(activeRenewing);
assert.equal(renewingOverview.canRestore, false);
assert.equal(renewingOverview.canCancel, true);
assert.equal(renewingOverview.renewalNotice, PODPORNIK_RENEWAL_NOTICE);
assert.equal(renewingOverview.cancelScheduled, false);

const inactiveOverview = getPodpornikOverview(inactive);
assert.equal(inactiveOverview.canRestore, false);
assert.equal(inactiveOverview.canCancel, false);

const manualPodpornik: Credits = {
  plan_id: "podpornik",
  has_subscription: false,
  billing_portal_available: false,
  season_pass_expires_at: "2026-12-31",
  subscription_cancel_at_period_end: false,
};
const manualOverview = getPodpornikOverview(manualPodpornik);
assert.equal(manualOverview.active, true);
assert.equal(manualOverview.canRestore, false);
assert.equal(manualOverview.canCancel, false);

assert.equal(PODPORNIK_RENEWAL_NOTICE, "Naročnina se bo samodejno podaljšala.");

assert.equal(
  isSubscriptionNotRestorableError({
    data: { detail: { code: "subscription_not_restorable", message: "x" } },
  }),
  true
);
assert.equal(isSubscriptionNotRestorableError({ data: { detail: "other" } }), false);

console.log("verify-portal-restore: OK");
