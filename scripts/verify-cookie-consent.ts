/**
 * Ciljni testi privolitve za Umami (brez Vitest).
 * Zagon: npx tsx scripts/verify-cookie-consent.ts
 */
import assert from "node:assert/strict";
import {
  COOKIE_CONSENT_KEY,
  cookieConsentLabelSl,
  hasCookieConsentChoice,
  isAnalyticsAllowed,
  parseCookieConsentRaw,
  readCookieConsent,
  writeCookieConsent,
} from "../src/lib/cookie-consent.ts";

const store = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => store.set(k, String(v)),
    removeItem: (k: string) => store.delete(k),
  },
});

store.clear();
assert.equal(readCookieConsent(), null);
assert.equal(hasCookieConsentChoice(null), false);
assert.equal(isAnalyticsAllowed(null), false);

assert.equal(parseCookieConsentRaw("1"), "analytics");
assert.equal(parseCookieConsentRaw("analytics"), "analytics");
assert.equal(parseCookieConsentRaw("necessary"), "necessary");
assert.equal(parseCookieConsentRaw("other"), null);

store.set(COOKIE_CONSENT_KEY, "1");
assert.equal(readCookieConsent(), "analytics");
assert.equal(isAnalyticsAllowed(readCookieConsent()), true);
assert.match(cookieConsentLabelSl(readCookieConsent()), /analitika/i);

writeCookieConsent("necessary");
assert.equal(store.get(COOKIE_CONSENT_KEY), "necessary");
assert.equal(isAnalyticsAllowed(readCookieConsent()), false);
assert.equal(hasCookieConsentChoice(readCookieConsent()), true);

writeCookieConsent("analytics");
assert.equal(store.get(COOKIE_CONSENT_KEY), "analytics");
assert.equal(isAnalyticsAllowed(readCookieConsent()), true);

console.log("verify-cookie-consent: OK");
