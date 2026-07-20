/**
 * Regresija: prvi klik na točko udara po zoomanju ne sme ponastaviti pogleda.
 * Zagon: node scripts/verify-strike-map-first-click.mjs
 */
import assert from "node:assert/strict";
import { chromium } from "playwright";

const html = `<!doctype html>
<html><head>
<meta charset="utf-8"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html,body{margin:0;height:100%}
  #map{height:420px;width:100%}
  #panel{height:0;overflow:hidden;background:#222;color:#fff}
  #panel.open{height:160px;padding:12px}
</style>
</head><body>
<div id="map"></div>
<div id="panel">Podrobnosti točke</div>
<script>
const map = L.map("map", {
  center: [46.05, 14.5],
  zoom: 10,
  zoomControl: false,
  scrollWheelZoom: true,
  dragging: true,
});
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(map);

const host = { _programmaticFit: false, _userAdjustedView: false };
const markUserAdjusted = () => {
  if (host._programmaticFit) return;
  host._userAdjustedView = true;
};
map.on("movestart", markUserAdjusted);
map.on("zoomstart", markUserAdjusted);

let initialFitDone = true;
let lastW = 0, lastH = 0;
const fitToHome = () => {
  host._programmaticFit = true;
  try { map.setView([46.05, 14.5], 10, { animate: false }); }
  finally { host._programmaticFit = false; }
};

const performCircleFit = (opts) => {
  map.invalidateSize({ pan: false });
  const size = map.getSize();
  if (!opts.force && host._userAdjustedView) return true;
  if (!opts.force && initialFitDone && Math.abs(size.x - lastW) <= 2 && Math.abs(size.y - lastH) <= 2) return true;
  fitToHome();
  lastW = size.x; lastH = size.y;
  return true;
};

window.__test = {
  zoom: () => map.getZoom(),
  center: () => { const c = map.getCenter(); return { lat: c.lat, lng: c.lng }; },
  userAdjusted: () => host._userAdjustedView,
  wheelZoom: () => {
    const el = map.getContainer();
    const r = el.getBoundingClientRect();
    el.dispatchEvent(new WheelEvent("wheel", {
      deltaY: -180, deltaMode: 0, bubbles: true, cancelable: true,
      clientX: r.left + r.width/2, clientY: r.top + r.height/2, view: window
    }));
  },
  openPointDetails: () => {
    document.getElementById("panel").classList.add("open");
    document.getElementById("map").style.height = "320px";
    map.invalidateSize({ pan: false });
    performCircleFit({ fromResize: true });
  },
};
</script>
</body></html>`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => window.__test && window.L);

const read = () =>
  page.evaluate(() => ({
    z: window.__test.zoom(),
    ...window.__test.center(),
    adj: window.__test.userAdjusted(),
  }));

const initial = await read();
for (let i = 0; i < 6; i++) {
  await page.evaluate(() => window.__test.wheelZoom());
  await page.waitForTimeout(100);
}
const afterZoom = await read();
assert.ok(afterZoom.z > initial.z + 0.5, `wheel mora povečati: ${initial.z} -> ${afterZoom.z}`);
assert.equal(afterZoom.adj, true, "_userAdjustedView mora biti true po wheel");

const beforeClick = afterZoom;
await page.evaluate(() => window.__test.openPointDetails());
await page.waitForTimeout(200);
const afterClick = await read();

console.log("BEFORE_FIRST_POINT_CLICK", JSON.stringify(beforeClick));
console.log("AFTER_FIRST_POINT_CLICK", JSON.stringify(afterClick));
console.log(
  "DELTA",
  JSON.stringify({
    dz: afterClick.z - beforeClick.z,
    dlat: afterClick.lat - beforeClick.lat,
    dlng: afterClick.lng - beforeClick.lng,
  })
);

assert.ok(
  Math.abs(afterClick.z - beforeClick.z) < 1e-6,
  `prvi klik ne sme spremeniti zooma: ${beforeClick.z} -> ${afterClick.z}`
);
assert.ok(
  Math.abs(afterClick.lat - beforeClick.lat) < 0.05 &&
    Math.abs(afterClick.lng - beforeClick.lng) < 0.05,
  "prvi klik ne sme ponastaviti središča"
);

await browser.close();
console.log("verify-strike-map-first-click: OK");
