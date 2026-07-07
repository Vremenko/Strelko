import { formatSlDate } from "./dates";

/** Privzeto število koledarskih dni ob prvem obisku (zadnjih N dni, vključno z danes). */
export const SEARCH_PERIOD_DAYS = 14;
/** Najstarejše dovoljeno zgodovinsko okno (koledarski dnevi, vključno z danes). */
export const SEARCH_HISTORY_CALENDAR_DAYS = 90;
/** Največja dolžina posameznega iskanja (koledarski dnevi, vključno). */
export const SEARCH_MAX_RANGE_CALENDAR_DAYS = 30;
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

export function inclusivePeriodDays(fromIso: string, toIso: string): number {
  if (!fromIso || !toIso || fromIso > toIso) return 0;
  const start = new Date(`${fromIso}T12:00:00`);
  const end = new Date(`${toIso}T12:00:00`);
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
  return diff + 1;
}

/** Najzgodnejši dovoljeni datum v zadnjih SEARCH_HISTORY_CALENDAR_DAYS koledarskih dneh. */
export function rollingWindowMin(today = todayIso()): string {
  return addDays(today, -(SEARCH_HISTORY_CALENDAR_DAYS - 1));
}

export function clampToRollingWindow(iso: string, today = todayIso()): string {
  const min = rollingWindowMin(today);
  if (iso < min) return min;
  if (iso > today) return today;
  return iso;
}

/** Privzeto obdobje (zadnjih SEARCH_PERIOD_DAYS koledarskih dni, končni datum = danes). */
export function defaultSearchRange(): { from: string; to: string } {
  const to = todayIso();
  return { from: addDays(to, -(SEARCH_PERIOD_DAYS - 1)), to };
}

/** Najpoznejši dovoljeni `Do` glede na `Od` (največ 30 vključujočih datumov). */
export function maxEndDateForStart(fromIso: string, today = todayIso()): string {
  const maxTo = addDays(fromIso, SEARCH_MAX_RANGE_CALENDAR_DAYS - 1);
  return maxTo > today ? today : maxTo;
}

function enforceMaxSpan(
  from: string,
  to: string,
  today = todayIso()
): { from: string; to: string } {
  if (inclusivePeriodDays(from, to) <= SEARCH_MAX_RANGE_CALENDAR_DAYS) {
    return { from, to };
  }
  return { from, to: maxEndDateForStart(from, today) };
}

export function clampSearchRange(
  range: { from: string; to: string },
  today = todayIso()
): { from: string; to: string } {
  let from = clampToRollingWindow(range.from, today);
  let to = clampToRollingWindow(range.to, today);
  if (from > to) {
    to = from;
  }
  return enforceMaxSpan(from, to, today);
}

/** Ob spremembi `Od`: `Do` se prilagodi, če je pred novim `Od` ali če presega max 30 dni. */
export function adjustRangeFromStart(
  startIso: string,
  currentTo: string,
  today = todayIso()
): { from: string; to: string } {
  if (!startIso) return defaultSearchRange();
  const from = clampToRollingWindow(startIso, today);
  let to = clampToRollingWindow(currentTo, today);
  if (from > to) {
    to = from;
  }
  const cappedMaxTo = maxEndDateForStart(from, today);
  if (to > cappedMaxTo) {
    to = cappedMaxTo;
  }
  return { from, to };
}

/** Ob spremembi `Do`: `Od` ostane nespremenjen; `Do` se omeji na [Od, Od+29]. */
export function adjustRangeFromEnd(
  endIso: string,
  currentFrom: string,
  today = todayIso()
): { from: string; to: string } {
  if (!endIso) return defaultSearchRange();
  const from = currentFrom;
  let to = clampToRollingWindow(endIso, today);
  if (to < from) {
    to = from;
  }
  const cappedMaxTo = maxEndDateForStart(from, today);
  if (to > cappedMaxTo) {
    to = cappedMaxTo;
  }
  return { from, to };
}

export function searchPeriodHint(): string {
  return `Izberite začetni datum znotraj zadnjih ${SEARCH_HISTORY_CALENDAR_DAYS} dni. Končni datum je lahko največ ${SEARCH_MAX_RANGE_CALENDAR_DAYS} koledarskih dni od začetnega datuma.`;
}

export function formatSearchDateLabel(iso: string): string {
  return formatSlDate(iso);
}

export interface PreviewRequestCore {
  lat: number;
  lon: number;
  radius_km: number;
  label: string;
}

/** Payload za `/strelko/preview` — izbrani date_from in date_to. */
export function buildPreviewRequestBody(
  params: PreviewRequestCore & { date_from: string; date_to: string }
): PreviewRequestCore & { date_from: string; date_to: string } {
  const today = todayIso();
  const range = clampSearchRange(
    { from: params.date_from, to: params.date_to },
    today
  );

  return {
    lat: params.lat,
    lon: params.lon,
    radius_km: params.radius_km,
    label: params.label,
    date_from: range.from,
    date_to: range.to,
  };
}
