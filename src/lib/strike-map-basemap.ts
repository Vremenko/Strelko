import L from "leaflet";
import { maptilerLayer } from "@maptiler/leaflet-maptilersdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import {
  LAYER_NAME_MAP,
  LAYER_NAME_SATELLITE,
  MAPTILER_KEY,
  MAPTILER_OVERLAY_PANE,
  MAP_LAYERS_STORAGE_KEY,
  SATELLITE_ATTRIBUTION,
  STREKO_VECTOR_PANE,
  STYLE_BASE_DARK,
  STYLE_BASE_LIGHT,
  STYLE_KRAJI_DARK,
  STYLE_KRAJI_LIGHT,
  isMaptilerSdkLayer,
  removeInjectedMapControls,
  syncStrikeMapAttribution,
} from "./strike-map-labels";
type MapTheme = "dark" | "light";
type BaseLayerName = typeof LAYER_NAME_MAP | typeof LAYER_NAME_SATELLITE;

export interface StrikeMapBasemapState {
  baseLayer: BaseLayerName;
  mapTheme: MapTheme;
  labelsOn: boolean;
  bordersLayer: L.GeoJSON | null;
  krajiMeje: L.LayerGroup;
  krajiMejeDark: L.Layer | null;
  krajiMejeLight: L.Layer | null;
  meteoinfoBase: ReturnType<typeof maptilerLayer> | null;
  satellite: L.TileLayer | null;
  _layersPanel?: HTMLElement;
  _themeBtn?: HTMLButtonElement;
  _themeWrap?: HTMLDivElement;
  _renderThemeToggle?: () => void;
}

interface SavedLayerPrefs {
  baseLayer?: string;
  baseName?: string;
  mapTheme?: string;
  labelsOn?: boolean;
}

function maptilerStyleUrl(styleId: string): string {
  return `https://api.maptiler.com/maps/${styleId}/style.json?key=${encodeURIComponent(MAPTILER_KEY)}`;
}

function styleIdForTheme(theme: MapTheme): string {
  return theme === "light" ? STYLE_BASE_LIGHT : STYLE_BASE_DARK;
}

function normalizeSavedPrefs(raw: SavedLayerPrefs | null): {
  baseLayer: BaseLayerName;
  mapTheme: MapTheme;
  labelsOn: boolean;
} {
  if (!raw) {
    return { baseLayer: LAYER_NAME_MAP, mapTheme: "dark", labelsOn: true };
  }

  let baseLayer: BaseLayerName = LAYER_NAME_MAP;
  let mapTheme: MapTheme = "dark";
  const baseName = raw.baseName;

  if (
    raw.baseLayer === LAYER_NAME_SATELLITE ||
    baseName === "Satelitska slika" ||
    baseName === LAYER_NAME_SATELLITE
  ) {
    baseLayer = LAYER_NAME_SATELLITE;
  }

  if (
    raw.mapTheme === "light" ||
    baseName === "Zemljevid (svetla)" ||
    baseName === "zemljevid (svetla)"
  ) {
    mapTheme = "light";
  }

  return {
    baseLayer,
    mapTheme,
    labelsOn: raw.labelsOn !== false,
  };
}

function loadSavedLayerPrefs(): ReturnType<typeof normalizeSavedPrefs> {
  try {
    const raw = localStorage.getItem(MAP_LAYERS_STORAGE_KEY);
    return normalizeSavedPrefs(raw ? (JSON.parse(raw) as SavedLayerPrefs) : null);
  } catch {
    return normalizeSavedPrefs(null);
  }
}

