/**
 * Statični preverjanje admin uporabnikov (filtri, sort, profil, značke).
 * Zaženi: npx tsx scripts/check-admin-users.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ADMIN_USER_FILTERS,
  ADMIN_USER_SORT_OPTIONS,
  creditReasonLabel,
  podpornikSourceLabel,
} from "../src/lib/adminUserLabels";

const root = join(import.meta.dirname, "..");

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

assert.equal(ADMIN_USER_FILTERS.length, 10);
assert.ok(ADMIN_USER_FILTERS.some((f) => f.id === "podpornik_manual"));
assert.ok(ADMIN_USER_FILTERS.some((f) => f.id === "cancel_pending"));
assert.equal(ADMIN_USER_SORT_OPTIONS.length, 4);

assert.equal(podpornikSourceLabel({ podpornik_active: false }), "Ni aktiven");
assert.equal(
  podpornikSourceLabel({
    podpornik_active: true,
    podpornik_manual: true,
    stripe_subscription_id: null,
  }),
  "Ročno"
);
assert.equal(
  podpornikSourceLabel({
    podpornik_active: true,
    podpornik_manual: false,
    stripe_subscription_id: "sub_1",
  }),
  "Stripe"
);

assert.equal(creditReasonLabel("admin_grant:test"), "Admin dodelitev: test");
assert.equal(creditReasonLabel("query_spend"), "Poraba");

const section = read("src/components/admin/AdminUsersSection.tsx");
assert.match(section, /Ponastavi filtre/);
assert.match(section, /Preklic ob koncu obdobja/);
assert.match(section, /admin-user-profile/);
assert.match(section, /sort_by/);
assert.match(section, /sort_dir/);
assert.match(section, /filter:/);
assert.match(section, /buildInvoicePipeline/);
assert.match(section, /Poizvedbe/);
assert.match(section, /Tehnične podrobnosti/);
assert.match(section, /onKeyDown[\s\S]*Enter/);
assert.doesNotMatch(section, /dangerouslySetInnerHTML/);

const client = read("src/api/client.ts");
assert.match(client, /listUsers:[\s\S]*filter\?:/);
assert.match(client, /sort_by\?:/);
assert.match(client, /sort_dir\?:/);

const page = read("src/pages/AdminPage.tsx");
assert.match(page, /AdminUsersSection/);

console.log("check-admin-users: OK");
