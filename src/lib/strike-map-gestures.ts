import type { Map as LeafletMap } from "leaflet";

const MOBILE_HINT = "Premaknite zemljevid z dvema prstoma.";
/** Skrivanje po koncu enoprstnega dotika (touchend / touchcancel). */
const HINT_HIDE_AFTER_TOUCH_MS = 500;
const MOB_DRAG_HINT_PX = 3;
const PINCH_DIST_CHANGE = 0.02;

/** Miška / sledilna ploščica — tudi na prenosniku z zaslonom na dotik. */
export function prefersDesktopMapPointer(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(any-pointer: fine)").matches;
}

export function prefersMobileMapPointer(): boolean {
  return !prefersDesktopMapPointer();
}

function createHintController(container: HTMLElement, message: string) {
  let hintTimer: ReturnType<typeof setTimeout> | null = null;
  let hintEl: HTMLDivElement | null = null;

  const cancelHideTimer = () => {
    if (hintTimer) {
      clearTimeout(hintTimer);
      hintTimer = null;
    }
  };

  const hideHint = () => {
    cancelHideTimer();
    if (hintEl?.parentNode) {
      hintEl.parentNode.removeChild(hintEl);
    }
    hintEl = null;
  };

  /** Pokaži isti element; prekliči morebitni timer skrivanja. Med gesto ne skrij. */
  const showHint = () => {
    if (!container.isConnected) return;
    cancelHideTimer();
    if (!hintEl) {
      hintEl = document.createElement("div");
      hintEl.className = "strele-map-wheel-hint";
      hintEl.setAttribute("aria-live", "polite");
      hintEl.textContent = message;
      container.appendChild(hintEl);
    }
  };

  /** Skrij ~500 ms po koncu dotika. */
  const scheduleHintHide = () => {
    cancelHideTimer();
    if (!hintEl) return;
    hintTimer = setTimeout(hideHint, HINT_HIDE_AFTER_TOUCH_MS);
  };

  return { hideHint, showHint, scheduleHintHide, cancelHideTimer };
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

  const { hideHint, showHint, scheduleHintHide, cancelHideTimer } = createHintController(
    container,
    MOBILE_HINT
  );
  const mapContainer = map.getContainer();

  let singleActive = false;
  let startX = 0;
  let startY = 0;
  let hintArmedForGesture = false;
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
    hintArmedForGesture = false;
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
      cancelHideTimer();
      singleActive = true;
      hintArmedForGesture = true;
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
    if (hintArmedForGesture && Math.hypot(x - startX, y - startY) > MOB_DRAG_HINT_PX) {
      hintArmedForGesture = false;
      showHint();
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
      hintArmedForGesture = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      return;
    }
    singleActive = false;
    hintArmedForGesture = false;
    multiActive = false;
    multiPinching = false;
    scheduleHintHide();
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
 * Telefon (coarse): en prst = stran, dva prsta = zemljevid; namig ob vsaki novi enoprstni gesti.
 */
export function bindStreleMapZoomGestures(map: LeafletMap, container: HTMLElement): () => void {
  if (prefersMobileMapPointer()) {
    return bindMobileGestures(map, container);
  }
  return bindDesktopGestures(map, container);
}
