import type { GeocodeResult } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";
const SUGGEST_MIN_LENGTH = 3;
const SUGGEST_LIMIT = 5;

/** Končna hišna številka na prvem delu naslova (pred vejico). */
const HOUSE_NUMBER_SUFFIX =
  /\s+\d+[a-zA-Z]?(?:\/\d+[a-zA-Z]?|-\d+[a-zA-Z]?)?\s*$/;

const STREET_IN_HEAD =
  /\b(ulica|ul\.|cesta|c\.|trg|pot|nas\.|nabrežje|obcestna|vrata|stez|steza|parkirišče)\b/i;

/** Naslovni del za iskanje predlogov — brez končne hišne številke. */
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

const PRODUCT_BBOX = {
  minLat: 45.4,
  maxLat: 46.9,
  minLon: 13.35,
  maxLon: 16.63,
};

const PHOTON_BBOX = `${PRODUCT_BBOX.minLon},${PRODUCT_BBOX.minLat},${PRODUCT_BBOX.maxLon},${PRODUCT_BBOX.maxLat}`;

type AddressKind = "house" | "street" | "settlement";

interface ParsedAddress {
  label: string;
  lat: number;
  lon: number;
  kind: AddressKind;
  street?: string;
  housenumber?: string;
  settlement: string;
  municipality: string;
  postcode?: string;
  placeValue?: string;
  sourceIndex: number;
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

function inProductBBox(lat: number, lon: number): boolean {
  return (
    lat >= PRODUCT_BBOX.minLat &&
    lat <= PRODUCT_BBOX.maxLat &&
    lon >= PRODUCT_BBOX.minLon &&
    lon <= PRODUCT_BBOX.maxLon
  );
}

function stripCountryPart(part: string): boolean {
  return /^slovenija$/i.test(part.trim());
}

function parseLabelParts(label: string): string[] {
  return label
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && !stripCountryPart(part));
}

function parseHeadNumber(head: string): { street?: string; housenumber?: string; place: string } {
  const trimmed = head.trim();
  const withNumber = trimmed.match(/^(.+?)\s+(\d+[a-zA-Z]?(?:\/\d+[a-zA-Z]?|-\d+[a-zA-Z]?)?)$/);
  if (withNumber) {
    const left = withNumber[1].trim();
    const number = withNumber[2].trim();
    if (STREET_IN_HEAD.test(left) || /\b(trg|ulica|cesta)\b/i.test(left)) {
      return { street: left, housenumber: number, place: left };
    }
    return { place: left, housenumber: number };
  }
  if (STREET_IN_HEAD.test(trimmed)) {
    return { street: trimmed, place: trimmed };
  }
  return { place: trimmed };
}

function isHamletStreetName(street: string): boolean {
  return !STREET_IN_HEAD.test(street);
}

function nameMatchesSearchPrefix(name: string, prefix: string): boolean {
  const normalizedName = normalizeMatchText(name);
  const normalizedPrefix = normalizeMatchText(prefix);
  if (!normalizedName || !normalizedPrefix) return false;
  if (normalizedName.startsWith(normalizedPrefix)) return true;
  return normalizedName
    .split(/[\s,-]+/)
    .filter(Boolean)
    .some((word) => word.startsWith(normalizedPrefix));
}

const postcodeMunicipalityCache = new Map<string, string>();

async function resolveMunicipalityByPostcode(
  postcode: string,
  lat: number,
  lon: number
): Promise<string | null> {
  const cacheKey = `${postcode}:${lat.toFixed(3)}:${lon.toFixed(3)}`;
  const cached = postcodeMunicipalityCache.get(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      q: postcode,
      lat: String(lat),
      lon: String(lon),
      limit: "5",
      bbox: PHOTON_BBOX,
    });
    const res = await fetch(`https://photon.komoot.io/api/?${params}`);
    const data = (await res.json().catch(() => ({}))) as {
      features?: { properties?: Record<string, unknown> }[];
    };
    if (!res.ok || !Array.isArray(data.features)) return null;

    for (const feature of data.features) {
      const props = feature.properties;
      if (!props || props.countrycode !== "SI") continue;
      if (props.osm_key !== "place" || props.osm_value !== "postcode") continue;
      const city = typeof props.city === "string" ? props.city.trim() : "";
      if (city) {
        postcodeMunicipalityCache.set(cacheKey, city);
        return city;
      }
    }
  } catch {
    return null;
  }
  return null;
}

