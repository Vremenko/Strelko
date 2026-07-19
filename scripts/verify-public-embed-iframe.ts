/**
 * Generirana koda za začasni preizkus na meteoinfo.si (WordPress HTML blok).
 * Zagon: npx tsx scripts/verify-public-embed-iframe.ts
 */
import assert from "node:assert/strict";
import {
  buildPublicEmbedHtml,
  isAllowedPublicEmbedParentOrigin,
  PUBLIC_EMBED_CHILD_ORIGIN,
  PUBLIC_EMBED_RESIZE_TYPE,
  parsePublicPeriodParam,
} from "../src/lib/public-embed.ts";
import { archiveEmbedUrl, archiveMapEmbedUrl } from "../src/lib/archive-embed.ts";

const charts = buildPublicEmbedHtml("charts", "7d", { frameId: "mi-charts" });
const map = buildPublicEmbedHtml("map", "today", { frameId: "mi-map" });

assert.ok(charts.includes(PUBLIC_EMBED_CHILD_ORIGIN));
assert.ok(charts.includes(PUBLIC_EMBED_RESIZE_TYPE));
assert.ok(charts.includes("pointer-events:none"));
assert.ok(charts.includes("strelko-pe__overlay"));
assert.ok(!charts.includes("Pomikanje strani"));
assert.ok(!charts.includes("strelko-pe__scroll-btn"));
assert.ok(!charts.includes("strelko-pe__period-select"));
assert.ok(!charts.includes("Kliknite za uporabo grafov"));
assert.ok(charts.includes("strele-public-chart-pointer"));
assert.ok(!charts.includes("scrollBy"));
assert.ok(!charts.includes("strele-public-embed-wheel"));

assert.equal(isAllowedPublicEmbedParentOrigin("https://evil.example"), false);
assert.equal(isAllowedPublicEmbedParentOrigin("https://meteoinfo.si"), true);

assert.equal(parsePublicPeriodParam("map", "30d"), "7d");
assert.equal(parsePublicPeriodParam("charts", "30d"), "30d");

const pubMap = archiveMapEmbedUrl(7, { defaultRangeDays: 7, hideGrid: true, supporter: false });
assert.ok(pubMap.includes("grid=0"));

const pubCharts = archiveEmbedUrl("full", false, { hourlyAccess: false }, {
  days: 90,
  publicEmbed: true,
});
assert.ok(pubCharts.includes("days=90"));
assert.ok(pubCharts.includes("controls=1"));
assert.ok(pubCharts.includes("public=1"));
assert.ok(pubCharts.includes("hourly=1"));

console.log("verify-public-embed-iframe: OK");
console.log("--- CHARTS SNIPPET ---");
console.log(charts);
console.log("--- MAP SNIPPET ---");
console.log(map);
