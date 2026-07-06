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

export function StrikeMap({ lat, lon, radiusKm, strikes, refit = false }: StrikeMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hostRef = useRef<StrikeMapHost | null>(null);
  const strikesRef = useRef(strikes);
  strikesRef.current = strikes;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    hostRef.current?.destroy();
    hostRef.current = createStrikeMap(el, {
      lat,
      lon,
      radiusKm,
      strikes: strikesRef.current,
    });

    return () => {
      hostRef.current?.destroy();
      hostRef.current = null;
    };
  }, [lat, lon, radiusKm]);

  useEffect(() => {
    hostRef.current?.updateStrikes(strikes, { refit });
  }, [strikes, refit]);

  return <div ref={ref} id="strike-map" aria-label="Zemljevid udarov strel" />;
}
