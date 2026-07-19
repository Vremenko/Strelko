import type { Credits } from "../types";
import { isPodpornikActive } from "./portal-account";
import { STRELKO_OPEN_ACCESS } from "./season";
import { MAP_FREE_DAY_OPTIONS } from "./map-period-access";

/** sessionStorage: po odjavi / poteku Podpornika naj gated map-embed pokaže zaklep mreže. */
export const MAP_GRID_LOCK_FLASH_KEY = "strelko_show_grid_lock";

export type MapViewMode = "obcine" | "grid";

/** Ali uporabnik sme aktivirati mrežo 1 × 1 km (ista logika kot ArchiveMapEmbed). */
export function canAccessMapGrid(credits?: Credits | null): boolean {
  return STRELKO_OPEN_ACCESS || isPodpornikActive(credits);
}

/** gridLocked = viewMode === "grid" && !hasActiveSupporter */
export function isMapGridLocked(
  viewMode: MapViewMode,
  hasActiveSupporter: boolean
): boolean {
  return viewMode === "grid" && !hasActiveSupporter;
}

/**
 * Enotno pravilo zaklepa obdobja (brez sticky lockedReason iz mreže):
 * - Podpornik → odklenjeno
 * - mreža → vedno zaklenjeno
 * - občine → samo če ni Danes/7 dni
 */
export function isPeriodLocked(
  viewMode: MapViewMode,
  periodValue: string,
  hasActiveSupporter: boolean
): boolean {
  if (hasActiveSupporter) return false;
  if (viewMode === "grid") return true;
  if (periodValue === "1" || periodValue === "7") return false;
  return true;
}

/** Alias za spustni meni — isto pravilo. */
export function isMapPeriodOptionLocked(
  periodValue: string,
  viewMode: MapViewMode,
  hasActiveSupporter: boolean
): boolean {
  return isPeriodLocked(viewMode, periodValue, hasActiveSupporter);
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
 */
export function mapGridStateAfterAccessLoss(prevView: MapViewMode): {
  view: MapViewMode;
  clearGridLayer: boolean;
  showLockedPanel: boolean;
} {
  if (prevView === "grid") {
    return { view: "grid", clearGridLayer: true, showLockedPanel: true };
  }
  return { view: "obcine", clearGridLayer: false, showLockedPanel: false };
}

/**
 * Vrnitev iz zaklenjene mreže na občine.
 * periodValue: vrednost v selectu ("1"|"7"|"14"|…|"custom"), ne sticky razlog iz mreže.
 */
export function mapStateAfterLeavingLockedGrid(periodValue: string | number): {
  view: "obcine";
  hideGridLock: boolean;
  clearGridLockReason: boolean;
  showPeriodLock: boolean;
  reloadObcine: boolean;
  periodValue: string;
} {
  const value = String(periodValue);
  const locked = isPeriodLocked("obcine", value, false);
  return {
    view: "obcine",
    hideGridLock: true,
    clearGridLockReason: true,
    showPeriodLock: locked,
    reloadObcine: !locked,
    periodValue: value,
  };
}

/** Zapozneli dogodek zaklenjene mreže ne sme ponovno zakleniti občin. */
export function shouldApplyStaleGridLockEvent(
  currentView: MapViewMode,
  eventView: MapViewMode | undefined
): boolean {
  if (eventView != null && eventView !== currentView) return false;
  return currentView === "grid";
}
