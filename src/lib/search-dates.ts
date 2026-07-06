import { formatSlDate } from "./dates";

export const SEARCH_PERIOD_DAYS = 14;
export const HOURLY_PROFILE_MIN_STRIKES = 100;
export const DEFAULT_SEARCH_RADIUS_KM = 10;
export const SEARCH_RADIUS_OPTIONS = [10, 15, 20] as const;

export function todayIso(): string {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, delta: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + delta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function defaultSearchRange(): { from: string; to: string } {
  const to = todayIso();
  return { from: addDays(to, -(SEARCH_PERIOD_DAYS - 1)), to };
}

/** 14-day window ending on `endIso` (clamped to today). */
export function rangeFromEnd(endIso: string): { from: string; to: string } {
  const today = todayIso();
  let to = endIso > today ? today : endIso;
  return { from: addDays(to, -(SEARCH_PERIOD_DAYS - 1)), to };
}

/** 14-day window starting on `startIso` (clamped so end ≤ today). */
export function rangeFromStart(startIso: string): { from: string; to: string } {
  if (!startIso) return defaultSearchRange();
  let to = addDays(startIso, SEARCH_PERIOD_DAYS - 1);
  const today = todayIso();
  if (to > today) {
    to = today;
    startIso = addDays(to, -(SEARCH_PERIOD_DAYS - 1));
  }
  return { from: startIso, to };
}

export function formatSearchDateLabel(iso: string): string {
  return formatSlDate(iso);
}
