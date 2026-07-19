import type { Credits } from "../types";
import { isPodpornikActive } from "./portal-account";
import { STRELKO_OPEN_ACCESS } from "./season";
import { MAP_FREE_DAY_OPTIONS } from "./map-period-access";

/** sessionStorage: po odjavi / poteku Podpornika naj gated map-embed pokaže zaklep mreže. */
export const MAP_GRID_LOCK_FLASH_KEY = "strelko_show_grid_lock";

/** Ali uporabnik sme aktivirati mrežo 1 × 1 km (ista logika kot ArchiveMapEmbed). */
export function canAccessMapGrid(credits?: Credits | null): boolean {
  return STRELKO_OPEN_ACCESS || isPodpornikActive(credits);
}

/** Osnovni prikaz občin za Danes / 7 dni ostane brezplačen. */
export function isMapMunicipalityPeriodFree(days: number): boolean {
  return (MAP_FREE_DAY_OPTIONS as readonly number[]).includes(days);
}

export function markMapGridLockFlash(): void {
  try {
    sessionStorage.setItem(MAP_GRID_LOCK_FLASH_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function consumeMapGridLockFlash(): boolean {
  try {
    if (sessionStorage.getItem(MAP_GRID_LOCK_FLASH_KEY) !== "1") return false;
    sessionStorage.removeItem(MAP_GRID_LOCK_FLASH_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ob izgubi Podpornika (odjava / potek) — kaj narediti z zemljevidom.
 * Uporablja se v testih; runtime logika živi v map-embed + ArchiveMapEmbed.
 */
export function mapGridStateAfterAccessLoss(prevView: "obcine" | "grid"): {
  view: "obcine" | "grid";
  clearGridLayer: boolean;
  showLockedPanel: boolean;
} {
  if (prevView === "grid") {
    return { view: "obcine", clearGridLayer: true, showLockedPanel: true };
  }
  return { view: "obcine", clearGridLayer: false, showLockedPanel: false };
}
