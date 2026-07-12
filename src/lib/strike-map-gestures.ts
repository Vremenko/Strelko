import type { Map as LeafletMap } from "leaflet";

const DESKTOP_HINT = "Ctrl + kolesce ali vlečenje miške";
const MOBILE_HINT = "Premakni zemljevid z dvema prstoma";
const HINT_HIDE_MS = 700;
const MOB_DRAG_HINT_PX = 3;
const PINCH_DIST_CHANGE = 0.02;

function isMobileView(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(max-width:899px)").matches;
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

  const scheduleHint = () => {
    if (!container.isConnected) return;
    if (!hintEl) {
      hintEl = document.createElement("div");
      hintEl.className = "strele-map-wheel-hint";
      hintEl.textContent = message;
      container.appendChild(hintEl);
    }
    if (hintTimer) clearTimeout(hintTimer);
    hintTimer = setTimeout(hideHint, HINT_HIDE_MS);
  };

  return { hideHint, scheduleHint };
}

function bindMobileGestures(map: LeafletMap, container: HTMLElement): () => void {
  try {
    map.dragging.disable();
  } catch {
    /* ignore */
  }
  try {
    map.touchZoom.enable();
  } catch {
    /* ignore */
  }

  const { hideHint, scheduleHint } = createHintController(container, MOBILE_HINT);
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
      scheduleHint();
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

function bindDesktopGestures(map: LeafletMap, container: HTMLElement): () => void {
  const { hideHint, scheduleHint } = createHintController(container, DESKTOP_HINT);

  const mapContainer = map.getContainer();
  let panning = false;
  let lastX = 0;
  let lastY = 0;
  let ctrlDown = false;

  const ctrlZoom = (ev: MouseEvent | WheelEvent) =>
    ctrlDown || !!(ev.ctrlKey || ev.metaKey || ev.getModifierState?.("Control"));

  const wheelZoomStep = (ev: WheelEvent) => {
    let dy = ev.deltaY;
    if (ev.deltaMode === WheelEvent.DOM_DELTA_LINE) dy *= 20;
    else if (ev.deltaMode === WheelEvent.DOM_DELTA_PAGE) dy *= 1200;
    else if (Math.abs(dy) < 4) dy *= 20;
    return -dy / 120;
  };

  const endPan = () => {
    panning = false;
  };

  const onKeyDown = (ev: KeyboardEvent) => {
    if (ev.key === "Control") ctrlDown = true;
  };
  const onKeyUp = (ev: KeyboardEvent) => {
    if (ev.key === "Control") ctrlDown = false;
  };
  const onBlur = () => {
    ctrlDown = false;
    hideHint();
  };
  const onMouseDown = (ev: MouseEvent) => {
    if (ev.button !== 0) return;
    hideHint();
    if (ctrlZoom(ev)) {
      panning = true;
      lastX = ev.clientX;
      lastY = ev.clientY;
      ev.preventDefault();
    }
  };
  const onMouseMove = (ev: MouseEvent) => {
    if (!panning) return;
    const dx = ev.clientX - lastX;
    const dy = ev.clientY - lastY;
    lastX = ev.clientX;
    lastY = ev.clientY;
    map.panBy([-dx, -dy], { animate: false });
  };
  const onWheel = (ev: WheelEvent) => {
    if (ctrlZoom(ev)) {
      hideHint();
      ev.preventDefault();
      ev.stopPropagation();
      const step = wheelZoomStep(ev);
      if (!step) return;
      const next = map.getZoom() + step;
      map.setZoom(
        Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), next)),
        { animate: false }
      );
    } else {
      scheduleHint();
    }
  };

  map.on("movestart", hideHint);
  map.on("zoomstart", hideHint);
  window.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("keyup", onKeyUp, true);
  window.addEventListener("blur", onBlur);
  mapContainer.addEventListener("mousedown", onMouseDown);
  mapContainer.addEventListener("mouseleave", hideHint);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", endPan);
  mapContainer.addEventListener("wheel", onWheel, { passive: false, capture: true });

  return () => {
    hideHint();
    map.off("movestart", hideHint);
    map.off("zoomstart", hideHint);
    window.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("keyup", onKeyUp, true);
    window.removeEventListener("blur", onBlur);
    mapContainer.removeEventListener("mousedown", onMouseDown);
    mapContainer.removeEventListener("mouseleave", hideHint);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", endPan);
    mapContainer.removeEventListener("wheel", onWheel, true);
  };
}

export function bindStreleMapZoomGestures(map: LeafletMap, container: HTMLElement): () => void {
  if (isMobileView()) {
    return bindMobileGestures(map, container);
  }
  return bindDesktopGestures(map, container);
}
