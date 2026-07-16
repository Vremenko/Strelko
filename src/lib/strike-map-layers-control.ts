import L from "leaflet";
import {
  LAYER_NAME_LABELS,
  LAYER_NAME_MAP,
  LAYER_NAME_SATELLITE,
  removeInjectedMapControls,
  syncStrikeMapAttribution,
} from "./strike-map-labels";
import {
  applyMapThemeAttributes,
  resetLayersToDefault,
  saveLayerPrefs,
  syncKrajiLabels,
  switchToMapBaseFromSatellite,
  type StrikeMapBasemapState,
  updateBaseMapStyle,
  updateBorderStyle,
} from "./strike-map-basemap";

const ICON_LAYERS =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3.5 4 8 12 12.5 20 8z" fill="currentColor"/><path d="M4 12 12 16.5 20 12 17.3 10.5 12 13.5 6.7 10.5z" fill="currentColor"/><path d="M4 16 12 20.5 20 16 17.3 14.5 12 17.5 6.7 14.5z" fill="currentColor"/></svg>';

const ICON_SUN =
  '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><g fill="currentColor"><rect x="11" y="1" width="2" height="3" rx="0.3"/><rect x="11" y="20" width="2" height="3" rx="0.3"/><rect x="1" y="11" width="3" height="2" rx="0.3"/><rect x="20" y="11" width="3" height="2" rx="0.3"/><rect x="4.5" y="4.5" width="2" height="3" rx="0.3" transform="rotate(-45 5.5 6)"/><rect x="17.5" y="4.5" width="2" height="3" rx="0.3" transform="rotate(45 18.5 6)"/><rect x="4.5" y="16.5" width="2" height="3" rx="0.3" transform="rotate(45 5.5 18)"/><rect x="17.5" y="16.5" width="2" height="3" rx="0.3" transform="rotate(-45 18.5 18)"/></g></svg>';

const ICON_MOON =
  '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/></svg>';

type StrikeMapLayersControlInstance = L.Control.Layers & {
  _strikeState?: StrikeMapBasemapState;
  _panel?: HTMLElement;
  _expandSafely: () => void;
};

type StrikeMapLayersControlCtor = new (
  baseLayers?: Record<string, L.Layer>,
  overlays?: Record<string, L.Layer>,
  options?: L.Control.LayersOptions
) => StrikeMapLayersControlInstance;

const StrikeMapLayersControl = L.Control.Layers.extend({
  _expandSafely() {},
  _initContainer() {},

  onAdd(map: L.Map) {
    const self = this as unknown as StrikeMapLayersControlInstance;
    const onAdd = L.Control.Layers.prototype.onAdd;
    if (!onAdd) {
      throw new Error("Leaflet layers control missing onAdd");
    }
    const container = onAdd.call(self, map) as HTMLElement;
    L.DomEvent.off(
      container,
      { mouseenter: self._expandSafely, mouseleave: self.collapse },
      self
    );

    const list = container.querySelector(".leaflet-control-layers-list");
    const toggle = container.querySelector(".leaflet-control-layers-toggle") as HTMLElement | null;
    if (toggle) {
      toggle.setAttribute("title", "uredi prikaz karte in slojev");
      toggle.innerHTML = ICON_LAYERS;
    }

    const panel = L.DomUtil.create("div", "leaflet-layers-panel strike-map-layers-panel");
    panel.style.display = "none";
    document.body.appendChild(panel);
    self._panel = panel;

    const closeBtn = L.DomUtil.create("button", "leaflet-control-layers-close", panel);
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Zapri meni slojev");
    closeBtn.innerHTML = "&#10005;";
    panel.appendChild(list as Node);

    L.DomUtil.create("div", "leaflet-reset-layers-spacer", list as HTMLElement).setAttribute(
      "aria-hidden",
      "true"
    );

    const resetBtn = L.DomUtil.create("button", "leaflet-reset-layers", list as HTMLElement);
    resetBtn.type = "button";
    resetBtn.title = "ponastavi podlage in sloje";
    resetBtn.innerHTML =
      '<span class="leaflet-reset-layers-icon" aria-hidden="true">&#8617;</span>' +
      '<span class="leaflet-reset-layers-label">ponastavi podlage in sloje</span>';
    L.DomEvent.disableClickPropagation(resetBtn);
    L.DomEvent.disableScrollPropagation(resetBtn);

    const positionPanel = () => {
      if (!toggle) return;
      const rect = toggle.getBoundingClientRect();
      panel.style.top = `${rect.top - 10}px`;
      panel.style.right = `${window.innerWidth - rect.left + 10}px`;
    };

    const closePanel = () => {
      panel.classList.remove("open");
      toggle?.classList.remove("layers-active");
      container.classList.remove("leaflet-control-layers-expanded");
      window.setTimeout(() => {
        if (!panel.classList.contains("open")) {
          panel.style.display = "none";
        }
      }, 150);
    };

    const openPanel = () => {
      positionPanel();
      panel.style.display = "block";
      window.setTimeout(() => panel.classList.add("open"), 10);
      toggle?.classList.add("layers-active");
      container.classList.add("leaflet-control-layers-expanded");
    };

    toggle?.addEventListener("click", (event) => {
      L.DomEvent.stopPropagation(event);
      L.DomEvent.preventDefault(event);
      if (panel.classList.contains("open")) {
        closePanel();
      } else {
        openPanel();
      }
    });

    closeBtn.addEventListener("click", (event) => {
      L.DomEvent.stopPropagation(event);
      closePanel();
    });

    const state = self._strikeState;
    resetBtn.onclick = () => {
      if (state) {
        resetLayersToDefault(map, state, closePanel);
      }
    };

    document.addEventListener("click", (event) => {
      if (
        panel.classList.contains("open") &&
        !container.contains(event.target as Node) &&
        !panel.contains(event.target as Node)
      ) {
        closePanel();
      }
    });

    map.on("movestart", closePanel);
    map.on("zoomstart", closePanel);
    L.DomEvent.disableClickPropagation(panel);
    L.DomEvent.disableScrollPropagation(panel);

    return container;
  },

  onRemove() {
    const self = this as unknown as StrikeMapLayersControlInstance;
    const panel = self._panel;
    panel?.parentNode?.removeChild(panel);
  },
}) as unknown as StrikeMapLayersControlCtor;