export function saveLayerPrefs(state: StrikeMapBasemapState): void {
  try {
    localStorage.setItem(
      MAP_LAYERS_STORAGE_KEY,
      JSON.stringify({
        baseLayer: state.baseLayer,
        mapTheme: state.mapTheme,
        labelsOn: state.labelsOn,
      })
    );
  } catch {
    /* ignore quota / private mode */
  }
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

function maptilerLayerContainer(layer: ReturnType<typeof maptilerLayer>): HTMLElement | null {
  const host = layer as ReturnType<typeof maptilerLayer> & {
    getContainer?: () => HTMLElement;
  };
  return host.getContainer?.()?.parentElement ?? null;
}

function createMaptilerBaseLayer(styleId: string): ReturnType<typeof maptilerLayer> {
  const layer = maptilerLayer({
    apiKey: MAPTILER_KEY,
    style: maptilerStyleUrl(styleId),
    attributionControl: false,
  } as Parameters<typeof maptilerLayer>[0]);

  layer.on("ready", () => {
    removeInjectedMapControls(maptilerLayerContainer(layer));
  });

  return layer;
}

function createKrajiLabelsLayer(styleId: string): ReturnType<typeof maptilerLayer> {
  const layer = maptilerLayer({
    apiKey: MAPTILER_KEY,
    style: maptilerStyleUrl(styleId),
    attribution: "",
    attributionControl: false,
    pane: MAPTILER_OVERLAY_PANE,
  } as Parameters<typeof maptilerLayer>[0] & L.LayerOptions);

  layer.on("ready", () => {
    hideNonLabelLayers(layer);
    removeInjectedMapControls(maptilerLayerContainer(layer));
  });
  layer.on("add", () => {
    removeInjectedMapControls(maptilerLayerContainer(layer));
  });

  return layer;
}

function createSatelliteLayer(): L.TileLayer {
  return L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: SATELLITE_ATTRIBUTION, maxZoom: 19 }
  );
}

export function borderStyleForState(state: StrikeMapBasemapState): L.PathOptions {
  return state.baseLayer === LAYER_NAME_MAP && state.mapTheme === "light"
    ? { color: "#5c6570", weight: 1.5, opacity: 0.9, fill: false }
    : { color: "#ffffff", weight: 2, opacity: 0.95, fill: false };
}

export function syncKrajiLabels(map: L.Map, state: StrikeMapBasemapState): void {
  if (!state.labelsOn || !map.hasLayer(state.krajiMeje)) return;

  const useLightLabels =
    state.mapTheme === "light" && state.baseLayer === LAYER_NAME_MAP;
  const active = useLightLabels ? state.krajiMejeLight : state.krajiMejeDark;
  const inactive = useLightLabels ? state.krajiMejeDark : state.krajiMejeLight;

  if (inactive && state.krajiMeje.hasLayer(inactive)) {
    state.krajiMeje.removeLayer(inactive);
  }
  if (active && !state.krajiMeje.hasLayer(active)) {
    state.krajiMeje.addLayer(active);
  }
}

export function updateBaseMapStyle(state: StrikeMapBasemapState): void {
  state.meteoinfoBase?.setStyle(maptilerStyleUrl(styleIdForTheme(state.mapTheme)));
}

export function updateBorderStyle(state: StrikeMapBasemapState): void {
  if (!state.bordersLayer) return;
  const style = borderStyleForState(state);
  state.bordersLayer.setStyle(() => style);
}

export function switchToMapBaseFromSatellite(map: L.Map, state: StrikeMapBasemapState): void {
  if (state.satellite && map.hasLayer(state.satellite)) {
    map.removeLayer(state.satellite);
  }
  if (state.meteoinfoBase && !map.hasLayer(state.meteoinfoBase)) {
    state.meteoinfoBase.addTo(map);
  }
  state.baseLayer = LAYER_NAME_MAP;
  updateBaseMapStyle(state);
}

export function resetLayersToDefault(
  map: L.Map,
  state: StrikeMapBasemapState,
  closePanel?: () => void
): void {
  if (state.satellite && map.hasLayer(state.satellite)) {
    map.removeLayer(state.satellite);
  }
  if (state.meteoinfoBase && !map.hasLayer(state.meteoinfoBase)) {
    state.meteoinfoBase.addTo(map);
  }
  state.meteoinfoBase?.setStyle(maptilerStyleUrl(STYLE_BASE_DARK));
  state.baseLayer = LAYER_NAME_MAP;
  state.mapTheme = "dark";
  state.labelsOn = true;
  if (!map.hasLayer(state.krajiMeje)) {
    state.krajiMeje.addTo(map);
  }
  syncKrajiLabels(map, state);
  updateBorderStyle(state);
  saveLayerPrefs(state);
  applyMapThemeAttributes(map.getContainer(), state._layersPanel, state);
  state._renderThemeToggle?.();
  closePanel?.();
  removeInjectedMapControls(map.getContainer());
}

