import { useEffect, useRef } from "react";
import L from "leaflet";
import type { StrikePoint } from "../types";

const HOME_ICON = L.divIcon({
  className: "strelko-home-marker",
  html: `<svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="#3b82f6" stroke="#fff" stroke-width="2"/><circle cx="14" cy="14" r="4" fill="#fff"/></svg>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const STRIKE_ICON = L.divIcon({
  className: "strelko-strike-marker",
  html: `<svg width="18" height="18" viewBox="0 0 18 18"><path d="M10 1L4 11h4l-2 6 8-12H9l1-4z" fill="#fbbf24" stroke="#1e293b" stroke-width="0.5"/></svg>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface StrikeMapProps {
  lat: number;
  lon: number;
  radiusKm: number;
  strikes: StrikePoint[];
}

export function StrikeMap({ lat, lon, radiusKm, strikes }: StrikeMapProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const map = L.map(el, { zoomControl: true, scrollWheelZoom: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    L.marker([lat, lon], { icon: HOME_ICON })
      .addTo(map)
      .bindPopup("<strong>Vaša lokacija</strong>");

    L.circle([lat, lon], {
      radius: radiusKm * 1000,
      color: "#60a5fa",
      fillColor: "#3b82f6",
      fillOpacity: 0.08,
      weight: 2,
      dashArray: "6 4",
    }).addTo(map);

    const group = L.featureGroup();
    group.addLayer(L.marker([lat, lon]));

    strikes.forEach((s) => {
      const m = L.marker([s.lat, s.lon], { icon: STRIKE_ICON });
      const d = new Date(s.ts_utc);
      m.bindPopup(
        `<strong>Strela</strong><br>${d.toLocaleString("sl-SI")}<br>~${s.distance_km.toFixed(1)} km`
      );
      m.addTo(map);
      group.addLayer(m);
    });

    if (strikes.length) map.fitBounds(group.getBounds().pad(0.15));
    else map.setView([lat, lon], 11);

    return () => {
      map.remove();
    };
  }, [lat, lon, radiusKm, strikes]);

  return (
    <div className="strike-map-shell">
      <div ref={ref} className="strike-map-canvas" aria-label="Zemljevid udarov strel" />
    </div>
  );
}
