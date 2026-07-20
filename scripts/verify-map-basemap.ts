/**
 * Regresija: zemljevidna podloga (strelko-dark.json) in map-embed.
 * Zagon: npx tsx scripts/verify-map-basemap.ts
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildPublicEmbedHtml,
  parsePublicPeriodParam,
} from "../src/lib/public-embed.ts";

const STYLE_PATH = resolve(
  "/home/maximus/projects/strele2/web/public/styles/strelko-dark.json"
);
const MAP_EMBED = resolve(
  "/home/maximus/projects/strele2/web/public/map-embed.html"
);
const PAGES_CSS = resolve("/home/maximus/projects/Strelko/src/pages-extra.css");
const PUBLIC_EMBED = resolve(
  "/home/maximus/projects/Strelko/src/lib/public-embed.ts"
);

assert.ok(existsSync(STYLE_PATH), "strelko-dark.json mora obstajati");
const styleSize = statSync(STYLE_PATH).size;
assert.ok(styleSize > 1000, `strelko-dark.json ne sme biti prazen (size=${styleSize})`);

const style = JSON.parse(readFileSync(STYLE_PATH, "utf8"));
assert.equal(style.version, 8);
assert.ok(style.sources, "MapLibre style potrebuje sources");
assert.ok(style.sources.openmaptiles || style.sources.ne2_shaded, "manjkajo tile sources");
assert.ok(Array.isArray(style.layers) && style.layers.length > 0);

const mapHtml = readFileSync(MAP_EMBED, "utf8");
assert.ok(mapHtml.includes("createOpenFreeMapBaseLayer"));
assert.ok(mapHtml.includes("USE_OPENFREEMAP_BASE"));
assert.ok(mapHtml.includes("strelko-dark.json"));
assert.ok(mapHtml.includes("grid=0") || mapHtml.includes('grid") === "0"'));
assert.ok(
  !/if\s*\([^)]*grid[^)]*\)\s*\{[^}]*createOpenFreeMapBaseLayer/s.test(mapHtml),
  "grid ne sme pogojno ustvarjati podloge"
);
assert.ok(mapHtml.includes("L.maplibreGL") || mapHtml.includes("maplibreGL"));
assert.ok(mapHtml.includes("embed-public-map"));
assert.ok(!/\.leaflet-tile-pane\s*\{[^}]*display\s*:\s*none/s.test(mapHtml));
assert.ok(
  mapHtml.includes(".leaflet-container") &&
    (mapHtml.includes("background: var(--bg)") || mapHtml.includes("background:var(--bg)"))
);

/* Javni zoom / fitBounds po širini vsebnika (meteoinfo + /admin2) */
assert.ok(!mapHtml.includes("PUBLIC_DESKTOP_ZOOM"));
assert.ok(mapHtml.includes("STATISTIKA_DESKTOP_ZOOM = 8"));
assert.ok(mapHtml.includes("desktopInitialZoom"));
assert.ok(mapHtml.includes("isPublicMapEmbed"));
assert.ok(mapHtml.includes("publicInitialZoomForWidth"));
assert.ok(mapHtml.includes("PUBLIC_MIN_ZOOM = 6.5"));
assert.ok(mapHtml.includes("PUBLIC_ZOOM_BY_WIDTH"));
assert.ok(mapHtml.includes("fitPublicMapToSlovenia"));
assert.ok(mapHtml.includes("zoomSnap: 0.5"));
assert.ok(mapHtml.includes("zoomDelta: 0.5"));
assert.ok(mapHtml.includes("PUBLIC_MOB_FIT_MAX_ZOOM = 11"));
assert.ok(mapHtml.includes("STATISTIKA_MOB_FIT_MAX_ZOOM = 10"));
assert.ok(mapHtml.includes("resizeMaplibreBasemap"));

