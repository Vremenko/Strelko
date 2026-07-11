import { tokenCountLabel, tokenWord } from "./ob-skodi-tokens";
import type { InsufficientTokensDetail } from "../types";

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

export function queryCostHintMessage(cost: number, available: number): string | null {
  if (cost < 1) return null;
  if (available >= cost) {
    return `Nova poizvedba bo porabila ${tokenCountLabel(cost, "accusative")}. Na voljo imate ${tokenCountLabel(available)}.`;
  }
  return `Poizvedba zahteva ${tokenCountLabel(cost, "accusative")}, na voljo pa imate ${tokenCountLabel(available)}. Prikazan bo osnovni predogled.`;
}

export function querySubmitButtonLabel(
  cost: number,
  available: number,
  loggedIn: boolean,
  guestLabel: string
): string {
  if (!loggedIn) return guestLabel;
  if (cost < 1) return "Preveri";
  if (available >= cost) {
    return `Preveri – ${cost} ${tokenWord(cost, "accusative")}`;
  }
  return "Prikaži osnovni predogled";
}

export function previewInsufficientTokensNotice(required: number, available: number): string {
  return `Za celoten pregled potrebujete ${tokenCountLabel(required, "accusative")}, na voljo pa imate ${tokenCountLabel(available)}. Zato je prikazan osnovni predogled.`;
}

/** Kratko pojasnilo pred plačljivim PDF-jem (backend odloča o ceni). */
export function pdfCostHintMessage(pdfTokensCost: number, available: number): string | null {
  if (pdfTokensCost <= 0) return null;
  if (available >= pdfTokensCost) {
    return `Izdelava PDF-poročila porabi 1 žeton. Na voljo imate ${tokenCountLabel(available)}.`;
  }
  return "Za izdelavo PDF-poročila potrebujete 1 žeton.";
}

export function pdfDownloadDisabled(pdfTokensCost: number, available: number): boolean {
  return pdfTokensCost > 0 && available < pdfTokensCost;
}
