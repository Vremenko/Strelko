import { clampObSkodiQuantity } from "./ob-skodi-tokens";

const AUTH_RETURN_KEY = "strelko_auth_return";
const CHECKOUT_PLAN_KEY = "strelko_checkout_plan";
const CHECKOUT_QUANTITY_KEY = "strelko_checkout_quantity";

export const CENIK_RETURN_PATH = "/cenik";

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

export function peekAuthReturn(): string | null {
  try {
    return sessionStorage.getItem(AUTH_RETURN_KEY);
  } catch {
    return null;
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

export function clearAuthReturn(): void {
  try {
    sessionStorage.removeItem(AUTH_RETURN_KEY);
  } catch {
    /* private browsing */
  }
}

export function clearCheckoutPlanId(): void {
  try {
    sessionStorage.removeItem(CHECKOUT_PLAN_KEY);
  } catch {
    /* private browsing */
  }
}

export function setCheckoutQuantity(quantity: number): void {
  try {
    sessionStorage.setItem(
      CHECKOUT_QUANTITY_KEY,
      String(clampObSkodiQuantity(quantity))
    );
  } catch {
    /* private browsing */
  }
}

export function peekCheckoutQuantity(): number | null {
  try {
    const value = sessionStorage.getItem(CHECKOUT_QUANTITY_KEY);
    if (!value) return null;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function clearCheckoutQuantity(): void {
  try {
    sessionStorage.removeItem(CHECKOUT_QUANTITY_KEY);
  } catch {
    /* private browsing */
  }
}

export function clearCheckoutIntent(): void {
  clearCheckoutPlanId();
  clearCheckoutQuantity();
}

export function clearAuthCheckoutIntent(): void {
  clearAuthReturn();
  clearCheckoutIntent();
}

export function isCenikAuthReturn(path: string | null): boolean {
  if (!path) return false;
  return path === CENIK_RETURN_PATH || path.startsWith(`${CENIK_RETURN_PATH}?`);
}

export function portalTabPath(
  tab: CheckoutIntent | "pregled" | "poizvedbe" | "narocnina" | "zetoni" | "racuni"
): string {
  const normalized =
    tab === "zetoni" ? "pregled" : tab === "racuni" ? "narocnina" : tab;
  return `/moj-strelko?tab=${normalized}`;
}