export function applyMapThemeAttributes(
  mapContainer: HTMLElement | null | undefined,
  layersPanel: HTMLElement | null | undefined,
  state: StrikeMapBasemapState
): void {
  const theme = state.mapTheme === "light" ? "light" : "dark";
  mapContainer?.setAttribute("data-map-theme", theme);
  layersPanel?.setAttribute("data-map-theme", theme);
  enableThemeToggle(state);
}

export function enableThemeToggle(state: StrikeMapBasemapState): void {
  const btn = state._themeBtn;
  const wrap = state._themeWrap;
  if (!btn || !wrap) return;
  wrap.classList.remove("theme-toggle-disabled");
  btn.disabled = false;
  btn.title = "preklopi temo zemljevida";
}

function loadCountryBorders(map: L.Map, state: StrikeMapBasemapState, mobile: boolean): void {
  const bordersLayer = L.geoJSON(undefined, {
    pane: STREKO_VECTOR_PANE,
    style: () => borderStyleForState(state),
    interactive: false,
  });

  const addData = () => {
    void fetch("/assets/meje_drzav.geojson")
      .then((res) => (res.ok ? res.json() : null))
      .then((geojson) => {
        if (!geojson || !map.getContainer().isConnected) return;
        bordersLayer.addData(geojson);
      })
      .catch(() => {});
  };

  bordersLayer.addTo(map);
  state.bordersLayer = bordersLayer;

  if (mobile) {
    window.setTimeout(addData, 800);
  } else {
    addData();
  }
}

export function initStrikeMapBasemap(
  map: L.Map,
  container: HTMLElement,
  mobile: boolean
): StrikeMapBasemapState {
  const saved = loadSavedLayerPrefs();

  const state: StrikeMapBasemapState = {
    baseLayer: LAYER_NAME_MAP,
    mapTheme: "dark",
    labelsOn: true,
    bordersLayer: null,
    krajiMeje: L.layerGroup(),
    krajiMejeDark: null,
    krajiMejeLight: null,
    meteoinfoBase: null,
    satellite: null,
  };

  state.satellite = createSatelliteLayer();
  state.meteoinfoBase = createMaptilerBaseLayer(styleIdForTheme(saved.mapTheme));
  state.krajiMejeDark = createKrajiLabelsLayer(STYLE_KRAJI_DARK);
  state.krajiMejeLight = createKrajiLabelsLayer(STYLE_KRAJI_LIGHT);

  state.baseLayer = saved.baseLayer;
  state.mapTheme = saved.mapTheme;
  state.labelsOn = saved.labelsOn;

  if (saved.baseLayer === LAYER_NAME_SATELLITE) {
    state.satellite.addTo(map);
  } else {
    state.meteoinfoBase.addTo(map);
  }

  if (saved.labelsOn) {
    state.krajiMeje.addTo(map);
    syncKrajiLabels(map, state);
  }

  loadCountryBorders(map, state, mobile);

  const onMaptilerLayerChange = (layer: L.Layer) => {
    if (!isMaptilerSdkLayer(layer)) return;
    syncStrikeMapAttribution(map);
  };

  map.on("layeradd", (event) => {
    removeInjectedMapControls(container);
    onMaptilerLayerChange(event.layer);
  });
  map.on("layerremove", (event) => {
    onMaptilerLayerChange(event.layer);
  });

  applyMapThemeAttributes(container, state._layersPanel, state);
  removeInjectedMapControls(container);
  syncStrikeMapAttribution(map);

  return state;
}

export { isMaptilerSdkLayer };