async function enrichMunicipalityFromPostcode(
  entries: ParsedAddress[],
  municipalityHints: Map<string, string>
): Promise<ParsedAddress[]> {
  const out: ParsedAddress[] = [];
  for (const entry of entries) {
    if (entry.municipality) {
      out.push(entry);
      continue;
    }

    let municipality: string | null = null;
    if (entry.postcode) {
      municipality = await resolveMunicipalityByPostcode(
        entry.postcode,
        entry.lat,
        entry.lon
      );
    }
    if (!municipality) {
      municipality =
        municipalityHints.get(normalizeMatchText(entry.settlement)) ||
        (entry.street
          ? municipalityHints.get(normalizeMatchText(entry.street)) || null
          : null);
    }
    if (!municipality) continue;

    out.push({
      ...entry,
      municipality,
      label: formatSuggestionLabel({
        street: entry.street,
        housenumber: entry.housenumber,
        settlement: entry.settlement,
        municipality,
      }),
    });
  }
  return out;
}

function formatSuggestionLabel(parts: {
  street?: string;
  housenumber?: string;
  settlement: string;
  municipality: string;
}): string {
  const municipality = parts.municipality.trim();
  const settlement = parts.settlement.trim();
  const mun = `občina ${municipality}`;
  const settlementNorm = normalizeMatchText(settlement);
  const municipalityNorm = normalizeMatchText(municipality);

  if (parts.street) {
    const streetLine = parts.housenumber
      ? `${parts.street} ${parts.housenumber}`
      : parts.street;
    const streetNorm = normalizeMatchText(parts.street);
    if (
      settlement &&
      settlementNorm !== municipalityNorm &&
      settlementNorm !== streetNorm
    ) {
      return `${streetLine}, ${settlement}, ${mun}`;
    }
    if (settlement && settlementNorm === municipalityNorm) {
      return `${streetLine}, ${settlement}, ${mun}`;
    }
    return `${streetLine}, ${mun}`;
  }

  if (parts.housenumber) {
    return `${settlement} ${parts.housenumber}, ${mun}`;
  }

  return `${settlement}, ${mun}`;
}

function municipalityFromCityField(city: string): { settlement?: string; municipality?: string } {
  const trimmed = city.trim();
  if (!trimmed) return {};
  if (trimmed.includes(",")) {
    const [first, second] = trimmed.split(",").map((part) => part.trim());
    return { settlement: first, municipality: second };
  }
  return { settlement: trimmed };
}

