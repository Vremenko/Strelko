/** Ob škodi — cena, količina, DDV in besedila (cenik + portal). */

export const OB_SKODI_MIN_QUANTITY = 3;
export const OB_SKODI_TOKEN_PRICE_GROSS_EUR = 1.3;
export const OB_SKODI_VAT_RATE = 0.22;

/** Backend checkout sprejme izbrano količino žetonov (plan ob_skodi, polje quantity). */
export const OB_SKODI_VARIABLE_CHECKOUT_READY = true;

export interface ObSkodiOrderQuote {
  quantity: number;
  grossEur: number;
  netEur: number;
  vatEur: number;
  perTokenNetApproxEur: number;
}

export function clampObSkodiQuantity(raw: number): number {
  if (!Number.isFinite(raw)) return OB_SKODI_MIN_QUANTITY;
  return Math.max(OB_SKODI_MIN_QUANTITY, Math.floor(raw));
}

export function parseObSkodiQuantityInput(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) return OB_SKODI_MIN_QUANTITY;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed)) return OB_SKODI_MIN_QUANTITY;
  return clampObSkodiQuantity(parsed);
}

export function roundMoneyEur(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatEurSl(amount: number): string {
  return `${amount.toFixed(2).replace(".", ",")} €`;
}

export function calculateObSkodiOrder(quantity: number): ObSkodiOrderQuote {
  const qty = clampObSkodiQuantity(quantity);
  const grossEur = roundMoneyEur(qty * OB_SKODI_TOKEN_PRICE_GROSS_EUR);
  const netEur = roundMoneyEur(grossEur / (1 + OB_SKODI_VAT_RATE));
  const vatEur = roundMoneyEur(grossEur - netEur);
  const perTokenNetApproxEur = roundMoneyEur(OB_SKODI_TOKEN_PRICE_GROSS_EUR / (1 + OB_SKODI_VAT_RATE));
  return {
    quantity: qty,
    grossEur,
    netEur,
    vatEur,
    perTokenNetApproxEur,
  };
}

export type TokenCountForm = "nominative" | "accusative";

/** Poenostavljeno: 1 žeton, 2 žetona, 3–4 žetoni/žetone, 5+ žetonov. */
export function tokenWord(count: number, form: TokenCountForm = "nominative"): string {
  const n = Math.abs(Math.floor(count));
  if (n >= 5) return "žetonov";
  if (n === 4) return form === "accusative" ? "žetone" : "žetoni";
  if (n === 3) return form === "accusative" ? "žetone" : "žetoni";
  if (n === 2) return "žetona";
  if (n === 1) return "žeton";
  return "žetonov";
}

export function tokenCountLabel(count: number, form: TokenCountForm = "nominative"): string {
  const n = Math.abs(Math.floor(count));
  return `${n} ${tokenWord(n, form)}`;
}

/** npr. Skupaj porabljena 2 žetona. — za kartico porabe v portalu. */
export function tokensSpentSummaryLabel(count: number): string {
  const n = Math.abs(Math.floor(count));
  let participle: string;
  if (n === 1) participle = "porabljen";
  else if (n === 2) participle = "porabljena";
  else if (n >= 3 && n <= 4) participle = "porabljeni";
  else participle = "porabljenih";
  return `Skupaj ${participle} ${tokenCountLabel(n)}.`;
}

export function obSkodiPurchaseCtaLabel(quantity: number, purchaseAllowed: boolean): string {
  if (!purchaseAllowed) return "Nakup bo kmalu na voljo";
  const order = calculateObSkodiOrder(quantity);
  return `Kupite ${tokenCountLabel(order.quantity, "accusative")} za ${formatEurSl(order.grossEur)}`;
}

export function isObSkodiPurchaseAllowed(paymentsEnabled: boolean): boolean {
  return paymentsEnabled && OB_SKODI_VARIABLE_CHECKOUT_READY;
}

export const OB_SKODI_PER_TOKEN_GROSS_LABEL = formatEurSl(OB_SKODI_TOKEN_PRICE_GROSS_EUR);
export const OB_SKODI_PER_TOKEN_NET_APPROX_LABEL = formatEurSl(
  roundMoneyEur(OB_SKODI_TOKEN_PRICE_GROSS_EUR / (1 + OB_SKODI_VAT_RATE))
);