function toggleMapTheme(map: L.Map, state: StrikeMapBasemapState): void {
  state.mapTheme = state.mapTheme === "light" ? "dark" : "light";
  if (state.baseLayer === LAYER_NAME_SATELLITE) {
    switchToMapBaseFromSatellite(map, state);
  } else {
    updateBaseMapStyle(state);
  }
  updateBorderStyle(state);
  syncKrajiLabels(map, state);
  saveLayerPrefs(state);
  state._renderThemeToggle?.();
  applyMapThemeAttributes(map.getContainer(), state._layersPanel, state);
  removeInjectedMapControls(map.getContainer());
}

export function addStrikeMapLayerControls(map: L.Map, state: StrikeMapBasemapState): void {
  const baseLayers: Record<string, L.Layer> = {};
  if (state.meteoinfoBase) baseLayers[LAYER_NAME_MAP] = state.meteoinfoBase;
  if (state.satellite) baseLayers[LAYER_NAME_SATELLITE] = state.satellite;

  const overlays: Record<string, L.Layer> = {
    [LAYER_NAME_LABELS]: state.krajiMeje,
  };

  const layersControl = new StrikeMapLayersControl(baseLayers, overlays, {
    collapsed: true,
    position: "topright",
  });

  layersControl._strikeState = state;
  layersControl.addTo(map);
  state._layersPanel = layersControl._panel;

  const ThemeControl = L.Control.extend({
    options: { position: "topright" },
    onAdd() {
      const wrap = L.DomUtil.create("div", "leaflet-control-theme-wrap");
      const btn = L.DomUtil.create("button", "theme-toggle", wrap);
      btn.type = "button";
      btn.setAttribute("aria-label", "Preklopi temo ozadja zemljevida");
      state._themeBtn = btn;
      state._themeWrap = wrap;

      const render = () => {
        const isLight = state.mapTheme === "light";
        btn.innerHTML = isLight ? ICON_MOON : ICON_SUN;
        btn.classList.toggle("theme-light", isLight);
        btn.classList.toggle("theme-dark", !isLight);
      };

      render();
      state._renderThemeToggle = render;

      L.DomEvent.on(btn, "click", (event) => {
        L.DomEvent.stopPropagation(event);
        toggleMapTheme(map, state);
      });
      L.DomEvent.disableClickPropagation(wrap);
      L.DomEvent.disableScrollPropagation(wrap);
      return wrap;
    },
  });

  map.addControl(new ThemeControl());

  map.on("baselayerchange", (event: L.LayersControlEvent) => {
    state.baseLayer = event.name === LAYER_NAME_SATELLITE ? LAYER_NAME_SATELLITE : LAYER_NAME_MAP;
    if (state.baseLayer === LAYER_NAME_MAP) {
      updateBaseMapStyle(state);
    }
    updateBorderStyle(state);
    syncKrajiLabels(map, state);
    saveLayerPrefs(state);
    applyMapThemeAttributes(map.getContainer(), state._layersPanel, state);
    removeInjectedMapControls(map.getContainer());
    syncStrikeMapAttribution(map);
  });

  map.on("overlayadd", (event: L.LayersControlEvent) => {
    if (event.name === LAYER_NAME_LABELS) {
      state.labelsOn = true;
      syncKrajiLabels(map, state);
      saveLayerPrefs(state);
      syncStrikeMapAttribution(map);
    }
  });

  map.on("overlayremove", (event: L.LayersControlEvent) => {
    if (event.name === LAYER_NAME_LABELS) {
      state.labelsOn = false;
      saveLayerPrefs(state);
      syncStrikeMapAttribution(map);
    }
  });

  applyMapThemeAttributes(map.getContainer(), state._layersPanel, state);
}
