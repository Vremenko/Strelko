import type { GeocodeResult } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const SUGGEST_MIN_LENGTH = 3;
const SUGGEST_LIMIT = 50;

/** Končna hišna številka na prvem delu naslova (pred vejico). */
const HOUSE_NUMBER_SUFFIX =
  /\s+\d+[a-zA-Z]?(?:\/\d+[a-zA-Z]?|-\d+[a-zA-Z]?)?\s*$/;

function normalizeMatchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ");
}

export function suggestQueryFromInput(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return trimmed;

  const withCountryHouse = trimmed.match(
    /^(.+?),\s*Slovenija(\s+\d+[a-zA-Z]?(?:\/\d+[a-zA-Z]?|-\d+[a-zA-Z]?)?)\s*$/i
  );
  if (withCountryHouse) {
    return withCountryHouse[1].trim();
  }

  const commaIndex = trimmed.indexOf(",");
  if (commaIndex === -1) {
    return trimmed.replace(HOUSE_NUMBER_SUFFIX, "").trim() || trimmed;
  }

  const head = trimmed.slice(0, commaIndex);
  const tail = trimmed.slice(commaIndex);
  const headWithoutNumber = head.replace(HOUSE_NUMBER_SUFFIX, "").trim();
  if (!headWithoutNumber) return trimmed;
  return `${headWithoutNumber}${tail}`.trim();
}

export function suggestBaseFromInput(query: string): string {
  return normalizeMatchText(suggestQueryFromInput(query));
}

export function isSameSuggestBase(a: string, b: string): boolean {
  return suggestBaseFromInput(a) === suggestBaseFromInput(b);
}

/** Poenostavi vnos za končno geokodiranje (npr. »Prigorica, Slovenija 101« → »Prigorica 101«). */
export function submitGeocodeQuery(query: string): string {
  const trimmed = query.trim();
  const match = trimmed.match(
    /^(.+?),\s*Slovenija(\s+\d+[a-zA-Z]?(?:\/\d+[a-zA-Z]?|-\d+[a-zA-Z]?)?)\s*$/i
  );
  if (match) {
    return `${match[1].trim()}${match[2]}`.replace(/\s+/g, " ").trim();
  }
  return trimmed;
}

function normalizeCoordinate(value: unknown): number {
  return typeof value === "number" ? value : Number(value);
}

export function isValidGeocodePlace(
  place: GeocodeResult | null | undefined
): place is GeocodeResult {
  return (
    !!place &&
    !!place.label.trim() &&
    Number.isFinite(place.lat) &&
    Number.isFinite(place.lon)
  );
}

function normalizeGeocodeResult(raw: {
  label?: string;
  name?: string;
  lat: unknown;
  lon: unknown;
}): GeocodeResult | null {
  const lat = normalizeCoordinate(raw.lat);
  const lon = normalizeCoordinate(raw.lon);
  const label = (raw.label || raw.name || "").trim();
  if (!label || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return null;
  }
  return { label, lat, lon };
}

/** Predlogi za autocomplete — ne vrže napake, vrne [] ob praznem zadetku. */
export async function geocodeSuggest(
  query: string,
  _options?: { previous?: GeocodeResult[] }
): Promise<GeocodeResult[]> {
  const raw = query.trim();
  if (raw.length < SUGGEST_MIN_LENGTH) return [];

  try {
    const params = new URLSearchParams({
      q: raw,
      limit: String(SUGGEST_LIMIT),
    });
    const res = await fetch(`${API_BASE}/geocode/suggest?${params}`);
    if (res.status === 422 || res.status === 503 || !res.ok) return [];

    const data = (await res.json().catch(() => null)) as {
      results?: { label?: string; name?: string; lat: unknown; lon: unknown }[];
    } | null;
    if (!data?.results || !Array.isArray(data.results)) return [];

    return data.results
      .map((item) => normalizeGeocodeResult(item))
      .filter((item): item is GeocodeResult => item !== null);
  } catch {
    return [];
  }
}

export async function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  const params = new URLSearchParams({ q: query, limit: "5" });
  const res = await fetch(`${API_BASE}/geocode/search?${params}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof (data as { detail?: string }).detail === "string"
        ? (data as { detail: string }).detail
        : "Geokodiranje ni uspelo."
    );
  }
  const items = (data as { results?: { label?: string; name?: string; lat: unknown; lon: unknown }[] })
    .results || [];
  const results = items
    .map((item) => normalizeGeocodeResult(item))
    .filter((item): item is GeocodeResult => item !== null);
  if (!results.length) {
    throw new Error("Lokacija ni bila najdena. Poskusite z drugim naslovom.");
  }
  return results;
}

/** Končno geokodiranje: najprej nespremenjen vnos, nato po potrebi submitGeocodeQuery fallback. */
export async function resolveGeocodePlace(query: string): Promise<GeocodeResult> {
  const trimmed = query.trim();
  const fallback = submitGeocodeQuery(trimmed);

  try {
    return (await geocodeAddress(query))[0];
  } catch (firstError) {
    if (fallback !== trimmed) {
      try {
        return (await geocodeAddress(fallback))[0];
      } catch {
        /* pokaži napako prvega poskusa */
      }
    }
    throw firstError;
  }
}
