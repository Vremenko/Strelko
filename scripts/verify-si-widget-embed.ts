/**
 * Verify: SI widget embed (kartice, brez zemljevida/grafa).
 * Zagon: npx tsx scripts/verify-si-widget-embed.ts
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  SI_WIDGET_EMBED_PATH,
  assertSiWidgetEmbedHtml,
  buildSiWidgetEmbedHtml,
  buildSiWidgetEmbedPath,
  buildSiWidgetEmbedSrc,
  parseSiWidgetTheme,
} from "../src/lib/si-widget-embed.ts";

assert.equal(parseSiWidgetTheme("light"), "light");
assert.equal(parseSiWidgetTheme("DARK"), "dark");
assert.equal(parseSiWidgetTheme(""), "dark");

assert.equal(buildSiWidgetEmbedPath("dark"), `${SI_WIDGET_EMBED_PATH}?theme=dark`);
assert.equal(buildSiWidgetEmbedPath("light"), `${SI_WIDGET_EMBED_PATH}?theme=light`);

const src = buildSiWidgetEmbedSrc("dark", "https://strelko.meteoinfo.si");
assert.ok(src.startsWith("https://strelko.meteoinfo.si/widget/public/obcina-si-embed.html"));
assert.ok(src.includes("theme=dark"));

const htmlDark = buildSiWidgetEmbedHtml("dark", { frameId: "admin2-si" });
assertSiWidgetEmbedHtml(htmlDark);
assert.ok(htmlDark.includes('theme=dark'));
assert.ok(htmlDark.includes("strele-embed-resize"));
assert.ok(htmlDark.includes('scrolling="no"'));
assert.ok(htmlDark.includes("background:transparent"));
assert.ok(!htmlDark.includes("Math.max(80"));
assert.ok(!htmlDark.includes("Math.max(240"));
assert.ok(!/chart\.umd|leaflet|maptiler/i.test(htmlDark));

const htmlLight = buildSiWidgetEmbedHtml("light", { frameId: "admin2-si-light" });
assertSiWidgetEmbedHtml(htmlLight);
assert.ok(htmlLight.includes("theme=light"));

const htmlPath = resolve(
  "/home/maximus/projects/strele2/web/public/obcina-si-embed.html"
);
assert.ok(existsSync(htmlPath), "obcina-si-embed.html mora obstajati");
const fileHtml = readFileSync(htmlPath, "utf8");
assert.ok(!/chart\.umd/i.test(fileHtml));
assert.ok(!/leaflet/i.test(fileHtml));
assert.ok(!/maptiler/i.test(fileHtml));
assert.ok(fileHtml.includes("/si-widget"));
assert.ok(fileHtml.includes("strele-embed-resize"));
assert.ok(fileHtml.includes("SLOVENIJA"));
assert.ok(!/Podrobna statistika/i.test(fileHtml));
assert.ok(fileHtml.includes("overflow: hidden"));
assert.ok(fileHtml.includes("max-width: 679px"));
assert.ok(fileHtml.includes("padding: 0.4rem 0 7px"));
assert.ok(!fileHtml.includes("document.documentElement.scrollHeight"));
assert.ok(!fileHtml.includes("document.body.scrollHeight"));
assert.ok(fileHtml.includes("getBoundingClientRect"));

console.log("verify-si-widget-embed: OK");
