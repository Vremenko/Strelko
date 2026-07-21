/**
 * Regresija: upravljanje interaktivnih zemljevidov (pointer, wheel, 2-prsta).
 * Zagon: npx tsx scripts/verify-map-gestures.ts
 *
 * Mobilno: Leaflet touchZoom za pinch + lastni pan le ko ni pincha (brez dvojne obdelave).
 * Zaznava: hover+fine = namizje (Android ne sme napačno dobiti desktop veje).
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve("/home/maximus/projects/Strelko");
const STRELE2 = resolve("/home/maximus/projects/strele2");

const GESTURES = resolve(ROOT, "src/lib/strike-map-gestures.ts");
const STRIKE_MAP = resolve(ROOT, "src/lib/strike-map.ts");
const PICK_MAP = resolve(ROOT, "src/lib/pick-location-map.ts");
const PAGES_CSS = resolve(ROOT, "src/pages-extra.css");
const MAP_EMBED = resolve(STRELE2, "web/public/map-embed.html");
const MAP_HTML = resolve(STRELE2, "web/map.html");

for (const p of [GESTURES, STRIKE_MAP, PICK_MAP, PAGES_CSS, MAP_EMBED, MAP_HTML]) {
  assert.ok(existsSync(p), `manjka: ${p}`);
}

const gestures = readFileSync(GESTURES, "utf8");
const strikeMap = readFileSync(STRIKE_MAP, "utf8");
const pickMap = readFileSync(PICK_MAP, "utf8");
const css = readFileSync(PAGES_CSS, "utf8");
const embed = readFileSync(MAP_EMBED, "utf8");
const mapHtml = readFileSync(MAP_HTML, "utf8");

function mobileBindSlice(src: string, startMarker: string, endMarker: string): string {
  const a = src.indexOf(startMarker);
  const b = src.indexOf(endMarker, a + 1);
  assert.ok(a >= 0 && b > a, `slice ${startMarker}`);
  return src.slice(a, b);
}

/* ——— Pointer zaznavanje: hover+fine (Android-safe) ——— */
for (const [label, src] of [
  ["strike-map-gestures", gestures],
  ["map-embed", embed],
  ["map.html", mapHtml],
] as const) {
  assert.ok(
    src.includes("(hover: hover) and (pointer: fine)"),
    `${label}: hover+pointer fine`
  );
  assert.ok(
    src.includes("(any-hover: hover) and (any-pointer: fine)"),
    `${label}: any-hover+any-pointer fine`
  );
}

assert.ok(strikeMap.includes("prefersMobileMapPointer"));
assert.ok(pickMap.includes("prefersMobileMapPointer"));
assert.ok(!strikeMap.includes('matchMedia("(any-pointer: fine)")'));
assert.ok(!pickMap.includes('matchMedia("(any-pointer: fine)")'));

assert.ok(
  !/function\s+bindMapZoomGestures[\s\S]{0,200}isMobileView\(\)/.test(embed),
  "map-embed: bindMapZoomGestures ne sme uporabljati isMobileView"
);
assert.ok(
  !/function\s+bindMapZoomGestures[\s\S]{0,200}isMobileView\(\)/.test(mapHtml),
  "map.html: bindMapZoomGestures ne sme uporabljati isMobileView"
);

assert.ok(gestures.includes("prefersDesktopMapPointer"));
assert.ok(gestures.includes("prefersMobileMapPointer"));
assert.ok(gestures.includes("bindStreleMapZoomGestures"));

/* ——— Namizje ——— */
assert.ok(!gestures.includes("ctrlKey"));
assert.ok(!gestures.includes("Ctrl +"));
assert.ok(!gestures.includes("Za povečavo"));
assert.ok(!gestures.includes('addEventListener("wheel"'));
assert.ok(gestures.includes("map.scrollWheelZoom.enable()"));
assert.ok(gestures.includes("map.dragging.enable()"));
assert.ok(
  !/function bindDesktopGestures[\s\S]*?setZoomAround/.test(gestures),
  "desktop veja: brez setZoomAround"
);

for (const [label, src] of [
  ["map-embed", embed],
  ["map.html", mapHtml],
] as const) {
  assert.ok(!src.includes("Ctrl + kolesce"), `${label}: brez Ctrl namiga`);
  assert.ok(!src.includes("Za povečavo zemljevida"), `${label}: brez Ctrl povečave`);
  assert.ok(src.includes("prefersDesktopMapPointer") || src.includes("shouldBindDesktopMapGestures"));
  assert.ok(src.includes("scrollWheelZoom.enable()"), `${label}: Leaflet wheel`);
  assert.ok(src.includes("deskUserViewportLocked"), `${label}: zaklep pogleda`);
  assert.ok(src.includes("lockDesktopUserViewport"), `${label}: lockDesktopUserViewport`);
  assert.ok(
    !/__streleDesktopGestures[\s\S]{0,1200}setZoomAround/.test(src),
    `${label}: brez custom setZoomAround wheel zooma`
  );
}

