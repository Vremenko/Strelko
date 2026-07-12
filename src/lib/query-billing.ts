import { tokenCountLabel } from "./ob-skodi-tokens";
import type { InsufficientTokensDetail, QueryQuoteOut } from "../types";

export type { InsufficientTokensDetail };

export function parseInsufficientTokensDetail(data: unknown): InsufficientTokensDetail | null {
  if (!data || typeof data !== "object") return null;
  const detail = (data as { detail?: unknown }).detail;
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) return null;
  const row = detail as Record<string, unknown>;
  const required = row.required_tokens;
  const available = row.available_tokens;
  if (typeof required !== "number" || typeof available !== "number") return null;
  return {
    message: typeof row.message === "string" ? row.message : undefined,
    required_tokens: required,
    available_tokens: available,
  };
}

export function queryInsufficientHintMessage(cost: number, available: number): string {
  return `Poizvedba zahteva ${tokenCountLabel(cost, "accusative")}, na voljo pa imate ${tokenCountLabel(available)}. Prikazan bo osnovni predogled.`;
}

export function queryCostHintFromQuote(
  quote: QueryQuoteOut | null,
  available: number
): string | null {
  if (!quote) return null;
  if (quote.query_tokens_cost > 0 && available < quote.query_tokens_cost) {
    return queryInsufficientHintMessage(quote.query_tokens_cost, available);
  }
  return quote.query_cost_hint;
}

export function querySubmitButtonLabelFromQuote(
  quote: QueryQuoteOut | null,
  available: number,
  loggedIn: boolean,
  guestLabel: string,
  fallbackLabel: string,
  quoteReady = true
): string {
  if (!loggedIn) return guestLabel;
  if (!quoteReady || !quote) return fallbackLabel;
  if (quote.query_tokens_cost > 0 && available < quote.query_tokens_cost) {
    return "Prikaži osnovni predogled";
  }
  return quote.query_button_label;
}

export function previewUnlockTokenRequirementMessage(requiredTokens: number): string {
  return `Za odklep tega pregleda potrebujete ${tokenCountLabel(requiredTokens, "accusative")}.`;
}

export function pdfDownloadDisabled(pdfTokensCost: number, available: number): boolean {
  return pdfTokensCost > 0 && available < pdfTokensCost;
}
