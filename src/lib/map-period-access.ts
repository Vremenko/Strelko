export type MapPeriodMode = "range" | "day";

export const MAP_FREE_DAY_OPTIONS = [1, 7] as const;
export const MAP_LOCKED_DAY_OPTIONS = [14, 30, 90] as const;

export function isMapPeriodLocked(days: number, periodMode: MapPeriodMode): boolean {
  if (periodMode === "day") return true;
  return (MAP_LOCKED_DAY_OPTIONS as readonly number[]).includes(days);
}

export function isMapPeriodFree(days: number, periodMode: MapPeriodMode): boolean {
  return periodMode === "range" && (MAP_FREE_DAY_OPTIONS as readonly number[]).includes(days);
}
