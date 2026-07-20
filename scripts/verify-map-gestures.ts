/**
 * Regresija: upravljanje interaktivnih zemljevidov (pointer, wheel, 2-prsta).
 * Zagon: npx tsx scripts/verify-map-gestures.ts
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

/* ——— Pointer zaznavanje (ne širina / UA) ——— */
for (const [label, src] of [
  ["strike-map-gestures", gestures],
  ["strike-map", strikeMap],
  ["map-embed", embed],
  ["map.html", mapHtml],
] as const) {
  assert.ok(src.includes("(any-pointer: fine)"), `${label}: any-pointer: fine`);
}

/* Geste ne smejo biti vezane samo na širino zaslona */
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

/* ——— Namizje: wheel brez Ctrl, brez Ctrl namiga ——— */
assert.ok(!gestures.includes("ctrlKey"));
assert.ok(!gestures.includes("Ctrl +"));
assert.ok(!gestures.includes("Za povečavo"));
assert.ok(gestures.includes("addEventListener(\"wheel\""));
assert.ok(gestures.includes("ev.preventDefault()"));
assert.ok(gestures.includes("map.dragging.enable()"));

for (const [label, src] of [
  ["map-embed", embed],
  ["map.html", mapHtml],
] as const) {
  assert.ok(!src.includes("Ctrl + kolesce"), `${label}: brez Ctrl namiga`);
  assert.ok(!src.includes("Za povečavo zemljevida"), `${label}: brez Ctrl povečave`);
  assert.ok(src.includes("prefersDesktopMapPointer") || src.includes("shouldBindDesktopMapGestures"));
  assert.ok(src.includes("__streleDesktopGestures") || src.includes("bindMapZoomGestures"));
  /* wheel handler ne sme zahtevati ctrlKey pred zoomom */
  assert.ok(
    !/function\s+ctrlZoom|if\s*\(\s*ctrlZoom\(/.test(src),
    `${label}: brez ctrlZoom gate`
  );
}

/* ——— Telefon: namig 1×, dva prsta, pointer-events none ——— */
assert.ok(gestures.includes("Premaknite zemljevid z dvema prstoma."));
assert.ok(gestures.includes("strele-map-two-finger-hint-shown"));
assert.ok(gestures.includes("scheduleHintOnce"));
assert.ok(gestures.includes("map.dragging.disable()"));
assert.ok(gestures.includes("touchstart"));
assert.ok(gestures.includes("e.touches.length >= 2"));

for (const [label, src] of [
  ["map-embed", embed],
  ["map.html", mapHtml],
] as const) {
  assert.ok(src.includes("Premaknite zemljevid z dvema prstoma."), `${label}: 2-prsta namig`);
  assert.ok(src.includes("strele-map-two-finger-hint-shown"), `${label}: sessionStorage ključ`);
  assert.ok(src.includes("mobileMapHintAlreadyShown") || src.includes("markMobileMapHintShown"));
}

const hintCss = css.slice(css.indexOf(".strele-map-wheel-hint"));
assert.ok(hintCss.includes("pointer-events: none"), "CSS hint ne sme loviti klikov");
assert.ok(embed.includes(".strele-map-wheel-hint") && /strele-map-wheel-hint[\s\S]{0,400}pointer-events:\s*none/.test(embed));
assert.ok(mapHtml.includes(".strele-map-wheel-hint") && /strele-map-wheel-hint[\s\S]{0,400}pointer-events:\s*none/.test(mapHtml));

/* ——— Vezava na Strelko zemljevide ——— */
assert.ok(strikeMap.includes("bindStreleMapZoomGestures"));
assert.ok(pickMap.includes("bindStreleMapZoomGestures"));
assert.ok(strikeMap.includes('scrollWheelZoom: false'));
assert.ok(pickMap.includes('scrollWheelZoom: false'));

/* ——— Widgeti občin ostanejo neinteraktivni (ni sprememb gest) ——— */
for (const name of ["obcina-embed.html", "obcina-preview.html", "obcina-widget.html"]) {
  const w = readFileSync(resolve(STRELE2, "web/public", name), "utf8");
  assert.ok(w.includes("scrollWheelZoom: false"), `${name}: fiksiran zoom`);
  assert.ok(w.includes("dragging: false"), `${name}: brez vlečenja`);
  assert.ok(!w.includes("bindMapZoomGestures"), `${name}: ni gest binderja`);
}

/* ——— Brez podvojenega Ctrl namiga v aktivni kodi ——— */
assert.ok(!gestures.includes("Ctrl + kolesce ali vlečenje miške"));
assert.equal(
  (embed.match(/Premaknite zemljevid z dvema prstoma\./g) || []).length,
  1,
  "map-embed: en string namiga"
);
assert.equal(
  (mapHtml.match(/Premaknite zemljevid z dvema prstoma\./g) || []).length,
  1,
  "map.html: en string namiga"
);

console.log("verify-map-gestures: OK");
console.log("namizje: wheel zoom brez Ctrl, brez Ctrl namiga");
console.log("telefon: 1 prst=stran, 2 prsta=zemljevid, namig 1×, hint pointer-events:none");
console.log("pointer: any-pointer:fine → desktop (tudi touch laptop)");