/* Javni: geste (fine pointer = wheel zoom; mobilno = 2 prsta + namig ob vsaki enoprstni gesti); datum; brez gumba Občine */
assert.ok(!mapHtml.includes("publicMapInteractive"));
assert.ok(mapHtml.includes("prefersDesktopMapPointer") || mapHtml.includes("hasFinePointer"));
assert.ok(mapHtml.includes("shouldBindDesktopMapGestures"));
assert.ok(mapHtml.includes("(any-pointer: fine)"));
assert.ok(!mapHtml.includes("Ctrl + kolesce ali vlečenje miške"));
assert.ok(!mapHtml.includes("Za povečavo zemljevida"));
assert.ok(mapHtml.includes("Premaknite zemljevid z dvema prstoma."));
assert.ok(!mapHtml.includes("strele-map-two-finger-hint-shown"));
assert.ok(mapHtml.includes("hintArmedForGesture"));
assert.ok(mapHtml.includes("strele-map-wheel-hint"));
assert.ok(!mapHtml.includes("if (window.innerWidth < 900) return;"));
assert.ok(mapHtml.includes('viewTabs.remove()') || mapHtml.includes('getElementById("mapViewTabs")'));
assert.ok(mapHtml.includes("period-label-static"));
assert.ok(mapHtml.includes("body.embed-public-map"));
assert.ok(
  mapHtml.includes("period-label-static"),
  "javni datum mora ostati viden"
);

/* Plačljiva obdobja: remove iz DOM ob HIDE_GRID_TAB */
assert.ok(mapHtml.includes("if (!isFreePeriodSelectValue(opt.value)) opt.remove()"));
assert.ok(mapHtml.includes('getElementById("periodCustomOption")'));

const css = readFileSync(PAGES_CSS, "utf8");
assert.equal(/\.leaflet-tile-pane\s*\{[^}]*transparent/s.test(css), false);
const publicBlockStart = css.indexOf("/* ——— Javni embed");
assert.ok(publicBlockStart >= 0);
const publicBlock = css.slice(publicBlockStart);
assert.ok(publicBlock.includes("html.public-embed-root"));
assert.ok(publicBlock.includes("public-embed-page--map"));
assert.ok(publicBlock.includes("touch-action: pan-y"));
assert.ok(
  !publicBlock.includes(".leaflet-tile-pane") &&
    !publicBlock.includes(".leaflet-map-pane")
);

const pubTs = readFileSync(PUBLIC_EMBED, "utf8");
assert.ok(pubTs.includes("strele-public-embed-wheel"));

const sampleCharts = buildPublicEmbedHtml("charts", "7d", { frameId: "v-charts" });
const sampleMap = buildPublicEmbedHtml("map", "7d", { frameId: "v-map" });
assert.equal(sampleCharts.includes("strele-public-embed-wheel"), false);
assert.equal(sampleMap.includes("strele-public-embed-wheel"), false);
assert.equal(sampleMap.includes("strelko-pe__overlay"), false);
assert.ok(!sampleMap.includes("pointer-events:none"), "zemljevid nima PE:none");
assert.ok(sampleMap.includes("max-width:none"));

const archiveEmbed = readFileSync(
  resolve("/home/maximus/projects/Strelko/src/lib/archive-embed.ts"),
  "utf8"
);
assert.ok(archiveEmbed.includes('params.set("grid", "0")'));
assert.ok(archiveEmbed.includes("hideGrid"));
assert.ok(archiveEmbed.includes('v: "18"'));

assert.equal(parsePublicPeriodParam("map", "30d"), "7d");
assert.equal(parsePublicPeriodParam("map", "90d"), "7d");
assert.equal(parsePublicPeriodParam("map", "custom"), "7d");
assert.equal(parsePublicPeriodParam("map", "14d"), "7d");
assert.equal(parsePublicPeriodParam("map", "today"), "today");
assert.equal(parsePublicPeriodParam("map", "7d"), "7d");

console.log("verify-map-basemap: OK");
console.log(`strelko-dark.json: ${styleSize} bytes, layers=${style.layers.length}`);
console.log("public zoom by width: 350→6.5 / 400→7 / 700→7.5 / 1100→8.25; statistika desktop zoom 8; free periods: Danes, 7 dni");
