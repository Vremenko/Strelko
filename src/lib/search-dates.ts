import { formatSlDate } from "./dates";

/** Privzeto število koledarskih dni ob prvem obisku (zadnjih N dni, vključno z danes). */
export const SEARCH_PERIOD_DAYS = 14;

/**
 * Prvi uporabni celoten lokalni dan arhiva (Europe/Ljubljana).
 * Vir: min(ts_utc) v strele.udari — prvi udar 10. 3. 2026 zvečer (nepopoln dan);
 * prvi celoten lokalni dan je 11. 3. 2026 (enako kot map-embed Po meri).
 */
export const SEARCH_ARCHIVE_MIN_ISO = "2026-03-11";

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

/** Cena poizvedbe: ceil(koledarski dnevi / 10), največ 3 (usklajeno z backendom). */
export function queryTokenCost(fromIso: string, toIso: string): number {
  const days = inclusivePeriodDays(fromIso, toIso);
  if (days < 1) return 0;
  return Math.min(Math.ceil(days / 10), 3);
}

export function archiveMinIso(): string {
  return SEARCH_ARCHIVE_MIN_ISO;
}

export function clampToArchiveWindow(iso: string, today = todayIso()): string {
  const min = SEARCH_ARCHIVE_MIN_ISO;
  if (!iso || iso < min) return min;
  if (iso > today) return today;
  return iso;
}

/** Privzeto obdobje (zadnjih SEARCH_PERIOD_DAYS koledarskih dni, končni datum = danes). */
export function defaultSearchRange(): { from: string; to: string } {
  const to = todayIso();
  let from = addDays(to, -(SEARCH_PERIOD_DAYS - 1));
  if (from < SEARCH_ARCHIVE_MIN_ISO) from = SEARCH_ARCHIVE_MIN_ISO;
  return clampSearchRange({ from, to }, to);
}

/**
 * Najpoznejši koledarski `Do` glede na arhiv in danes (brez omejitve 30 dni).
 * Omejitev dolžine obdobja se preverja ob oddaji, ne v koledarju.
 */
export function maxEndDateForStart(_fromIso: string, today = todayIso()): string {
  return today;
}

export function clampSearchRange(
  range: { from: string; to: string },
  today = todayIso()
): { from: string; to: string } {
  let from = clampToArchiveWindow(range.from, today);
  let to = clampToArchiveWindow(range.to, today);
  if (from > to) {
    to = from;
  }
  return { from, to };
}

/** Ob spremembi `Od`: ohrani `Do`, razen če postane neveljaven glede na arhiv/vrstni red. */
export function adjustRangeFromStart(
  startIso: string,
  currentTo: string,
  today = todayIso()
): { from: string; to: string } {
  if (!startIso) return defaultSearchRange();
  const from = clampToArchiveWindow(startIso, today);
  let to = clampToArchiveWindow(currentTo, today);
  if (from > to) {
    to = from;
  }
  return { from, to };
}

/** Ob spremembi `Do`: ohrani `Od`, razen če postane neveljaven glede na arhiv/vrstni red. */
export function adjustRangeFromEnd(
  endIso: string,
  currentFrom: string,
  today = todayIso()
): { from: string; to: string } {
  if (!endIso) return defaultSearchRange();
  const from = clampToArchiveWindow(currentFrom, today);
  let to = clampToArchiveWindow(endIso, today);
  if (to < from) {
    to = from;
  }
  return { from, to };
}

/**
 * Programska validacija (enaka mejam kot StormAPI).
 * Vrne sporočilo o napaki ali prazen niz.
 */
export function validateSearchPeriod(
  fromIso: string,
  toIso: string,
  today = todayIso()
): string {
  if (!fromIso || !toIso) {
    return "Izberi veljavna datuma Od in Do.";
  }
  if (fromIso < SEARCH_ARCHIVE_MIN_ISO) {
    return "Datum Od ne sme biti pred 11. 3. 2026.";
  }
  if (toIso < SEARCH_ARCHIVE_MIN_ISO) {
    return "Datum Do ne sme biti pred 11. 3. 2026.";
  }
  if (toIso > today) return "Datum Do ne sme biti v prihodnosti.";
  if (fromIso > today) return "Datum Od ne sme biti v prihodnosti.";
  if (fromIso > toIso) return "Datum Od ne sme biti za datumom Do.";
  const n = inclusivePeriodDays(fromIso, toIso);
  if (n < 1) return "Obdobje mora obsegati najmanj 1 dan.";
  if (n > SEARCH_MAX_RANGE_CALENDAR_DAYS) {
    return "Izbrano obdobje je daljše od 30 dni. Izberite krajše obdobje.";
  }
  return "";
}

export function searchPeriodHint(): string {
  return "Izberite obdobje od 11. 3. 2026 naprej, največ 30 dni naenkrat.";
}

export function formatSearchDateLabel(iso: string): string {
  return formatSlDate(iso).toLocaleLowerCase("sl-SI");
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
