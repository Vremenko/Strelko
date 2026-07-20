import type { Map as LeafletMap } from "leaflet";

const MOBILE_HINT = "Premaknite zemljevid z dvema prstoma.";
const HINT_HIDE_MS = 1600;
const MOB_DRAG_HINT_PX = 3;
const PINCH_DIST_CHANGE = 0.02;
const MOBILE_HINT_STORAGE_KEY = "strele-map-two-finger-hint-shown";

/** Miška / sledilna ploščica — tudi na prenosniku z zaslonom na dotik. */
export function prefersDesktopMapPointer(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(any-pointer: fine)").matches;
}

export function prefersMobileMapPointer(): boolean {
  return !prefersDesktopMapPointer();
}

function mobileHintAlreadyShown(): boolean {
  try {
    return sessionStorage.getItem(MOBILE_HINT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markMobileHintShown(): void {
  try {
    sessionStorage.setItem(MOBILE_HINT_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

function createHintController(container: HTMLElement, message: string) {
  let hintTimer: ReturnType<typeof setTimeout> | null = null;
  let hintEl: HTMLDivElement | null = null;

  const hideHint = () => {
    if (hintTimer) {
      clearTimeout(hintTimer);
      hintTimer = null;
    }
    if (hintEl?.parentNode) {
      hintEl.parentNode.removeChild(hintEl);
    }
    hintEl = null;
  };

  const scheduleHintOnce = () => {
    if (!container.isConnected) return;
    if (mobileHintAlreadyShown()) return;
    markMobileHintShown();
    if (!hintEl) {
      hintEl = document.createElement("div");
      hintEl.className = "strele-map-wheel-hint";
      hintEl.setAttribute("aria-live", "polite");
      hintEl.textContent = message;
      container.appendChild(hintEl);
    }
    if (hintTimer) clearTimeout(hintTimer);
    hintTimer = setTimeout(hideHint, HINT_HIDE_MS);
  };

  return { hideHint, scheduleHintOnce };
}

function bindMobileGestures(map: LeafletMap, container: HTMLElement): () => void {
  try {
    map.dragging.disable();
  } catch {
    /* ignore */
  }
  try {
    map.scrollWheelZoom.disable();
  } catch {
    /* ignore */
  }
  try {
    map.touchZoom.enable();
  } catch {
    /* ignore */
  }

  const { hideHint, scheduleHintOnce } = createHintController(container, MOBILE_HINT);
  const mapContainer = map.getContainer();

  let singleActive = false;
  let startX = 0;
  let startY = 0;
  let multiActive = false;
  let midX = 0;
  let midY = 0;
  let multiStartDist = 0;
  let multiPinching = false;

  const touchMid = (t: TouchList) => ({
    x: (t[0].clientX + t[1].clientX) / 2,
    y: (t[0].clientY + t[1].clientY) / 2,
  });

  const touchDist = (t: TouchList) =>
    Math.hypot(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY);

  const beginMulti = (e: TouchEvent) => {
    hideHint();
    multiActive = true;
    singleActive = false;
    multiPinching = false;
    const mid = touchMid(e.touches);
    midX = mid.x;
    midY = mid.y;
    multiStartDist = touchDist(e.touches);
  };

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length >= 2) {
      beginMulti(e);
      return;
    }
    if (e.touches.length === 1 && !multiActive) {
      singleActive = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length >= 2) {
      if (!multiActive) beginMulti(e);
      const dist = touchDist(e.touches);
      const distChange =
        multiStartDist > 0 ? Math.abs(dist - multiStartDist) / multiStartDist : 0;
      if (distChange > PINCH_DIST_CHANGE) {
        multiPinching = true;
        return;
      }
      if (!multiPinching) {
        const mid = touchMid(e.touches);
        const dx = mid.x - midX;
        const dy = mid.y - midY;
        midX = mid.x;
        midY = mid.y;
        if (dx || dy) {
          e.preventDefault();
          map.panBy([-dx, -dy], { animate: false });
        }
      }
      return;
    }
    if (!singleActive || e.touches.length !== 1) return;
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    if (Math.hypot(x - startX, y - startY) > MOB_DRAG_HINT_PX) {
      scheduleHintOnce();
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (e.touches.length >= 2) {
      beginMulti(e);
      return;
    }
    if (e.touches.length === 1) {
      multiActive = false;
      multiPinching = false;
      singleActive = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      return;
    }
    singleActive = false;
    multiActive = false;
    multiPinching = false;
  };

  map.on("movestart", hideHint);
  map.on("zoomstart", hideHint);

  mapContainer.addEventListener("touchstart", onTouchStart, { passive: true });
  mapContainer.addEventListener("touchmove", onTouchMove, { passive: false });
  mapContainer.addEventListener("touchend", onTouchEnd, { passive: true });
  mapContainer.addEventListener("touchcancel", onTouchEnd, { passive: true });

  return () => {
    hideHint();
    map.off("movestart", hideHint);
    map.off("zoomstart", hideHint);
    mapContainer.removeEventListener("touchstart", onTouchStart);
    mapContainer.removeEventListener("touchmove", onTouchMove);
    mapContainer.removeEventListener("touchend", onTouchEnd);
    mapContainer.removeEventListener("touchcancel", onTouchEnd);
  };
}

/** Namizje: Leafletov vgrajeni scrollWheelZoom (brez lastnega wheel handlerja). */
function bindDesktopGestures(map: LeafletMap, _container: HTMLElement): () => void {
  try {
    map.dragging.enable();
  } catch {
    /* ignore */
  }
  try {
    map.scrollWheelZoom.enable();
  } catch {
    /* ignore */
  }
  try {
    map.touchZoom.disable();
  } catch {
    /* ignore */
  }

  return () => {
    try {
      map.scrollWheelZoom.disable();
    } catch {
      /* ignore */
    }
  };
}

/**
 * Namizje (fine pointer): kolešček/ploščica prek Leaflet scrollWheelZoom, vlečenje premika.
 * Telefon (coarse): en prst = stran, dva prsta = zemljevid; namig največ enkrat.
 */
export function bindStreleMapZoomGestures(map: LeafletMap, container: HTMLElement): () => void {
  if (prefersMobileMapPointer()) {
    return bindMobileGestures(map, container);
  }
  return bindDesktopGestures(map, container);
}
