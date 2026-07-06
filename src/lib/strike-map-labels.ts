import L from "leaflet";

export const MAPTILER_KEY = "49h4zzj96Wh7pGHWjiId";
export const STYLE_BASE_DARK = "019c91be-c9e9-7eac-9e88-83d4e8cf7691";
export const STYLE_BASE_LIGHT = "019cde7d-3f45-7c4a-974c-c31f0757f24d";
export const STYLE_KRAJI_DARK = "019cdeec-2c48-7778-9774-ad2176fec7cd";
export const STYLE_KRAJI_LIGHT = "019cf131-5fa7-7706-ab76-3b3fa0899d6e";
export const LAYER_NAME_MAP = "zemljevid";
export const LAYER_NAME_SATELLITE = "satelitska slika";
export const LAYER_NAME_LABELS = "kartografske oznake";
export const MAP_LAYERS_STORAGE_KEY = "strelko_map_layers";
export const MAPTILER_OVERLAY_PANE = "maptilerOverlayPane";
export const STREKO_VECTOR_PANE = "strelkoVectorPane";
export const MAPTILER_ATTRIBUTION =
  '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> ' +
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OSM</a>';
export const SATELLITE_ATTRIBUTION =
  '&copy; <a href="https://www.esri.com/">Esri</a>';

export function removeInjectedMapControls(container: HTMLElement | null): void {
  if (!container) return;
  [".maptiler-ctrl", ".maplibregl-ctrl", ".maplibregl-ctrl-group"].forEach((selector) => {
    container.querySelectorAll(selector).forEach((node) => node.remove());
  });
}

export function isMaptilerSdkLayer(layer: L.Layer): boolean {
  return typeof (layer as { getMaptilerSDKMap?: () => unknown }).getMaptilerSDKMap === "function";
}

export function ensureStrikeMapPanes(map: L.Map): void {
  if (!map.getPane(MAPTILER_OVERLAY_PANE)) {
    map.createPane(MAPTILER_OVERLAY_PANE);
  }
  const overlayPane = map.getPane(MAPTILER_OVERLAY_PANE);
  if (overlayPane) {
    overlayPane.style.zIndex = "450";
    overlayPane.style.pointerEvents = "none";
  }

  if (!map.getPane(STREKO_VECTOR_PANE)) {
    map.createPane(STREKO_VECTOR_PANE);
  }
  const vectorPane = map.getPane(STREKO_VECTOR_PANE);
  if (vectorPane) {
    vectorPane.style.zIndex = "460";
    vectorPane.style.pointerEvents = "none";
  }
}