function parseStormSuggestion(item: {
  label?: string;
  name?: string;
  lat: unknown;
  lon: unknown;
}, index: number): ParsedAddress | null {
  const lat = normalizeCoordinate(item.lat);
  const lon = normalizeCoordinate(item.lon);
  const label = (item.label || item.name || "").trim();
  const nameField = (item.name || "").trim();
  if (!label || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const parts = parseLabelParts(label);
  if (parts.length === 0) return null;

  const municipality = parts.length >= 2 ? parts[parts.length - 1] : parts[0];
  const head = parts[0];
  const parsedHead = parseHeadNumber(head);
  const nameLooksLikeSettlement =
    !!nameField &&
    normalizeMatchText(nameField) !== normalizeMatchText(parsedHead.place) &&
    normalizeMatchText(nameField) !== normalizeMatchText(municipality);

  let settlement = parsedHead.place;
  if (parsedHead.street) {
    if (nameField && nameLooksLikeSettlement) {
      settlement = nameField;
    } else if (parts.length >= 3) {
      settlement = parts[1];
    } else {
      settlement = nameField || municipality;
    }
  }

  if (!settlement) settlement = municipality;

  const kind: AddressKind = parsedHead.housenumber
    ? "house"
    : parsedHead.street
      ? "street"
      : "settlement";

  const structured = formatSuggestionLabel({
    street: parsedHead.street,
    housenumber: parsedHead.housenumber,
    settlement,
    municipality,
  });

  return {
    label: structured,
    lat,
    lon,
    kind,
    street: parsedHead.street,
    housenumber: parsedHead.housenumber,
    settlement,
    municipality,
    sourceIndex: index,
  };
}

function parsePhotonSuggestion(
  props: Record<string, unknown>,
  lat: number,
  lon: number,
  index: number,
  municipalityHint?: string
): ParsedAddress | null {
  const name = typeof props.name === "string" ? props.name.trim() : "";
  const street = typeof props.street === "string" ? props.street.trim() : "";
  const housenumber =
    typeof props.housenumber === "string" ? props.housenumber.trim() : "";
  const osmKey = typeof props.osm_key === "string" ? props.osm_key : "";
  const osmValue = typeof props.osm_value === "string" ? props.osm_value : "";
  const county = typeof props.county === "string" ? props.county.trim() : "";
  const postcode = typeof props.postcode === "string" ? props.postcode.trim() : "";
  const cityInfo = municipalityFromCityField(
    typeof props.city === "string" ? props.city : ""
  );

  let settlement = cityInfo.settlement || name;
  let municipality = cityInfo.municipality || county || municipalityHint || "";

  if (osmKey === "place") {
    settlement = name;
    if (!municipality && osmValue === "municipality") {
      municipality = name;
    }
    if (!municipality && typeof props.city === "string" && props.city.trim()) {
      municipality = props.city.trim();
    }
  }

  if (osmKey === "waterway" || osmKey === "natural") return null;
  if (osmKey === "highway" && osmValue === "primary" && name.includes(" - ")) return null;

  if (!settlement) return null;

  if (!municipality && !postcode && osmKey !== "place") {
    return null;
  }

  let kind: AddressKind = "settlement";
  let streetName: string | undefined = street || undefined;
  let number: string | undefined = housenumber || undefined;

  const hamletAddress =
    !!housenumber && !!street && isHamletStreetName(street);

  if (hamletAddress) {
    kind = "house";
    settlement = street;
    streetName = undefined;
    number = housenumber;
  } else if (housenumber && street) {
    kind = "house";
  } else if (housenumber && !street) {
    kind = "house";
    streetName = undefined;
  } else if (osmKey === "highway" || osmValue === "residential" || osmValue === "primary") {
    kind = "street";
    streetName = name || street;
    settlement = cityInfo.settlement || settlement;
  } else if (osmKey === "place") {
    kind = "settlement";
    streetName = undefined;
    number = undefined;
  }

  if (streetName && normalizeMatchText(streetName) === normalizeMatchText(settlement) && !number) {
    kind = "settlement";
    streetName = undefined;
  }

  const structured = municipality
    ? formatSuggestionLabel({
        street: streetName,
        housenumber: number || undefined,
        settlement,
        municipality,
      })
    : settlement;

  return {
    label: structured,
    lat,
    lon,
    kind,
    street: streetName,
    housenumber: number || undefined,
    settlement,
    municipality,
    postcode: postcode || undefined,
    placeValue: osmKey === "place" ? osmValue : undefined,
    sourceIndex: index + 1000,
  };
}

function parseInputHint(query: string): {
  street?: string;
  housenumber?: string;
  settlement?: string;
} {
  const trimmed = query.trim();
  const comma = trimmed.indexOf(",");
  const head = (comma === -1 ? trimmed : trimmed.slice(0, comma)).trim();
  const tail = comma === -1 ? "" : trimmed.slice(comma + 1).trim();
  const parsedHead = parseHeadNumber(head);
  return {
    street: parsedHead.street,
    housenumber: parsedHead.housenumber,
    settlement: tail || undefined,
  };
}

function placeTypeRank(placeValue?: string): number {
  switch (placeValue) {
    case "municipality":
    case "city":
    case "town":
    case "village":
    case "hamlet":
      return 0;
    case "suburb":
    case "locality":
      return 1;
    case "district":
      return 2;
    default:
      return 1;
  }
}

function queryLooksLikeStreet(query: string): boolean {
  const head = parseInputHint(query).street || query.trim();
  return STREET_IN_HEAD.test(head);
}

function specificityScore(entry: ParsedAddress): number {
  if (entry.kind === "house" && entry.housenumber) return 0;
  if (entry.kind === "street") return 1;
  return 2;
}

function prefixRank(entry: ParsedAddress, query: string): number {
  const comma = query.indexOf(",");
  const q = normalizeMatchText(comma === -1 ? query : query.slice(0, comma));
  const labelNorm = normalizeMatchText(entry.label);
  const headParts = [
    entry.street && entry.housenumber
      ? `${entry.street} ${entry.housenumber}`
      : entry.street,
    entry.housenumber && !entry.street ? `${entry.settlement} ${entry.housenumber}` : entry.settlement,
    entry.settlement,
    entry.municipality,
  ]
    .filter(Boolean)
    .map((part) => normalizeMatchText(String(part)));

  for (const head of headParts) {
    if (head.startsWith(q)) return 0;
  }

  for (const head of headParts) {
    const words = head.split(/[\s,-]+/).filter(Boolean);
    if (words.some((word) => word.startsWith(q))) return 1;
  }

  if (headParts.some((head) => head.includes(q))) return 2;
  if (labelNorm.includes(q)) return 3;
  return 9;
}

function matchesHouseNumber(entry: ParsedAddress, query: string): boolean {
  const hint = parseInputHint(query);
  if (!hint.housenumber || !entry.housenumber) return false;
  const wanted = normalizeMatchText(hint.housenumber);
  const got = normalizeMatchText(entry.housenumber);
  return got === wanted || got.startsWith(wanted) || wanted.startsWith(got);
}

function settlementNameRank(entry: ParsedAddress, query: string): number {
  const q = normalizeMatchText(query);
  const settlement = normalizeMatchText(entry.settlement);
  if (settlement === q) return 0;
  if (settlement.startsWith(q)) return settlement.length;
  return 999;
}

function rankSuggestions(results: ParsedAddress[], query: string): GeocodeResult[] {
  const hint = parseInputHint(query);
  const streetQuery = queryLooksLikeStreet(query);
  const ranked = results
    .map((result, index) => ({
      result,
      index,
      rank: prefixRank(result, query),
      specificity: specificityScore(result),
      exactNumber: matchesHouseNumber(result, query),
      settlementMatch:
        !!hint.settlement &&
        normalizeMatchText(result.settlement) === normalizeMatchText(hint.settlement),
      settlementRank: settlementNameRank(result, query),
      placeRank: placeTypeRank(result.placeValue),
    }))
    .filter((entry) => entry.rank <= 3)
    .sort((a, b) => {
      if (hint.housenumber) {
        if (a.exactNumber !== b.exactNumber) return a.exactNumber ? -1 : 1;
      }
      if (hint.settlement) {
        if (a.settlementMatch !== b.settlementMatch) return a.settlementMatch ? -1 : 1;
      }
      if (a.rank !== b.rank) return a.rank - b.rank;
      if (!streetQuery) {
        if (a.result.kind !== b.result.kind) {
          if (a.result.kind === "settlement" && b.result.kind === "street") return -1;
          if (a.result.kind === "street" && b.result.kind === "settlement") return 1;
        }
        if (a.placeRank !== b.placeRank) return a.placeRank - b.placeRank;
      }
      if (a.settlementRank !== b.settlementRank) return a.settlementRank - b.settlementRank;
      if (a.specificity !== b.specificity) return a.specificity - b.specificity;
      return a.index - b.index;
    });

  return ranked.slice(0, SUGGEST_LIMIT).map((entry) => ({
    label: entry.result.label,
    lat: entry.result.lat,
    lon: entry.result.lon,
  }));
}

function enrichMunicipalities(entries: ParsedAddress[]): ParsedAddress[] {
  const munBySettlement = new Map<string, string>();
  for (const entry of entries) {
    if (entry.municipality && entry.settlement) {
      munBySettlement.set(normalizeMatchText(entry.settlement), entry.municipality);
    }
  }

  return entries
    .map((entry) => {
      if (entry.municipality) return entry;
      const municipality = munBySettlement.get(normalizeMatchText(entry.settlement));
      if (!municipality) {
        return entry.postcode ? entry : null;
      }
      return {
        ...entry,
        municipality,
        label: formatSuggestionLabel({
          street: entry.street,
          housenumber: entry.housenumber,
          settlement: entry.settlement,
          municipality,
        }),
      };
    })
    .filter((entry): entry is ParsedAddress => entry !== null);
}

function settlementHintMap(apiResults: ParsedAddress[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of apiResults) {
    if (!item.settlement || !item.municipality) continue;
    const key = normalizeMatchText(item.settlement);
    if (!map.has(key)) {
      map.set(key, item.municipality);
    }
  }
  return map;
}

function dedupePhotonFeatures(
  features: {
    geometry?: { coordinates?: [number, number] };
    properties?: Record<string, unknown>;
  }[]
) {
  const byId = new Map<string, (typeof features)[number]>();
  for (const feature of features) {
    const props = feature.properties;
    if (!props) continue;
    const osmType = typeof props.osm_type === "string" ? props.osm_type : "";
    const osmId = props.osm_id;
    const key =
      osmId != null ? `${osmType}:${String(osmId)}` : JSON.stringify(props);
    if (!byId.has(key)) byId.set(key, feature);
  }
  return [...byId.values()];
}

async function fetchPhotonMerged(
  query: string,
  limit: number,
  withHighwayTag: boolean
) {
  const merged = await fetchPhotonRaw(query, limit);
  if (!withHighwayTag) return merged;

  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      bbox: PHOTON_BBOX,
      osm_tag: "highway",
    });
    const res = await fetch(`https://photon.komoot.io/api/?${params}`);
    const data = (await res.json().catch(() => ({}))) as {
      features?: Awaited<ReturnType<typeof fetchPhotonRaw>>;
    };
    if (res.ok && Array.isArray(data.features)) {
      return dedupePhotonFeatures([...merged, ...data.features]);
    }
  } catch {
    /* pusti osnovni zadetek */
  }
  return merged;
}

