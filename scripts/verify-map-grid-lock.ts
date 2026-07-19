/**
 * Ciljni testi zaklepa mreže 1 × 1 km (brez Vitest).
 * Zagon: npx tsx scripts/verify-map-grid-lock.ts
 */
import assert from "node:assert/strict";
import {
  canAccessMapGrid,
  isMapGridLocked,
  isMapMunicipalityPeriodFree,
  isMapPeriodOptionLocked,
  isPeriodLocked,
  mapGridStateAfterAccessLoss,
  mapStateAfterLeavingLockedGrid,
  shouldApplyStaleGridLockEvent,
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

assert.equal(isMapGridLocked("grid", false), true, "mreža brez Podpornika → zaklenjeni panel");
assert.equal(isMapGridLocked("obcine", false), false);
assert.equal(isMapGridLocked("grid", true), false, "Podpornik lahko preklaplja");

/* mreža + Danes/7 dni je brez Podpornika zaklenjena */
assert.equal(isPeriodLocked("grid", "1", false), true, "mreža + Danes zaklenjena");
assert.equal(isPeriodLocked("grid", "7", false), true, "mreža + 7 dni zaklenjena");

/* nato klik Občine odklene Danes / 7 dni in naloži zemljevid */
const leaveToday = mapStateAfterLeavingLockedGrid("1");
assert.equal(leaveToday.view, "obcine");
assert.equal(leaveToday.clearGridLockReason, true, "zaklepni razlog mreže se izbriše");
assert.equal(leaveToday.showPeriodLock, false, "Občine + Danes odklenjeno");
assert.equal(leaveToday.reloadObcine, true, "občinski zemljevid za Danes se naloži");
assert.equal(isPeriodLocked("obcine", "1", false), false);

const leave7 = mapStateAfterLeavingLockedGrid("7");
assert.equal(leave7.showPeriodLock, false);
assert.equal(leave7.reloadObcine, true, "enak prehod deluje za 7 dni");
assert.equal(isPeriodLocked("obcine", "7", false), false);

/* mreža + 14 dni → Občine + 14 dni ostane zaklenjeno */
const leave14 = mapStateAfterLeavingLockedGrid("14");
assert.equal(leave14.showPeriodLock, true);
assert.equal(leave14.reloadObcine, false);
assert.equal(isPeriodLocked("obcine", "14", false), true);

/* Sticky periodLockUiValue "1" iz mreže ne sme zakleniti občin */
assert.equal(
  isPeriodLocked("obcine", "1", false),
  false,
  "ne uporabljaj sticky zaklepa iz mreže za Danes"
);

/* Pri mreži imajo ključavnico vsa obdobja */
for (const v of ["1", "7", "14", "30", "90", "custom"]) {
  assert.equal(isMapPeriodOptionLocked(v, "grid", false), true);
}

/* Pri občinah Danes in 7 dni nimata ključavnice */
assert.equal(isMapPeriodOptionLocked("1", "obcine", false), false);
assert.equal(isMapPeriodOptionLocked("7", "obcine", false), false);
assert.equal(isMapPeriodOptionLocked("14", "obcine", false), true);

/* Podpornik: nobeno obdobje ni zaklenjeno — normalno preklapljanje */
for (const v of ["1", "7", "14", "30", "90", "custom"]) {
  assert.equal(isPeriodLocked("grid", v, true), false);
  assert.equal(isPeriodLocked("obcine", v, true), false);
}

/* Zapozneli dogodek zaklenjene mreže ne more ponovno zakleniti občin */
assert.equal(shouldApplyStaleGridLockEvent("obcine", "grid"), false);
assert.equal(shouldApplyStaleGridLockEvent("obcine", "obcine"), false);
assert.equal(shouldApplyStaleGridLockEvent("grid", "grid"), true);
assert.equal(shouldApplyStaleGridLockEvent("grid", undefined), true);

assert.equal(isMapMunicipalityPeriodFree(1), true);
assert.equal(isMapMunicipalityPeriodFree(7), true);

const afterLogout = mapGridStateAfterAccessLoss("grid");
assert.equal(afterLogout.view, "grid");
assert.equal(afterLogout.clearGridLayer, true);
assert.equal(afterLogout.showLockedPanel, true);

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
