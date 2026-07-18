/** Začasno stanje osnovnega predogleda za vrnitev po Stripe nakupu žetonov (cross-tab). */

import type {
  GeocodeResult,
  InsufficientTokensDetail,
  PreviewResult,
  PreviewScreen,
} from "../types";

const STORAGE_KEY = "strelko_preview_checkout_return_v1";
/** 2 uri — dovolj za Stripe Checkout, ne ostane večno. */
const TTL_MS = 2 * 60 * 60 * 1000;

export const PREVIEW_CHECKOUT_RETURN_PATH = "/pomoc-pri-zavarovalnici";

export interface PreviewCheckoutReturnPayload {
  v: 1;
  savedAt: number;
  preview: PreviewResult;
  previewScreen: "teaser" | "no-strikes";
  tokenNotice: InsufficientTokensDetail | null;
  selected: GeocodeResult;
  locationQuery: string;
  searchRadiusKm: number;
  searchDateFrom: string;
  searchDateTo: string;
}

function isPayload(value: unknown): value is PreviewCheckoutReturnPayload {
  if (!value || typeof value !== "object") return false;
  const o = value as PreviewCheckoutReturnPayload;
  if (o.v !== 1 || typeof o.savedAt !== "number") return false;
  if (o.previewScreen !== "teaser" && o.previewScreen !== "no-strikes") return false;
  if (!o.preview || typeof o.preview !== "object") return false;
  if (!o.selected || typeof o.selected.lat !== "number" || typeof o.selected.lon !== "number") {
    return false;
  }
  if (typeof o.searchRadiusKm !== "number") return false;
  if (typeof o.searchDateFrom !== "string" || typeof o.searchDateTo !== "string") return false;
  return true;
}

export function savePreviewCheckoutReturn(payload: Omit<PreviewCheckoutReturnPayload, "v" | "savedAt">): void {
  try {
    const full: PreviewCheckoutReturnPayload = {
      v: 1,
      savedAt: Date.now(),
      ...payload,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  } catch {
    /* private browsing / quota */
  }
}

export function peekPreviewCheckoutReturn(): PreviewCheckoutReturnPayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isPayload(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (Date.now() - parsed.savedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPreviewCheckoutReturn(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private browsing */
  }
}

export function consumePreviewCheckoutReturn(): PreviewCheckoutReturnPayload | null {
  const value = peekPreviewCheckoutReturn();
  if (value) clearPreviewCheckoutReturn();
  return value;
}

export type PreviewScreenNonNull = Exclude<PreviewScreen, null>;