function expandedNamesFromFeatures(
  features: Awaited<ReturnType<typeof fetchPhotonRaw>>,
  searchQuery: string
): string[] {
  const names = new Set<string>();
  for (const feature of features) {
    const props = feature.properties;
    if (!props || props.countrycode !== "SI") continue;
    const name = typeof props.name === "string" ? props.name.trim() : "";
    if (
      name &&
      nameMatchesSearchPrefix(name, searchQuery) &&
      normalizeMatchText(name) !== normalizeMatchText(searchQuery) &&
      name.length > searchQuery.length
    ) {
      names.add(name);
    }
  }
  return [...names]
    .sort((a, b) => {
      const priorityDiff = expansionNamePriority(a) - expansionNamePriority(b);
      if (priorityDiff !== 0) return priorityDiff;
      const prefix = normalizeMatchText(searchQuery);
      const aStarts = normalizeMatchText(a).startsWith(prefix) ? 0 : 1;
      const bStarts = normalizeMatchText(b).startsWith(prefix) ? 0 : 1;
      if (aStarts !== bStarts) return aStarts - bStarts;
      return normalizeMatchText(a).length - normalizeMatchText(b).length;
    })
    .slice(0, 3);
}

function expansionNamePriority(name: string): number {
  return STREET_IN_HEAD.test(name) ? 0 : 1;
}

