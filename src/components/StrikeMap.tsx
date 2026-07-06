import { useEffect, useRef } from "react";
import { createStrikeMap, type StrikeMapHost } from "../lib/strike-map";
import type { StrikePoint } from "../types";

interface StrikeMapProps {
  lat: number;
  lon: number;
  radiusKm: number;
  strikes: StrikePoint[];
  refit?: boolean;
}

function safeDestroy(host: StrikeMapHost | null): void {
  if (!host) return;
  try {
    host.destroy();
  } catch {
    /* Leaflet may already have removed DOM nodes (StrictMode / remount) */
  }
}

export function StrikeMap({ lat, lon, radiusKm, strikes, refit = false }: StrikeMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hostRef = useRef<StrikeMapHost | null>(null);
  const strikesRef = useRef(strikes);
  strikesRef.current = strikes;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    safeDestroy(hostRef.current);
    hostRef.current = null;

    try {
      hostRef.current = createStrikeMap(el, {
        lat,
        lon,
        radiusKm,
        strikes: Array.isArray(strikesRef.current) ? strikesRef.current : [],
      });
    } catch (error) {
      console.error("StrikeMap init failed:", error);
    }

    return () => {
      safeDestroy(hostRef.current);
      hostRef.current = null;
    };
  }, [lat, lon, radiusKm]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    try {
      host.updateStrikes(Array.isArray(strikes) ? strikes : [], { refit });
    } catch (error) {
      console.error("StrikeMap updateStrikes failed:", error);
    }
  }, [strikes, refit]);

  return <div ref={ref} id="strike-map" aria-label="Zemljevid udarov strel" />;
}
