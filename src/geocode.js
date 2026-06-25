const NOMINATIM = "https://nominatim.openstreetmap.org/search";

export async function geocodeAddress(query) {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "5",
    countrycodes: "si",
    addressdetails: "1",
  });
  const res = await fetch(`${NOMINATIM}?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Geokodiranje ni uspelo.");
  const data = await res.json();
  if (!data.length) throw new Error("Lokacija ni bila najdena. Poskusite z drugim naslovom.");
  return data.map((r) => ({
    label: r.display_name,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
  }));
}

export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: "json",
  });
  const res = await fetch(`${NOMINATIM}/reverse?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.display_name || null;
}