/* ——— Telefon: Leaflet touchZoom + lastni pan samo ko ni pincha ——— */
assert.ok(gestures.includes("Premaknite zemljevid z dvema prstoma."));
assert.ok(!gestures.includes("strele-map-two-finger-hint-shown"));
assert.ok(!gestures.includes("sessionStorage"));
assert.ok(gestures.includes("HINT_HIDE_AFTER_TOUCH_MS = 500"));
assert.ok(gestures.includes("hintArmedForGesture"));
assert.ok(gestures.includes("map.dragging.disable()"));
assert.ok(gestures.includes("map.touchZoom.enable()"));
assert.ok(!gestures.includes("setZoomAround"), "brez lastnega pinch setZoomAround (regresija iPhone)");
assert.ok(!gestures.includes("Math.log2"), "brez lastnega pinch scale");
assert.ok(gestures.includes("multiPinching"));
assert.ok(gestures.includes("e.touches.length >= 2"));
assert.ok(!gestures.includes("1600"));

const gestMobile = mobileBindSlice(gestures, "function bindMobileGestures", "function bindDesktopGestures");
assert.ok(gestMobile.includes("touchZoom.enable()"), "mobilno: Leaflet touchZoom ON");
assert.ok(!gestMobile.includes("touchZoom.disable()"), "mobilno: ne disable touchZoom");
assert.ok(gestMobile.includes("panBy"), "mobilno: lastni pan");
assert.ok(
  /multiPinching\s*=\s*true;\s*\n\s*(?:\/\*[\s\S]*?\*\/\s*)?return;/.test(gestMobile),
  "mobilno: ob pinch return (prepusti Leafletu, ne pan)"
);

for (const [label, src] of [
  ["map-embed", embed],
  ["map.html", mapHtml],
] as const) {
  assert.ok(src.includes("Premaknite zemljevid z dvema prstoma."), `${label}: namig`);
  assert.ok(src.includes("hintArmedForGesture"), `${label}: namig`);
  assert.ok(src.includes("HINT_HIDE_AFTER_TOUCH_MS = 500"), `${label}: timer`);
  const slice = mobileBindSlice(src, "function bindMobileMapGestures", "function bindMapZoomGestures");
  assert.ok(slice.includes("touchZoom.enable()"), `${label}: Leaflet touchZoom`);
  assert.ok(!slice.includes("setZoomAround"), `${label}: brez setZoomAround`);
  assert.ok(!slice.includes("Math.log2"), `${label}: brez log2 pinch`);
  assert.ok(/touch-action:\s*pan-y\s+pinch-zoom/.test(src), `${label}: pan-y pinch-zoom`);
}

const hintCss = css.slice(css.indexOf(".strele-map-wheel-hint"));
assert.ok(hintCss.includes("pointer-events: none"));
assert.ok(/touch-action:\s*pan-y\s+pinch-zoom/.test(css), "strike-map CSS: pan-y pinch-zoom");

assert.ok(strikeMap.includes("bindStreleMapZoomGestures"));
assert.ok(pickMap.includes("bindStreleMapZoomGestures"));
assert.ok(strikeMap.includes("scrollWheelZoom: false"));
assert.ok(pickMap.includes("scrollWheelZoom: false"));
assert.ok(/touchZoom:\s*mobile/.test(strikeMap), "strike-map: touchZoom: mobile");
assert.ok(/touchZoom:\s*mobile/.test(pickMap), "pick-map: touchZoom: mobile");

for (const name of ["obcina-embed.html", "obcina-preview.html", "obcina-widget.html"]) {
  const w = readFileSync(resolve(STRELE2, "web/public", name), "utf8");
  assert.ok(w.includes("scrollWheelZoom: false"), `${name}: fiksiran zoom`);
  assert.ok(w.includes("dragging: false"), `${name}: brez vlečenja`);
  assert.ok(!w.includes("bindMapZoomGestures"), `${name}: ni gest binderja`);
}

assert.equal((embed.match(/Premaknite zemljevid z dvema prstoma\./g) || []).length, 1);
assert.equal((mapHtml.match(/Premaknite zemljevid z dvema prstoma\./g) || []).length, 1);

console.log("verify-map-gestures: OK");
console.log("namizje: wheel + drag");
console.log("mobilno: Leaflet pinch XOR lastni pan; detection=hover+fine");
