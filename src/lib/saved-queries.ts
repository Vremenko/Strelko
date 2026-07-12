import type { DailyStrike, SavedQueryOut, SearchResult, StrikePoint } from "../types";
import { formatSlTime } from "./dates";

const SAVED_QUERY_ID_STORAGE_KEY = "strelko_saved_query_id_v1";

/** Stabilen ključ za isto lokacijo, radij in obdobje — ponovna izvedba ne porabi novih žetonov. */
export function buildIdempotencyKey(
  lat: number,
  lon: number,
  radiusKm: number,
  dateFrom: string,
  dateTo: string
): string {
  const rLat = lat.toFixed(6);
  const rLon = lon.toFixed(6);
  const rRadius = radiusKm.toFixed(1);
  return `sq-${rLat}-${rLon}-${rRadius}-${dateFrom}-${dateTo}`;
}

export function readSavedQueryIdFromStorage(): string | null {
  try {
    return sessionStorage.getItem(SAVED_QUERY_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeSavedQueryIdToStorage(id: string | null): void {
  try {
    if (id) {
      sessionStorage.setItem(SAVED_QUERY_ID_STORAGE_KEY, id);
    } else {
      sessionStorage.removeItem(SAVED_QUERY_ID_STORAGE_KEY);
    }
  } catch {
    /* private browsing / quota */
  }
}

function asDailyStrikeRows(value: unknown): DailyStrike[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (row): row is DailyStrike =>
      row != null &&
      typeof row === "object" &&
      typeof (row as DailyStrike).datum === "string" &&
      typeof (row as DailyStrike).stevilo_strel === "number"
  );
}

function asStrikePoints(value: unknown): StrikePoint[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const rows = value.filter(
    (row): row is StrikePoint =>
      row != null &&
      typeof row === "object" &&
      typeof (row as StrikePoint).lat === "number" &&
      typeof (row as StrikePoint).lon === "number"
  );
  return rows.length ? rows : undefined;
}

export function savedQueryOutToSearchResult(out: SavedQueryOut): SearchResult {
  const snapshot = out.result && typeof out.result === "object" ? out.result : {};
  const daily = asDailyStrikeRows(snapshot.daily);
  const totalStrikes =
    typeof snapshot.total_strikes === "number"
      ? snapshot.total_strikes
      : typeof out.total_strikes === "number"
        ? out.total_strikes
        : 0;

  return {
    lat: out.lat,
    lon: out.lon,
    radius_km: out.radius_km,
    location_label: out.label ?? (typeof snapshot.label === "string" ? snapshot.label : undefined),
    date_from: out.date_from,
    date_to: out.date_to,
    total_strikes: totalStrikes,
    daily,
    strikes: asStrikePoints(snapshot.strikes),
    credits_remaining: out.token_balance,
    period_days:
      typeof snapshot.period_days === "number" ? snapshot.period_days : undefined,
  };
}

export function formatQueryExecutedAt(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const datePart = new Intl.DateTimeFormat("sl-SI", { dateStyle: "medium" }).format(d);
    return `${datePart}, ${formatSlTime(iso)}`;
  } catch {
    return iso;
  }
}

/** npr. 1 strela, 2 streli, 4 strele, 10 strel */
export function strikeCountLabel(count: number): string {
  const n = Math.abs(Math.floor(count));
  let word: string;
  if (n === 1) word = "strela";
  else if (n === 2) word = "streli";
  else if (n === 3 || n === 4) word = "strele";
  else word = "strel";
  return `${n} ${word}`;
}
