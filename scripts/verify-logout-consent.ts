/**
 * Preveri, da odjava vedno počisti žeton in ohrani privolitev.
 * Zagon: npx tsx scripts/verify-logout-consent.ts
 */
import assert from "node:assert/strict";
import {
  COOKIE_CONSENT_KEY,
  writeCookieConsent,
  readCookieConsent,
} from "../src/lib/cookie-consent.ts";
import { TOKEN_KEY } from "../src/lib/utils.ts";

const store = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => store.set(k, String(v)),
    removeItem: (k: string) => store.delete(k),
  },
});

async function simulateLogout(opts: { apiOk: boolean }) {
  store.set(TOKEN_KEY, "test-jwt-token");
  writeCookieConsent("analytics");
  store.set("strelko_map_layers", '{"keep":true}');

  const logoutCall = async () => {
    if (!opts.apiOk) throw new Error("network");
  };

  try {
    await logoutCall();
  } catch {
    /* ignore */
  } finally {
    store.delete(TOKEN_KEY);
    // consent and map layers must remain
  }

  assert.equal(store.has(TOKEN_KEY), false);
  assert.equal(readCookieConsent(), "analytics");
  assert.equal(store.get("strelko_map_layers"), '{"keep":true}');
  assert.equal(store.get(COOKIE_CONSENT_KEY), "analytics");
}

await simulateLogout({ apiOk: true });
await simulateLogout({ apiOk: false });

writeCookieConsent("necessary");
store.set(TOKEN_KEY, "x");
try {
  throw new Error("fail");
} catch {
  /* */
} finally {
  store.delete(TOKEN_KEY);
}
assert.equal(readCookieConsent(), "necessary");
assert.equal(store.has(TOKEN_KEY), false);

console.log("verify-logout-consent: OK");
