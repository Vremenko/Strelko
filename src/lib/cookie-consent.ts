/** Privolitev za analitiko Umami (localStorage `strelko_cookie_consent`). */

export const COOKIE_CONSENT_KEY = "strelko_cookie_consent";

export type CookieConsentValue = "necessary" | "analytics";

/** Stara vrednost `"1"` pomeni dovoljeno analitiko. */
const LEGACY_ANALYTICS = "1";

export function parseCookieConsentRaw(raw: string | null): CookieConsentValue | null {
  if (raw === "analytics" || raw === LEGACY_ANALYTICS) return "analytics";
  if (raw === "necessary") return "necessary";
  return null;
}

export function readCookieConsent(): CookieConsentValue | null {
  try {
    return parseCookieConsentRaw(localStorage.getItem(COOKIE_CONSENT_KEY));
  } catch {
    return null;
  }
}

export function writeCookieConsent(value: CookieConsentValue): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, value);
  } catch {
    /* private browsing / quota */
  }
}

export function isAnalyticsAllowed(consent: CookieConsentValue | null): boolean {
  return consent === "analytics";
}

export function hasCookieConsentChoice(consent: CookieConsentValue | null): boolean {
  return consent === "necessary" || consent === "analytics";
}

export function cookieConsentLabelSl(consent: CookieConsentValue | null): string {
  if (consent === "analytics") return "Dovoljena analitika (Umami)";
  if (consent === "necessary") return "Samo nujno";
  return "Izbira še ni shranjena";
}
