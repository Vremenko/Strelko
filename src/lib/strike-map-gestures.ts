import type { Map as LeafletMap } from "leaflet";

export function bindStreleMapZoomGestures(map: LeafletMap, container: HTMLElement): () => void {
  const mobile =
    typeof window !== "undefined" && window.matchMedia("(max-width:899px)").matches;

  if (mobile) {
    try {
      map.touchZoom.enable();
    } catch {
      /* ignore */
    }
    return () => {};
  }

  const hintMsg = "Ctrl + kolesce ali vlečenje miške";
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

  const showHint = () => {
    hideHint();
    if (!container.isConnected) return;
    hintEl = document.createElement("div");
    hintEl.className = "strele-map-wheel-hint";
    hintEl.textContent = hintMsg;
    container.appendChild(hintEl);
    hintTimer = setTimeout(hideHint, 2800);
  };

  const mapContainer = map.getContainer();
  let panning = false;
  let lastX = 0;
  let lastY = 0;
  let ctrlDown = false;

  const ctrlZoom = (ev: MouseEvent | WheelEvent) =>
    ctrlDown ||
    !!(ev.ctrlKey || ev.metaKey || ev.getModifierState?.("Control"));

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
  };
  const onMouseDown = (ev: MouseEvent) => {
    if (ctrlZoom(ev) && ev.button === 0) {
      hideHint();
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
      showHint();
    }
  };

  window.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("keyup", onKeyUp, true);
  window.addEventListener("blur", onBlur);
  mapContainer.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", endPan);
  mapContainer.addEventListener("wheel", onWheel, { passive: false, capture: true });

  return () => {
    hideHint();
    window.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("keyup", onKeyUp, true);
    window.removeEventListener("blur", onBlur);
    mapContainer.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", endPan);
    mapContainer.removeEventListener("wheel", onWheel, true);
  };
}