function isRelevantSuggestion(entry: ParsedAddress, query: string): boolean {
  if (prefixRank(entry, query) > 3) return false;

  if (!queryLooksLikeStreet(query) && entry.kind === "street") {
    const qHead = normalizeMatchText((query.split(",")[0] || query).trim());
    const streetNorm = normalizeMatchText(entry.street || "");
    if (
      streetNorm &&
      !streetNorm.startsWith(qHead) &&
      !nameMatchesSearchPrefix(entry.street || "", qHead)
    ) {
      return false;
    }
  }

  return true;
}

function dedupeSuggestions(results: ParsedAddress[]): ParsedAddress[] {
  const byLabel = new Map<string, ParsedAddress>();
  for (const result of results) {
    const key = normalizeMatchText(result.label);
    const existing = byLabel.get(key);
    if (
      !existing ||
      specificityScore(result) < specificityScore(existing) ||
      (specificityScore(result) === specificityScore(existing) &&
        result.sourceIndex < existing.sourceIndex)
    ) {
      byLabel.set(key, result);
    }
  }
  return [...byLabel.values()];
}

function filterStickySuggestions(previous: GeocodeResult[], query: string): GeocodeResult[] {
  const base = suggestQueryFromInput(query);
  const q = normalizeMatchText(base);
  return previous.filter((item) => {
    const norm = normalizeMatchText(item.label);
    return norm.includes(q) || q.includes(normalizeMatchText(item.label.split(",")[0] || ""));
  });
}

