import L from "leaflet";
import { bindStreleMapZoomGestures } from "./strike-map-gestures";
import {
  ensureStrikeMapPanes,
  isMaptilerSdkLayer,
  removeInjectedMapControls,
} from "./strike-map-labels";
import { formatSlDecimal, formatStrikeDateTime } from "./dates";
import type { StrikePoint } from "../types";

const MI_CYAN = "#05a5ce";

const SLOVENIA_BOUNDS = L.latLngBounds([45.4, 13.35], [46.9, 16.63]);

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

function strikePopupHtml(strike: StrikePoint): string {
  return `<strong>Strela</strong><br>${formatStrikeDateTime(strike.ts_utc)}<br>~${formatSlDecimal(strike.distance_km)}`;
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
    marker.bindPopup(strikePopupHtml(strike));
    marker.addTo(layer);
    group.addLayer(marker);
  });
  return group;
}

function computeMinZoom(map: L.Map): number | null {
  map.invalidateSize(true);
  const size = map.getSize();
  if (size.x < 20 || size.y < 20) return null;
  let zoom = map.getBoundsZoom(SLOVENIA_BOUNDS, false);
  if (!Number.isFinite(zoom)) zoom = 7;
  return Math.max(7, Math.ceil(zoom));
}

function applySearchLimits(map: L.Map, lat: number, lon: number, radiusKm: number): boolean {
  const host = map as L.Map & {
    setMaxBoundsViscosity?: (v: number) => void;
    _searchMinZoom?: number;
    _searchCenter?: L.LatLng;
    _searchZoomClampBound?: boolean;
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
    const clampZoom = () => {
      const floor = host._searchMinZoom;
      if (floor != null && map.getZoom() < floor) {
        map.setZoom(floor, { animate: false });
      }
    };
    map.on("zoom", clampZoom);
    map.on("zoomend", clampZoom);
  }

  if (map.getZoom() < minZoom && host._searchCenter) {
    map.setView(host._searchCenter, minZoom, { animate: false });
  }

  void radiusKm;
  return true;
}

function fitStrikeGroup(
  map: L.Map,
  group: L.FeatureGroup,
  lat: number,
  lon: number,
  strikeCount: number,
  minZoom?: number
) {
  if (strikeCount > 0) {
    map.fitBounds(group.getBounds().pad(0.15), { animate: false, maxZoom: 15 });
  } else {
    map.setView([lat, lon], minZoom ?? 11, { animate: false });
  }
  if (minZoom != null && map.getZoom() < minZoom) {
    map.setZoom(minZoom, { animate: false });
  }
}

function waitForSearchLimits(
  map: L.Map,
  lat: number,
  lon: number,
  radiusKm: number,
  onReady: (minZoom: number) => void
) {
  const tick = () => {
    if (applySearchLimits(map, lat, lon, radiusKm)) {
      const minZoom = (map as L.Map & { _searchMinZoom?: number })._searchMinZoom ?? 7;
      onReady(minZoom);
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

  map.setView([lat, lon], mobile ? 10 : 11, { animate: false });

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
    .bindPopup("<strong>Vaša lokacija</strong>");

  L.circle([lat, lon], {
    radius: radiusKm * 1000,
    color: MI_CYAN,
    fillColor: MI_CYAN,
    fillOpacity: 0.12,
    weight: 2,
    dashArray: "6 4",
  }).addTo(map);

  const strikeLayer = L.layerGroup().addTo(map);
  let fitted = false;
  let lastStrikeCount = 0;
  let fitGroup = rebuildStrikeLayer(strikeLayer, strikes, lat, lon);

  const refitMap = (nextStrikes: StrikePoint[], force = false) => {
    fitGroup = rebuildStrikeLayer(strikeLayer, nextStrikes, lat, lon);
    const minZoom = (map as L.Map & { _searchMinZoom?: number })._searchMinZoom;
    const shouldRefit =
      force || !fitted || (nextStrikes.length > 0 && lastStrikeCount === 0);
    if (shouldRefit) {
      fitStrikeGroup(map, fitGroup, lat, lon, nextStrikes.length, minZoom);
      fitted = true;
    }
    lastStrikeCount = nextStrikes.length;
  };

  waitForSearchLimits(map, lat, lon, radiusKm, () => {
    refitMap(strikes, true);
  });

  return {
    updateStrikes(nextStrikes, opts = {}) {
      refitMap(nextStrikes, opts.refit ?? false);
    },
    destroy() {
      basemapLoadActive = false;
      unbindGestures();
      map.remove();
      delete (el as HTMLElement & { _leafletMap?: L.Map })._leafletMap;
    },
  };
}
