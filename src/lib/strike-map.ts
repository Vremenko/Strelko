import L from "leaflet";
import { bindStreleMapZoomGestures } from "./strike-map-gestures";
import {
  ensureStrikeMapPanes,
  isMaptilerSdkLayer,
  removeInjectedMapControls,
} from "./strike-map-labels";
import { formatSlDecimal, formatStrikeDateTime, ESTIMATED_STRIKE_TIME_LABEL } from "./dates";
import type { StrikePoint } from "../types";

const MI_CYAN = "#05a5ce";

const SLOVENIA_BOUNDS = L.latLngBounds([45.4, 13.35], [46.9, 16.63]);

const MIN_MAP_AXIS_PX = 100;
const MAP_SIZE_EPS_PX = 2;
const MAX_PADDING_AXIS_FRAC = 0.28;
/** Fractional snap used only during programmatic fit (restored after fit). */
const FIT_ZOOM_SNAP = 0.1;
const FIT_MARGIN_EPS_PX = 1;

const HOME_ICON = L.divIcon({
  className: "strelko-home-marker",
  html: `<svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="${MI_CYAN}" stroke="#fff" stroke-width="2"/><circle cx="14" cy="14" r="4" fill="#fff"/></svg>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const STRIKE_ICON = L.divIcon({
  className: "strelko-strike-marker",
  html: `<svg width="18" height="18" viewBox="0 0 18 18"><path d="M10 1L4 11h4l-2 6 8-12H9l1-4z" fill="#fbb006" stroke="#1a1a1a" stroke-width="0.6"/></svg>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const STRIKE_POPUP_CLASS = "strele-strike-popup-shell";
const strikePopupOptions: L.PopupOptions = { className: STRIKE_POPUP_CLASS };

function strikePopupHtml(strike: StrikePoint): string {
  return `<div class="strele-strike-tooltip"><strong>Strela</strong> ~${formatSlDecimal(strike.distance_km)} km<br><span class="strele-strike-tooltip__time-label">${ESTIMATED_STRIKE_TIME_LABEL}</span><br>${formatStrikeDateTime(strike.ts_utc)}</div>`;
}

function homePopupHtml(): string {
  return `<div class="strele-strike-tooltip"><strong>Vaša lokacija</strong></div>`;
}

function rebuildStrikeLayer(
  layer: L.LayerGroup,
  strikes: StrikePoint[],
  lat: number,
  lon: number
): L.FeatureGroup {
  layer.clearLayers();
  const group = L.featureGroup();
  group.addLayer(L.marker([lat, lon]));
  strikes.forEach((strike) => {
    const marker = L.marker([strike.lat, strike.lon], { icon: STRIKE_ICON });
    marker.bindPopup(strikePopupHtml(strike), strikePopupOptions);
    marker.addTo(layer);
    group.addLayer(marker);
  });
  return group;
}

function computeMinZoom(map: L.Map): number | null {
  map.invalidateSize({ pan: false });
  const size = map.getSize();
  if (size.x < MIN_MAP_AXIS_PX || size.y < MIN_MAP_AXIS_PX) return null;
  let zoom = map.getBoundsZoom(SLOVENIA_BOUNDS, false);
  if (!Number.isFinite(zoom)) zoom = 7;
  return Math.max(7, Math.ceil(zoom));
}

function computeCircleFitPadding(map: L.Map): {
  paddingTopLeft: L.PointExpression;
  paddingBottomRight: L.PointExpression;
} {
  const size = map.getSize();
  let left = Math.round(Math.min(16, Math.max(8, size.x * 0.012))) + 3;
  let top = Math.round(Math.min(16, Math.max(8, size.y * 0.012))) + 3;
  let right = left + 44;
  let bottom = top + 22;

  const maxHorizontal = Math.floor(size.x * MAX_PADDING_AXIS_FRAC);
  const maxVertical = Math.floor(size.y * MAX_PADDING_AXIS_FRAC);
  if (left + right > maxHorizontal) {
    const scale = maxHorizontal / (left + right);
    left = Math.max(6, Math.floor(left * scale));
    right = Math.max(24, Math.floor(right * scale));
  }
  if (top + bottom > maxVertical) {
    const scale = maxVertical / (top + bottom);
    top = Math.max(6, Math.floor(top * scale));
    bottom = Math.max(14, Math.floor(bottom * scale));
  }

  return {
    paddingTopLeft: [left, top],
    paddingBottomRight: [right, bottom],
  };
}

function applySearchLimits(map: L.Map, lat: number, lon: number, radiusKm: number): boolean {
  const host = map as L.Map & {
    setMaxBoundsViscosity?: (v: number) => void;
    _searchMinZoom?: number;
    _searchCenter?: L.LatLng;
    _searchZoomClampBound?: boolean;
    _programmaticFit?: boolean;
  };
  if (typeof map.setMaxBounds !== "function" || typeof host.setMaxBoundsViscosity !== "function") {
    return false;
  }
  const minZoom = computeMinZoom(map);
  if (minZoom == null) return false;

  host._searchMinZoom = minZoom;
  host._searchCenter = L.latLng(lat, lon);
  map.setMinZoom(minZoom);
  map.setMaxBounds(SLOVENIA_BOUNDS.pad(0.05));
  host.setMaxBoundsViscosity(1);

  if (!host._searchZoomClampBound) {
    host._searchZoomClampBound = true;
    const clampZoom = (ev?: L.LeafletEvent) => {
      if (host._programmaticFit) return;
      const original = (ev as L.LeafletEvent & { originalEvent?: Event } | undefined)?.originalEvent;
      if (!original) return;
      const floor = host._searchMinZoom;
      if (floor != null && map.getZoom() < floor) {
        map.setZoom(floor, { animate: false });
      }
    };
    map.on("zoom", clampZoom);
    map.on("zoomend", clampZoom);
  }

  void radiusKm;
  return true;
}

function circlePixelSpan(
  map: L.Map,
  lat: number,
  lon: number,
  radiusM: number,
  zoom: number
): { width: number; height: number } {
  const earth = 6378137;
  const dLat = (radiusM / earth) * (180 / Math.PI);
  const dLon = (radiusM / (earth * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);
  const center = map.project([lat, lon], zoom);
  const north = map.project([lat + dLat, lon], zoom);
  const east = map.project([lat, lon + dLon], zoom);
  return {
    width: Math.abs(east.x - center.x) * 2,
    height: Math.abs(center.y - north.y) * 2,
  };
}

function circleFitsAtZoom(
  map: L.Map,
  lat: number,
  lon: number,
  radiusM: number,
  zoom: number,
  availW: number,
  availH: number
): boolean {
  const span = circlePixelSpan(map, lat, lon, radiusM, zoom);
  return span.width <= availW - FIT_MARGIN_EPS_PX && span.height <= availH - FIT_MARGIN_EPS_PX;
}

function computeCircleFitZoom(
  map: L.Map,
  lat: number,
  lon: number,
  radiusM: number,
  availW: number,
  availH: number,
  maxZoom: number
): number {
  const minZoom = map.getMinZoom();
  let lo = minZoom;
  let hi = maxZoom;
  for (let i = 0; i < 32; i += 1) {
    const mid = (lo + hi) / 2;
    if (circleFitsAtZoom(map, lat, lon, radiusM, mid, availW, availH)) lo = mid;
    else hi = mid;
  }

  let zoom = lo;
  if (FIT_ZOOM_SNAP > 0) {
    zoom = Math.floor(zoom / FIT_ZOOM_SNAP) * FIT_ZOOM_SNAP;
    while (zoom > minZoom && !circleFitsAtZoom(map, lat, lon, radiusM, zoom, availW, availH)) {
      zoom = Math.max(minZoom, zoom - FIT_ZOOM_SNAP);
    }
  }
  return Math.max(minZoom, Math.min(maxZoom, Math.round(zoom * 10) / 10));
}

function fitSearchRadius(map: L.Map, lat: number, lon: number, radiusKm: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || radiusKm <= 0) {
    return false;
  }

  map.invalidateSize({ pan: false });
  const size = map.getSize();
  if (size.x < MIN_MAP_AXIS_PX || size.y < MIN_MAP_AXIS_PX) return false;

  const host = map as L.Map & { _programmaticFit?: boolean };
  const { paddingTopLeft, paddingBottomRight } = computeCircleFitPadding(map);
  const paddingTL = L.point(paddingTopLeft);
  const paddingBR = L.point(paddingBottomRight);
  const availW = size.x - paddingTL.x - paddingBR.x;
  const availH = size.y - paddingTL.y - paddingBR.y;
  if (availW <= 0 || availH <= 0) return false;

  const radiusM = radiusKm * 1000;
  const zoom = computeCircleFitZoom(map, lat, lon, radiusM, availW, availH, 15);
  const paddingOffset = paddingBR.subtract(paddingTL).divideBy(2);
  const centerPoint = map.project([lat, lon], zoom).add(paddingOffset);
  const center = map.unproject(centerPoint, zoom);

  const prevZoomSnap = map.options.zoomSnap;
  const prevZoomDelta = map.options.zoomDelta;
  map.options.zoomSnap = FIT_ZOOM_SNAP;
  map.options.zoomDelta = FIT_ZOOM_SNAP;

  host._programmaticFit = true;
  try {
    map.setView(center, zoom, { animate: false });
  } finally {
    map.options.zoomSnap = prevZoomSnap;
    map.options.zoomDelta = prevZoomDelta;
    requestAnimationFrame(() => {
      host._programmaticFit = false;
    });
  }
  return true;
}

function waitForSearchLimits(
  map: L.Map,
  lat: number,
  lon: number,
  radiusKm: number,
  onReady: () => void
) {
  const tick = () => {
    if (applySearchLimits(map, lat, lon, radiusKm)) {
      onReady();
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function reapplySearchLimitsAfterMaptiler(map: L.Map): void {
  const host = map as L.Map & {
    _searchMinZoom?: number;
    _applyingSearchLimits?: boolean;
    setMaxBoundsViscosity?: (v: number) => void;
  };
  if (
    typeof host.setMaxBoundsViscosity !== "function" ||
    host._searchMinZoom == null ||
    host._applyingSearchLimits
  ) {
    return;
  }
  host._applyingSearchLimits = true;
  try {
    map.setMinZoom(host._searchMinZoom);
    map.setMaxBounds(SLOVENIA_BOUNDS.pad(0.05));
    host.setMaxBoundsViscosity(1);
  } finally {
    host._applyingSearchLimits = false;
  }
}

export interface StrikeMapHost {
  updateStrikes: (strikes: StrikePoint[], opts?: { refit?: boolean }) => void;
  destroy: () => void;
}

export function createStrikeMap(
  el: HTMLElement,
  {
    lat,
    lon,
    radiusKm,
    strikes,
  }: {
    lat: number;
    lon: number;
    radiusKm: number;
    strikes: StrikePoint[];
  }
): StrikeMapHost {
  el.querySelectorAll(".leaflet-layers-panel.strike-map-layers-panel").forEach((node) => {
    node.parentNode?.removeChild(node);
  });

  const existing = (el as HTMLElement & { _leafletMap?: L.Map })._leafletMap;
  existing?.remove();

  const mobile =
    typeof window !== "undefined" && window.matchMedia("(max-width:899px)").matches;

  const map = L.map(el, {
    zoomControl: false,
    scrollWheelZoom: false,
    dragging: false,
    touchZoom: mobile,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    preferCanvas: !mobile,
    worldCopyJump: false,
  });

  (el as HTMLElement & { _leafletMap?: L.Map })._leafletMap = map;

  map.attributionControl.setPrefix("");

  const unbindGestures = bindStreleMapZoomGestures(map, el);
  ensureStrikeMapPanes(map);

  let basemapLoadActive = true;
  void import("./strike-map-basemap").then(({ initStrikeMapBasemap }) => {
    if (!basemapLoadActive || !el.isConnected) return;
    const state = initStrikeMapBasemap(map, el, mobile);
    void import("./strike-map-layers-control").then(({ addStrikeMapLayerControls }) => {
      if (!basemapLoadActive || !el.isConnected) return;
      addStrikeMapLayerControls(map, state);
    });
  });

  map.on("layeradd", (event) => {
    removeInjectedMapControls(el);
    if (isMaptilerSdkLayer(event.layer)) {
      reapplySearchLimitsAfterMaptiler(map);
    }
  });

  L.marker([lat, lon], { icon: HOME_ICON })
    .addTo(map)
    .bindPopup(homePopupHtml(), strikePopupOptions);

  L.circle([lat, lon], {
    radius: radiusKm * 1000,
    color: MI_CYAN,
    fillColor: MI_CYAN,
    fillOpacity: 0.12,
    weight: 2,
    dashArray: "6 4",
  }).addTo(map);

  const strikeLayer = L.layerGroup().addTo(map);
  rebuildStrikeLayer(strikeLayer, strikes, lat, lon);

  type MapHost = L.Map & {
    _programmaticFit?: boolean;
    _userAdjustedView?: boolean;
  };
  const mapHost = map as MapHost;
  mapHost._userAdjustedView = false;

  let circleFitSeq = 0;
  let fitDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastFitWidth = 0;
  let lastFitHeight = 0;
  let initialFitDone = false;

  const markUserAdjusted = (ev: L.LeafletEvent) => {
    if (mapHost._programmaticFit) return;
    const original = (ev as L.LeafletEvent & { originalEvent?: Event } | undefined)?.originalEvent;
    if (original) mapHost._userAdjustedView = true;
  };
  map.on("movestart", markUserAdjusted);
  map.on("zoomstart", markUserAdjusted);

  const mapSizeChanged = (width: number, height: number) =>
    Math.abs(width - lastFitWidth) > MAP_SIZE_EPS_PX ||
    Math.abs(height - lastFitHeight) > MAP_SIZE_EPS_PX;

  const performCircleFit = (opts: { force?: boolean; fromResize?: boolean }): boolean => {
    map.invalidateSize({ pan: false });
    const size = map.getSize();
    if (size.x < MIN_MAP_AXIS_PX || size.y < MIN_MAP_AXIS_PX) return false;

    if (!opts.force && !opts.fromResize && mapHost._userAdjustedView) return true;
    if (!opts.force && initialFitDone && !mapSizeChanged(size.x, size.y)) return true;

    if (!fitSearchRadius(map, lat, lon, radiusKm)) return false;

    lastFitWidth = size.x;
    lastFitHeight = size.y;
    initialFitDone = true;
    if (opts.fromResize) {
      mapHost._userAdjustedView = false;
    }
    return true;
  };

  const queueCircleFit = (opts?: { force?: boolean; fromResize?: boolean }) => {
    circleFitSeq += 1;
    const seq = circleFitSeq;

    const runAttempt = (attempt = 0) => {
      if (seq !== circleFitSeq) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (seq !== circleFitSeq) return;
          if (performCircleFit({ force: opts?.force, fromResize: opts?.fromResize })) return;
          if (attempt < 24) runAttempt(attempt + 1);
        });
      });
    };

    if (fitDebounceTimer) clearTimeout(fitDebounceTimer);
    const delay = opts?.fromResize ? 80 : 0;
    fitDebounceTimer = setTimeout(runAttempt, delay);
  };

  const onContainerResize = () => {
    queueCircleFit({ fromResize: true });
  };

  const resizeObserver =
    typeof ResizeObserver !== "undefined" ? new ResizeObserver(onContainerResize) : null;
  resizeObserver?.observe(el);

  const onWindowResize = () => onContainerResize();
  window.addEventListener("resize", onWindowResize);

  const updateStrikeMarkers = (nextStrikes: StrikePoint[]) => {
    rebuildStrikeLayer(strikeLayer, nextStrikes, lat, lon);
  };

  waitForSearchLimits(map, lat, lon, radiusKm, () => {
    queueCircleFit({ force: true });
  });

  return {
    updateStrikes(nextStrikes) {
      updateStrikeMarkers(nextStrikes);
    },
    destroy() {
      basemapLoadActive = false;
      circleFitSeq += 1;
      if (fitDebounceTimer) {
        clearTimeout(fitDebounceTimer);
        fitDebounceTimer = null;
      }
      resizeObserver?.disconnect();
      window.removeEventListener("resize", onWindowResize);
      map.off("movestart", markUserAdjusted);
      map.off("zoomstart", markUserAdjusted);
      try {
        unbindGestures();
      } catch {
        /* ignore */
      }
      try {
        map.remove();
      } catch {
        /* ignore — container may already be detached */
      }
      try {
        delete (el as HTMLElement & { _leafletMap?: L.Map })._leafletMap;
      } catch {
        /* ignore */
      }
    },
  };
}