async function fetchApiSuggestions(query: string, limit: number): Promise<ParsedAddress[]> {
  const params = new URLSearchParams({ q: query, limit: String(Math.max(limit, 8)) });
  const res = await fetch(`${API_BASE}/geocode/search?${params}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return [];

  const items =
    (data as { results?: { label?: string; name?: string; lat: unknown; lon: unknown }[] })
      .results || [];
  return items
    .map((item, index) => parseStormSuggestion(item, index))
    .filter((item): item is ParsedAddress => item !== null);
}

function buildPhotonMunicipalityIndex(
  features: {
    properties?: Record<string, unknown>;
  }[]
): Map<string, string> {
  const map = new Map<string, string>();

  for (const feature of features) {
    const props = feature.properties;
    if (!props || props.countrycode !== "SI") continue;

    const cityInfo = municipalityFromCityField(
      typeof props.city === "string" ? props.city : ""
    );
    if (cityInfo.settlement && cityInfo.municipality) {
      map.set(normalizeMatchText(cityInfo.settlement), cityInfo.municipality);
    }

    const street = typeof props.street === "string" ? props.street.trim() : "";
    const name = typeof props.name === "string" ? props.name.trim() : "";
    if (cityInfo.municipality) {
      if (street) map.set(normalizeMatchText(street), cityInfo.municipality);
      if (name) map.set(normalizeMatchText(name), cityInfo.municipality);
    }

    if (props.osm_key === "place" && props.osm_value === "municipality" && name) {
      map.set(normalizeMatchText(name), name);
    }
  }

  return map;
}

async function fetchPhotonRaw(query: string, limit: number) {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
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
    return data.features;
  } catch {
    return [];
  }
}
function parsePhotonFeatures(
  features: {
    geometry?: { coordinates?: [number, number] };
    properties?: Record<string, unknown>;
  }[],
  municipalityHints: string[],
  municipalityBySettlement: Map<string, string>,
  photonMunicipalityIndex: Map<string, string>
): ParsedAddress[] {
  const out: ParsedAddress[] = [];
  for (const [index, feature] of features.entries()) {
    const coords = feature.geometry?.coordinates;
    const props = feature.properties;
    if (!coords || !props) continue;

    const [lon, lat] = coords;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (props.countrycode !== "SI" && props.country !== "Slovenija") continue;
    if (!inProductBBox(lat, lon)) continue;

    const featureName = typeof props.name === "string" ? props.name.trim() : "";
    const street = typeof props.street === "string" ? props.street.trim() : "";
    const cityField = typeof props.city === "string" ? props.city.split(",")[0].trim() : "";
    const settlementKey = normalizeMatchText(cityField || featureName);
    const hint =
      municipalityBySettlement.get(settlementKey) ||
      municipalityBySettlement.get(normalizeMatchText(cityField)) ||
      (street ? photonMunicipalityIndex.get(normalizeMatchText(street)) : undefined) ||
      (props.osm_key === "place"
        ? photonMunicipalityIndex.get(normalizeMatchText(featureName))
        : undefined) ||
      municipalityHints.find(Boolean);
    const parsed = parsePhotonSuggestion(props, lat, lon, index, hint);
    if (parsed) out.push(parsed);
  }
  return out;
}

async function collectSuggestions(searchQuery: string, rankQuery: string): Promise<GeocodeResult[]> {
  const searchQueries = [searchQuery];
  const prefetched = new Set<string>();
  let apiResults: ParsedAddress[] = [];

  for (const q of searchQueries) {
    const batch = await fetchApiSuggestions(q, SUGGEST_LIMIT);
    apiResults = dedupeSuggestions([...apiResults, ...batch]);
  }

  const municipalityBySettlement = settlementHintMap(apiResults);
  const municipalityHints = [...new Set(apiResults.map((item) => item.municipality).filter(Boolean))];

  let photonResults: ParsedAddress[] = [];
  const photonMunicipalityIndex = new Map<string, string>();
  const photonFeatureBatches: Awaited<ReturnType<typeof fetchPhotonRaw>>[] = [];

  const initialLimit = searchQuery.length <= 3 ? 50 : searchQuery.length <= 4 ? 40 : 15;
  const initialFeatures = await fetchPhotonMerged(
    searchQuery,
    initialLimit,
    searchQuery.length <= 4
  );
  photonFeatureBatches.push(initialFeatures);
  prefetched.add(searchQuery);

  if (searchQuery.length <= 4) {
    for (const name of expandedNamesFromFeatures(initialFeatures, searchQuery)) {
      if (!searchQueries.includes(name)) searchQueries.push(name);
    }
    for (const q of searchQueries) {
      const batch = await fetchApiSuggestions(q, SUGGEST_LIMIT);
      apiResults = dedupeSuggestions([...apiResults, ...batch]);
    }
  }

  for (const q of searchQueries) {
    if (prefetched.has(q)) continue;
    const photonLimit = q.length <= 3 ? 30 : Math.max(SUGGEST_LIMIT * 3, 15);
    photonFeatureBatches.push(await fetchPhotonRaw(q, photonLimit));
    prefetched.add(q);
  }

  for (const q of searchQueries) {
    if (/\d/.test(q) || q.includes(",")) continue;
    photonFeatureBatches.push(await fetchPhotonRaw(`${q} 1`, 8));
  }

  for (const batch of photonFeatureBatches) {
    for (const [key, value] of buildPhotonMunicipalityIndex(batch)) {
      if (!photonMunicipalityIndex.has(key)) photonMunicipalityIndex.set(key, value);
    }
  }

  for (const batch of photonFeatureBatches) {
    const parsed = parsePhotonFeatures(
      batch,
      municipalityHints,
      municipalityBySettlement,
      photonMunicipalityIndex
    );
    photonResults = dedupeSuggestions([...photonResults, ...parsed]);
  }

  for (const entry of photonResults) {
    if (entry.municipality || !entry.settlement) continue;
    const hinted = photonMunicipalityIndex.get(normalizeMatchText(entry.settlement));
    if (!hinted) continue;
    entry.municipality = hinted;
    entry.label = formatSuggestionLabel({
      street: entry.street,
      housenumber: entry.housenumber,
      settlement: entry.settlement,
      municipality: hinted,
    });
  }

  const merged = enrichMunicipalities(
    dedupeSuggestions([...apiResults, ...photonResults])
  );
  const withPostcode = await enrichMunicipalityFromPostcode(
    merged,
    photonMunicipalityIndex
  );
  const filtered = dedupeSuggestions(
    withPostcode.filter(
      (entry) => entry.municipality && isRelevantSuggestion(entry, rankQuery)
    )
  );
  return rankSuggestions(filtered, rankQuery);
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
  options?: { previous?: GeocodeResult[] }
): Promise<GeocodeResult[]> {
  const raw = query.trim();
  if (raw.length < SUGGEST_MIN_LENGTH) return [];

  let results = await collectSuggestions(raw, raw);

  if (results.length === 0) {
    const stripped = suggestQueryFromInput(raw);
    if (stripped !== raw && stripped.length >= SUGGEST_MIN_LENGTH) {
      results = await collectSuggestions(stripped, raw);
    }
  }

  if (
    results.length === 0 &&
    options?.previous?.length &&
    suggestQueryFromInput(raw) !== raw
  ) {
    const sticky = filterStickySuggestions(options.previous, raw);
    if (sticky.length > 0) results = sticky.slice(0, SUGGEST_LIMIT);
  }

  return results;
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
