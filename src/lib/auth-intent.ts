/** Shranjevanje namena prijave, checkout paketa in povratne poti (sessionStorage). */

const AUTH_RETURN_KEY = "strelko_auth_return";
const CHECKOUT_PLAN_KEY = "strelko_checkout_plan";

export type CheckoutIntent = "zetoni" | "narocnina";
export type CheckoutPlanId = "ob_skodi" | "podpornik";

export function checkoutPlanForTab(tab: CheckoutIntent): CheckoutPlanId {
  return tab === "zetoni" ? "ob_skodi" : "podpornik";
}

export function setAuthReturn(path: string): void {
  try {
    sessionStorage.setItem(AUTH_RETURN_KEY, path);
  } catch {
    /* private browsing */
  }
}

export function consumeAuthReturn(): string | null {
  try {
    const value = sessionStorage.getItem(AUTH_RETURN_KEY);
    if (value) sessionStorage.removeItem(AUTH_RETURN_KEY);
    return value;
  } catch {
    return null;
  }
}

export function setCheckoutPlanId(planId: CheckoutPlanId): void {
  try {
    sessionStorage.setItem(CHECKOUT_PLAN_KEY, planId);
  } catch {
    /* private browsing */
  }
}

export function peekCheckoutPlanId(): CheckoutPlanId | null {
  try {
    const value = sessionStorage.getItem(CHECKOUT_PLAN_KEY);
    if (value === "ob_skodi" || value === "podpornik") return value;
    return null;
  } catch {
    return null;
  }
}

export function consumeCheckoutPlanId(): CheckoutPlanId | null {
  try {
    const value = sessionStorage.getItem(CHECKOUT_PLAN_KEY);
    if (value) sessionStorage.removeItem(CHECKOUT_PLAN_KEY);
    if (value === "ob_skodi" || value === "podpornik") return value;
    return null;
  } catch {
    return null;
  }
}

export function clearCheckoutPlanId(): void {
  try {
    sessionStorage.removeItem(CHECKOUT_PLAN_KEY);
  } catch {
    /* private browsing */
  }
}

export function portalTabPath(
  tab: CheckoutIntent | "pregled" | "poizvedbe" | "narocnina" | "zetoni" | "racuni"
): string {
  const normalized =
    tab === "zetoni" ? "pregled" : tab === "racuni" ? "narocnina" : tab;
  return `/moj-strelko?tab=${normalized}`;
}
