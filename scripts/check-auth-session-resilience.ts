/**
 * Regresija: uspešen login + alerts 500 → uporabnik ostane prijavljen.
 * Zagon: npx tsx scripts/check-auth-session-resilience.ts
 */
import {
  ALERTS_LOAD_WARNING,
  planAfterWhoami,
  shouldClearAuthToken,
} from "../src/lib/auth-session";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

// Uspešen whoami + alerts 500 → ne odjavi
{
  const plan = planAfterWhoami({ alertsError: { status: 500 } });
  assert(plan.clearAuth === false, "alerts 500 ne sme počistiti žetona");
  assert(plan.alertsOk === false, "alerts ni ok");
  assert(plan.creditsOk === true, "credits ostane ok, če ni padel");
  assert(plan.alertsWarning === ALERTS_LOAD_WARNING, "opozorilo za alerts");
}

// Uspešen whoami + credits 500 → ne odjavi
{
  const plan = planAfterWhoami({ creditsError: { status: 500 } });
  assert(plan.clearAuth === false, "credits 500 ne sme počistiti žetona");
  assert(plan.creditsOk === false, "credits ni ok");
  assert(plan.alertsOk === true, "alerts ostane ok");
  assert(plan.alertsWarning === null, "brez alerts opozorila");
}

// Omrežna napaka (brez HTTP statusa) → ne odjavi
{
  const plan = planAfterWhoami({ alertsError: {} });
  assert(plan.clearAuth === false, "network napaka ne briše žetona");
  assert(plan.alertsWarning === ALERTS_LOAD_WARNING, "opozorilo ob network napaki");
}

assert(shouldClearAuthToken(undefined, "auxiliary") === false, "brez statusa = ne briši");
assert(shouldClearAuthToken(undefined, "whoami") === false, "whoami brez statusa = ne briši");
assert(shouldClearAuthToken(401, "whoami") === true, "whoami 401");
assert(shouldClearAuthToken(403, "whoami") === true, "whoami 403 inactive");
assert(shouldClearAuthToken(403, "auxiliary") === false, "aux 403 ne briši");
assert(shouldClearAuthToken(401, "auxiliary") === true, "aux 401 briši");

{
  const plan = planAfterWhoami({ alertsError: { status: 401 } });
  assert(plan.clearAuth === true, "alerts 401 počisti žeton");
}

console.log("check-auth-session-resilience: OK");
