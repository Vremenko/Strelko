import type { GeocodeResult } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const SUGGEST_MIN_LENGTH = 3;
const SUGGEST_LIMIT = 5;

/** Produktni bbox (Slovenija + okolica) — usklajeno s StormAPI. */
const PRODUCT_BBOX = {
  minLat: 45.4,
  maxLat: 46.9,
  minLon: 13.35,
  maxLon: 16.63,
};

const PHOTON_BBOX = `${PRODUCT_BBOX.minLon},${PRODUCT_BBOX.minLat},${PRODUCT_BBOX.maxLon},${PRODUCT_BBOX.maxLat}`;

type PlaceKind = "settlement" | "street" | "other";

interface SuggestCandidate extends GeocodeResult {
  placeKind: PlaceKind;
}

function normalizeCoordinate(value: unknown): number {
  return typeof value === "number" ? value : Number(value);
}

function normalizeMatchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function placeHead(label: string): string {
  return label.split(",")[0]?.trim() || label;
}

function inProductBBox(lat: number, lon: number): boolean {
  return (
    lat >= PRODUCT_BBOX.minLat &&
    lat <= PRODUCT_BBOX.maxLat &&
    lon >= PRODUCT_BBOX.minLon &&
    lon <= PRODUCT_BBOX.maxLon
  );
}

function prefixRank(label: string, query: string): number {
  const q = normalizeMatchText(query);
  const head = normalizeMatchText(placeHead(label));
  if (head.startsWith(q)) return 0;
  const words = head.split(/[\s,-]+/).filter(Boolean);
  if (words.some((word) => word.startsWith(q))) return 1;
  if (head.includes(q)) return 2;
  const full = normalizeMatchText(label);
  if (full.includes(q)) return 3;
  return 9;
}

function kindRank(kind: PlaceKind): number {
  if (kind === "settlement") return 0;
  if (kind === "other") return 1;
  return 2;
}

function classifyApiLabel(label: string): PlaceKind {
  const head = placeHead(label);
  if (/\d/.test(head)) return "street";
  if (/\b(ulica|cesta|pot|trg|nas\.|številka)\b/i.test(label)) return "street";
  return "settlement";
}

function classifyPhotonPlace(props: Record<string, unknown>): PlaceKind {
  const osmKey = typeof props.osm_key === "string" ? props.osm_key : "";
  const osmValue = typeof props.osm_value === "string" ? props.osm_value : "";
  if (osmKey === "place") {
    if (["street", "road", "path", "track"].includes(osmValue)) return "street";
    return "settlement";
  }
  if (osmKey === "highway") return "street";
  if (["amenity", "building", "shop", "tourism", "leisure"].includes(osmKey)) return "other";
  return "other";
}

