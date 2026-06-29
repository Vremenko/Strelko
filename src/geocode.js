const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

function compactDisplayName(displayName) {
  const parts = String(displayName)
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return displayName;
  const filtered = parts.filter((p) => !/^\d{4}$/.test(p));
  if (filtered.length >= 2 && filtered[filtered.length - 1] === "Slovenija") {
    return filtered.join(", ");
  }
  return filtered.slice(0, 3).join(", ");
}

/** Krajši prikaz: ulica/kraj + hišna št. (prvi del pred vejico). */
export function formatPlaceShort(label) {
  if (!label) return "";
  return String(label).split(",")[0].trim();
}

export async function geocodeAddress(query) {
  const params = new URLSearchParams({
    q: query,
    limit: "5",
  });
  const res = await fetch(`${API_BASE}/geocode/search?${params}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.detail === "string" ? data.detail : "Geokodiranje ni uspelo."
    );
  }
  const items = data.results || [];
  if (!items.length) {
    throw new Error("Lokacija ni bila najdena. Poskusite z drugim naslovom.");
  }
  return items.map((r) => ({
    label: r.label || r.name,
    lat: r.lat,
    lon: r.lon,
  }));
}

export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: "json",
    addressdetails: "1",
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data?.address) {
    return compactDisplayName(data.display_name || "");
  }
  return compactDisplayName(data.display_name || "") || null;
}
