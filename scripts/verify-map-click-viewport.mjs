/**
 * Regresija: zoom/središče se po kliku na občino ne sme spremeniti.
 * Zagon (v Playwright okolju): node scripts/verify-map-click-viewport.mjs
 *
 * Beleži zoom in središče pred klikom ter po njem; simulira rast grafa (resize).
 */
import { chromium } from "playwright";

const MAP_URL =
  process.env.MAP_EMBED_URL ||
  "https://strelko.meteoinfo.si/arhiv/public/map-embed.html?period=7d&grid=0";

function almostEqual(a, b, eps = 1e-6) {
  return Math.abs(a - b) <= eps;
}

function viewEqual(a, b) {
  /* Zoom mora ostati enak. Središče sme le minimalno zamakniti invalidateSize
     ob rasti grafa — ne sme pa skočiti nazaj na privzeti pogled. */
  return (
    almostEqual(a.z, b.z, 1e-6) &&
    almostEqual(a.lat, b.lat, 0.01) &&
    almostEqual(a.lng, b.lng, 0.01)
  );
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
  });
  await context.addInitScript(() => {
    const orig = window.matchMedia.bind(window);
    window.matchMedia = (q) => {
      if (String(q).includes("any-pointer: fine")) {
        return {
          matches: true,
          media: q,
          addListener() {},
          removeListener() {},
          addEventListener() {},
          removeEventListener() {},
          onchange: null,
          dispatchEvent() {
            return false;
          },
        };
      }
      return orig(q);
    };
    const i = setInterval(() => {
      if (!window.L?.Map || window.__mapHooked) return;
      window.__mapHooked = true;
      window.L.Map.addInitHook(function () {
        window.__testMap = this;
      });
      clearInterval(i);
    }, 5);
  });

  const page = await context.newPage();
  await page.goto(MAP_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => !!window.__testMap, null, { timeout: 45000 });
  await page.waitForTimeout(2000);

  const readView = () =>
    page.evaluate(() => {
      const c = window.__testMap.getCenter();
      return {
        z: window.__testMap.getZoom(),
        lat: c.lat,
        lng: c.lng,
      };
    });

  const wheelZoom = async () => {
    await page.evaluate(() => {
      const el = window.__testMap.getContainer();
      const r = el.getBoundingClientRect();
      el.dispatchEvent(
        new WheelEvent("wheel", {
          deltaY: -180,
          deltaMode: 0,
          bubbles: true,
          cancelable: true,
          clientX: r.left + r.width / 2,
          clientY: r.top + r.height / 2,
          view: window,
        })
      );
    });
    await page.waitForTimeout(200);
  };

  const initial = await readView();
  for (let i = 0; i < 4; i++) await wheelZoom();
  const afterZoom = await readView();
  if (!(afterZoom.z > initial.z + 0.2)) {
    throw new Error(
      `wheel ni povečal: ${JSON.stringify(initial)} -> ${JSON.stringify(afterZoom)}`
    );
  }

  const beforeClick = await readView();
  const box = await page.locator(".leaflet-container").boundingBox();
  await page.mouse.click(box.x + box.width * 0.55, box.y + box.height * 0.42);
  await page.waitForTimeout(400);

  // Simulacija rasti grafa / iframe resize po prvem kliku
  await page.evaluate(() => {
    const root = document.getElementById("root");
    if (root) {
      root.style.minHeight = `${root.getBoundingClientRect().height + 140}px`;
    }
  });
  await page.waitForTimeout(700);
  const afterClick = await readView();

  console.log("BEFORE_CLICK", JSON.stringify(beforeClick));
  console.log("AFTER_CLICK", JSON.stringify(afterClick));
  console.log(
    "DELTA",
    JSON.stringify({
      dz: afterClick.z - beforeClick.z,
      dlat: afterClick.lat - beforeClick.lat,
      dlng: afterClick.lng - beforeClick.lng,
    })
  );

  if (!viewEqual(beforeClick, afterClick)) {
    throw new Error(
      `pogled se je spremenil po kliku+resize: ${JSON.stringify(beforeClick)} -> ${JSON.stringify(afterClick)}`
    );
  }
  if (beforeClick.z > 9.5 && almostEqual(afterClick.z, 9, 0.05) && almostEqual(afterClick.lat, 46.12, 0.02)) {
    throw new Error(`pogled je bil ponastavljen na privzetega: ${JSON.stringify(afterClick)}`);
  }

  // Drugi cikel
  for (let i = 0; i < 2; i++) await wheelZoom();
  const before2 = await readView();
  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.48);
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const root = document.getElementById("root");
    if (root) {
      root.style.minHeight = `${root.getBoundingClientRect().height + 40}px`;
    }
  });
  await page.waitForTimeout(500);
  const after2 = await readView();
  console.log("BEFORE_CLICK2", JSON.stringify(before2));
  console.log("AFTER_CLICK2", JSON.stringify(after2));
  if (!viewEqual(before2, after2)) {
    throw new Error(
      `pogled se je spremenil po drugem kliku: ${JSON.stringify(before2)} -> ${JSON.stringify(after2)}`
    );
  }

  const scrollWheelEnabled = await page.evaluate(
    () => window.__testMap.scrollWheelZoom.enabled()
  );
  if (!scrollWheelEnabled) {
    throw new Error("scrollWheelZoom mora biti omogočen na namizju");
  }

  console.log("verify-map-click-viewport: OK");
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