function resultKey(result: GeocodeResult): string {
  return `${result.lat.toFixed(4)}:${result.lon.toFixed(4)}:${normalizeMatchText(result.label)}`;
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

function formatPhotonLabel(props: Record<string, unknown>): string {
  const name = typeof props.name === "string" ? props.name.trim() : "";
  if (!name) return "Lokacija";

  const parts: string[] = [name];
  const locality =
    (typeof props.city === "string" && props.city.trim()) ||
    (typeof props.county === "string" && props.county.trim()) ||
    (typeof props.state === "string" && props.state.trim()) ||
    "";
  if (locality && locality !== name && !name.startsWith(`${locality} `)) {
    parts.push(locality);
  }

  const country = props.country;
  if (country === "Slovenija" || country === "Slovenia" || props.countrycode === "SI") {
    parts.push("Slovenija");
  } else if (typeof country === "string" && country.trim()) {
    parts.push(country.trim());
  }

  return parts.join(", ");
}

async function fetchApiSuggestions(query: string, limit: number): Promise<SuggestCandidate[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const res = await fetch(`${API_BASE}/geocode/search?${params}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return [];

  const items =
    (data as { results?: { label?: string; name?: string; lat: unknown; lon: unknown }[] })
      .results || [];
  return items
    .map((item) => normalizeGeocodeResult(item))
    .filter((item): item is GeocodeResult => item !== null)
    .map((item) => ({ ...item, placeKind: classifyApiLabel(item.label) }));
}

async function fetchPhotonSuggestions(query: string, limit: number): Promise<SuggestCandidate[]> {
  const photonLimit = query.length <= 3 ? 30 : Math.max(limit * 2, 12);
  const params = new URLSearchParams({
    q: query,
    limit: String(photonLimit),
    bbox: PHOTON_BBOX,
  });
  const res = await fetch(`https://photon.komoot.io/api/?${params}`);
  const data = (await res.json().catch(() => ({}))) as {
    features?: {
      geometry?: { coordinates?: [number, number] };
      properties?: Record<string, unknown>;
    }[];
  };
  if (!res.ok || !Array.isArray(data.features)) return [];

  const out: SuggestCandidate[] = [];
  for (const feature of data.features) {
    const coords = feature.geometry?.coordinates;
    const props = feature.properties;
    if (!coords || !props) continue;

    const [lon, lat] = coords;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (props.countrycode !== "SI" && props.country !== "Slovenija") continue;
    if (!inProductBBox(lat, lon)) continue;

    const label = formatPhotonLabel(props);
    out.push({ label, lat, lon, placeKind: classifyPhotonPlace(props) });
  }
  return out;
}

function rankSuggestions(results: SuggestCandidate[], query: string): GeocodeResult[] {
  const q = query.trim();
  const ranked = results
    .map((result, index) => ({
      result,
      index,
      rank: prefixRank(result.label, q),
      kind: kindRank(result.placeKind),
    }))
    .filter((entry) => entry.rank <= 3)
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.kind - b.kind ||
        a.index - b.index
    );

  const settlements = ranked.filter((entry) => entry.result.placeKind === "settlement");
  const pool = settlements.length > 0 ? settlements : ranked.filter((entry) => entry.result.placeKind !== "street");

  const startsWithMatches = pool.filter((entry) => entry.rank === 0);
  const wordStartMatches = pool.filter((entry) => entry.rank === 1);
  const picked = (
    startsWithMatches.length > 0
      ? startsWithMatches
      : wordStartMatches.length > 0
        ? wordStartMatches
        : pool.filter((entry) => entry.rank <= 2)
  ).slice(0, SUGGEST_LIMIT);

  return picked.map((entry) => ({
    label: entry.result.label,
    lat: entry.result.lat,
    lon: entry.result.lon,
  }));
}

function mergeSuggestions(apiResults: SuggestCandidate[], photonResults: SuggestCandidate[]): SuggestCandidate[] {
  const merged: SuggestCandidate[] = [];
  const seenCoords = new Set<string>();
  const seenNames = new Map<string, SuggestCandidate>();

  for (const result of [...apiResults, ...photonResults]) {
    const nameKey = normalizeMatchText(placeHead(result.label));
    const existingByName = seenNames.get(nameKey);
    if (
      !existingByName ||
      kindRank(result.placeKind) < kindRank(existingByName.placeKind) ||
      (kindRank(result.placeKind) === kindRank(existingByName.placeKind) &&
        result.label.length < existingByName.label.length)
    ) {
      seenNames.set(nameKey, result);
    }
  }

  for (const result of seenNames.values()) {
    const key = resultKey(result);
    if (seenCoords.has(key)) continue;
    seenCoords.add(key);
    merged.push(result);
  }
  return merged;
}

/** Predlogi za autocomplete — ne vrže napake, vrne [] ob praznem zadetku. */
export async function geocodeSuggest(query: string): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < SUGGEST_MIN_LENGTH) return [];

  const [apiResults, photonResults] = await Promise.all([
    fetchApiSuggestions(q, SUGGEST_LIMIT),
    fetchPhotonSuggestions(q, SUGGEST_LIMIT),
  ]);

  return rankSuggestions(mergeSuggestions(apiResults, photonResults), q);
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
