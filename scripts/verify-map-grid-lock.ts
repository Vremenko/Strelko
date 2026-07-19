/**
 * Ciljni testi zaklepa mreže 1 × 1 km (brez Vitest).
 * Zagon: npx tsx scripts/verify-map-grid-lock.ts
 */
import assert from "node:assert/strict";
import {
  canAccessMapGrid,
  isMapMunicipalityPeriodFree,
  mapGridStateAfterAccessLoss,
  MAP_GRID_LOCK_FLASH_KEY,
  markMapGridLockFlash,
  consumeMapGridLockFlash,
} from "../src/lib/map-grid-access.ts";
import {
  LOCKED_GRID_TITLE,
  LOCKED_GRID_TEXT,
  LOCKED_SUPPORTER_CTA,
  LOCKED_SUPPORTER_CTA_HREF,
} from "../src/lib/locked-supporter-copy.ts";
import { isPodpornikActive } from "../src/lib/portal-account.ts";
import type { Credits } from "../src/types/index.ts";

const guest: Credits | null = null;
const loggedInNoPlan: Credits = {
  plan_id: "ob_skodi",
  has_subscription: false,
};
const expiredPodpornik: Credits = {
  plan_id: "podpornik",
  has_subscription: false,
  season_pass_expires_at: "2020-01-01",
};
const activeSub: Credits = {
  plan_id: "podpornik",
  has_subscription: true,
};
const activeSeason: Credits = {
  plan_id: "podpornik",
  has_subscription: false,
  season_pass_expires_at: "2099-12-31",
};

assert.equal(canAccessMapGrid(guest), false, "neprijavljen ne sme vključiti mreže");
assert.equal(canAccessMapGrid(loggedInNoPlan), false, "brez Podpornika ne sme vključiti mreže");
assert.equal(canAccessMapGrid(expiredPodpornik), false, "pretečen Podpornik ne sme vključiti mreže");
assert.equal(isPodpornikActive(expiredPodpornik), false);
assert.equal(canAccessMapGrid(activeSub), true, "aktivni Podpornik sme uporabljati mrežo");
assert.equal(canAccessMapGrid(activeSeason), true, "sezona Podpornik sme uporabljati mrežo");

assert.equal(isMapMunicipalityPeriodFree(1), true, "danes ostane brezplačen");
assert.equal(isMapMunicipalityPeriodFree(7), true, "7 dni ostane brezplačen");
assert.equal(isMapMunicipalityPeriodFree(14), false);
assert.equal(isMapMunicipalityPeriodFree(30), false);

const afterLogout = mapGridStateAfterAccessLoss("grid");
assert.equal(afterLogout.view, "obcine");
assert.equal(afterLogout.clearGridLayer, true);
assert.equal(afterLogout.showLockedPanel, true);

const afterLogoutObcine = mapGridStateAfterAccessLoss("obcine");
assert.equal(afterLogoutObcine.clearGridLayer, false);
assert.equal(afterLogoutObcine.showLockedPanel, false);

assert.equal(LOCKED_GRID_TITLE, "Ta prikaz je na voljo s paketom Podpornik");
assert.match(LOCKED_GRID_TEXT, /mrežo 1 × 1 km/);
assert.equal(LOCKED_SUPPORTER_CTA, "Aktiviraj paket Podpornik");
assert.equal(LOCKED_SUPPORTER_CTA_HREF, "/cenik");

const mem = new Map<string, string>();
const orig = globalThis.sessionStorage;
Object.defineProperty(globalThis, "sessionStorage", {
  configurable: true,
  value: {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
  },
});
markMapGridLockFlash();
assert.equal(mem.get(MAP_GRID_LOCK_FLASH_KEY), "1");
assert.equal(consumeMapGridLockFlash(), true);
assert.equal(consumeMapGridLockFlash(), false);
if (orig !== undefined) {
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: orig });
}

console.log("verify-map-grid-lock: OK");
