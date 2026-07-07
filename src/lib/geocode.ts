import type { GeocodeResult } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

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
