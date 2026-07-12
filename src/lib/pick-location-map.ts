import L from "leaflet";
import { maptilerLayer } from "@maptiler/leaflet-maptilersdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import {
  MAPTILER_KEY,
  STYLE_BASE_DARK,
  STYLE_KRAJI_DARK,
  MAPTILER_OVERLAY_PANE,
  STREKO_VECTOR_PANE,
  ensureStrikeMapPanes,
  removeInjectedMapControls,
  syncStrikeMapAttribution,
} from "./strike-map-labels";

const MI_CYAN = "#05a5ce";
const PICK_LOCATION_ZOOM = 17;

const PICK_MARKER_ICON = L.divIcon({
  className: "pick-location-marker",
  html: `<svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="12" fill="${MI_CYAN}" stroke="#fff" stroke-width="2"/><circle cx="14" cy="14" r="4" fill="#fff"/></svg>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function maptilerStyleUrl(styleId: string): string {
  return `https://api.maptiler.com/maps/${styleId}/style.json?key=${encodeURIComponent(MAPTILER_KEY)}`;
}

function maptilerLayerContainer(layer: ReturnType<typeof maptilerLayer>): HTMLElement | null {
  const host = layer as ReturnType<typeof maptilerLayer> & {
    getContainer?: () => HTMLElement;
  };
  return host.getContainer?.()?.parentElement ?? null;
}

function hideNonLabelLayers(layer: ReturnType<typeof maptilerLayer>): void {
  const sdkMap = layer.getMaptilerSDKMap?.();
  const layers = sdkMap?.getStyle?.()?.layers;
  if (!sdkMap || !layers) return;

  for (const entry of layers) {
    const layout = entry.layout as Record<string, unknown> | undefined;
    if (entry.type === "symbol" && layout?.["text-field"]) continue;
    try {
      sdkMap.setLayoutProperty(entry.id, "visibility", "none");
    } catch {
      /* layer may not exist yet */
    }
  }
}

function stripPickerMapControls(container: HTMLElement): void {
  removeInjectedMapControls(container);
  [
    ".leaflet-control-layers",
    ".leaflet-control-theme-wrap",
    ".leaflet-control-zoom",
    ".leaflet-bar",
    ".maptiler-ctrl",
    ".maplibregl-ctrl",
    ".maplibregl-ctrl-group",
    ".maplibregl-control-container .maplibregl-ctrl-top-right",
    ".maplibregl-control-container .maplibregl-ctrl-top-left",
  ].forEach((selector) => {
    container.querySelectorAll(selector).forEach((node) => node.remove());
  });
}

function schedulePickerControlCleanup(container: HTMLElement): void {
  stripPickerMapControls(container);
  for (const delay of [50, 250, 800]) {
    window.setTimeout(() => stripPickerMapControls(container), delay);
  }
}

export function formatMapCoordinate(value: number): string {
  return Number(value).toFixed(6);
}

/** Naslov rezultata: pri izbiri na zemljevidu koordinati, sicer običajni label. */
export function resultLocationTitle(
  fromMap: boolean | undefined,
  lat: number,
  lon: number,
  fallbackLabel?: string
): string {
  if (fromMap && Number.isFinite(lat) && Number.isFinite(lon)) {
    return `Lat: ${formatMapCoordinate(lat)}, Lon: ${formatMapCoordinate(lon)}`;
  }
  return fallbackLabel?.trim() || "vaša lokacija";
}

export interface PickLocationMapHandle {
  setMarker: (lat: number, lon: number) => void;
  flyTo: (lat: number, lon: number, zoom?: number) => void;
  destroy: () => void;
}

export function createPickLocationMap(
  container: HTMLElement,
  center: { lat: number; lon: number },
  zoom: number,
  initialMarker: { lat: number; lon: number } | null,
  onPick: (lat: number, lon: number) => void
): PickLocationMapHandle {
  const map = L.map(container, {
    zoomControl: false,
    scrollWheelZoom: true,
    attributionControl: true,
  }).setView([center.lat, center.lon], zoom);

  ensureStrikeMapPanes(map);

  const baseLayer = maptilerLayer({
    apiKey: MAPTILER_KEY,
    style: maptilerStyleUrl(STYLE_BASE_DARK),
    attributionControl: false,
  } as Parameters<typeof maptilerLayer>[0]);

  const labelsLayer = maptilerLayer({
    apiKey: MAPTILER_KEY,
    style: maptilerStyleUrl(STYLE_KRAJI_DARK),
    attribution: "",
    attributionControl: false,
    pane: MAPTILER_OVERLAY_PANE,
  } as Parameters<typeof maptilerLayer>[0] & L.LayerOptions);

  baseLayer.on("ready", () => {
    stripPickerMapControls(container);
    syncStrikeMapAttribution(map);
  });
  labelsLayer.on("ready", () => {
    hideNonLabelLayers(labelsLayer);
    stripPickerMapControls(maptilerLayerContainer(labelsLayer) ?? container);
  });

  baseLayer.addTo(map);
  labelsLayer.addTo(map);

  const bordersLayer = L.geoJSON(undefined, {
    pane: STREKO_VECTOR_PANE,
    style: () => ({ color: "#ffffff", weight: 2, opacity: 0.95, fill: false }),
    interactive: false,
  });
  bordersLayer.addTo(map);
  void fetch("/assets/meje_drzav.geojson")
    .then((res) => (res.ok ? res.json() : null))
    .then((geojson) => {
      if (geojson && container.isConnected) bordersLayer.addData(geojson);
    })
    .catch(() => {});

  map.on("layeradd", () => schedulePickerControlCleanup(container));

  let marker: L.Marker | null = null;

  function setMarker(lat: number, lon: number) {
    const latlng = L.latLng(lat, lon);
    if (marker) {
      marker.setLatLng(latlng);
    } else {
      marker = L.marker(latlng, { icon: PICK_MARKER_ICON }).addTo(map);
    }
  }

  function flyTo(lat: number, lon: number, targetZoom = PICK_LOCATION_ZOOM) {
    map.stop();
    map.flyTo([lat, lon], targetZoom, { duration: 0.75 });
  }

  if (initialMarker) {
    setMarker(initialMarker.lat, initialMarker.lon);
  }

  map.on("click", (event) => {
    const { lat, lng } = event.latlng;
    setMarker(lat, lng);
    onPick(lat, lng);
  });

  requestAnimationFrame(() => {
    map.invalidateSize();
    syncStrikeMapAttribution(map);
    schedulePickerControlCleanup(container);
  });

  return {
    setMarker,
    flyTo,
    destroy() {
      map.off();
      map.remove();
      stripPickerMapControls(container);
    },
  };
}
