/**
 * Javni grafi: klik brez aktivacije, prozoren sloj, protokol pointerjev.
 * Zagon: npx tsx scripts/verify-public-charts-pointer.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertPublicEmbedHtml,
  buildPublicEmbedHtml,
  PUBLIC_EMBED_ACTIVATE_SLOP_PX,
  isPublicEmbedActivateGesture,
} from "../src/lib/public-embed.ts";
import {
  PUBLIC_CHART_LAYOUT_TYPE,
  PUBLIC_CHART_PARENT_LAYOUT_TYPE,
  PUBLIC_CHART_PARENT_POINTER_TYPE,
  PUBLIC_CHART_POINTER_TYPE,
  PUBLIC_CHART_TAP_SLOP_PX,
  isPublicChartTapGesture,
  isValidRelativeCoord,
  newChartInteractionId,
  parseChartPointerPayload,
} from "../src/lib/public-chart-pointer.ts";
import { archiveEmbedUrl } from "../src/lib/archive-embed.ts";

const chartsHtml = buildPublicEmbedHtml("charts", "7d", { frameId: "ptr-charts" });
assertPublicEmbedHtml(chartsHtml, "charts");

assert.ok(!chartsHtml.includes("Pomikanje strani"));
assert.ok(!chartsHtml.includes("Kliknite za uporabo grafov"));
assert.ok(!chartsHtml.includes("Dotaknite se za uporabo grafov"));
assert.ok(!chartsHtml.includes("strelko-pe__scroll-btn"));
assert.ok(!chartsHtml.includes("setActive"));
assert.ok(!chartsHtml.includes("is-active"));
assert.ok(!chartsHtml.includes("Escape"));
assert.ok(!chartsHtml.includes("mouseleave"));
assert.ok(chartsHtml.includes("pointer-events:none"));
assert.ok(chartsHtml.includes("strelko-pe__overlay"));
assert.ok(chartsHtml.includes("touch-action:pan-y"));
assert.ok(!chartsHtml.includes("&&"));
assert.ok(chartsHtml.includes(PUBLIC_CHART_PARENT_POINTER_TYPE));
assert.ok(chartsHtml.includes("background:transparent"));
assert.ok(!chartsHtml.includes("top:72px"));

const mapHtml = buildPublicEmbedHtml("map", "7d", { frameId: "ptr-map" });
assert.ok(!mapHtml.includes("Pomikanje strani"));
assert.ok(!mapHtml.includes(PUBLIC_CHART_PARENT_POINTER_TYPE));
assert.ok(!mapHtml.includes("strelko-pe__overlay"));

assert.equal(PUBLIC_CHART_TAP_SLOP_PX, PUBLIC_EMBED_ACTIVATE_SLOP_PX);
assert.equal(isPublicChartTapGesture(0, 0), true);
assert.equal(isPublicChartTapGesture(0, PUBLIC_CHART_TAP_SLOP_PX), false);
assert.equal(isPublicEmbedActivateGesture(3, 4), true);

assert.equal(isValidRelativeCoord(0), true);
assert.equal(isValidRelativeCoord(1), true);
assert.equal(isValidRelativeCoord(0.5), true);
assert.equal(isValidRelativeCoord(-0.01), false);
assert.equal(isValidRelativeCoord(1.01), false);

const id1 = newChartInteractionId();
const id2 = newChartInteractionId();
assert.ok(id1.length > 4);
assert.notEqual(id1, id2);

const parsed = parseChartPointerPayload(
  {
    type: PUBLIC_CHART_POINTER_TYPE,
    action: "click",
    relativeX: 0.4,
    relativeY: 0.6,
    interactionId: id1,
  },
  PUBLIC_CHART_POINTER_TYPE
);
assert.ok(parsed);
assert.equal(parsed?.action, "click");

assert.equal(
  parseChartPointerPayload(
    { type: PUBLIC_CHART_POINTER_TYPE, action: "click", relativeX: 2, relativeY: 0.5, interactionId: "x" },
    PUBLIC_CHART_POINTER_TYPE
  ),
  null
);

const embedPage = readFileSync(
  resolve("/home/maximus/projects/Strelko/src/pages/EmbedChartsPage.tsx"),
  "utf8"
);
assert.ok(!embedPage.includes("Pomikanje strani"));
assert.ok(!embedPage.includes("is-charts-active"));
assert.ok(!embedPage.includes("setActive"));
assert.ok(!embedPage.includes("Escape"));
assert.ok(embedPage.includes("PUBLIC_CHART_POINTER_TYPE"));
assert.ok(embedPage.includes("public-embed-charts-overlay"));
assert.ok(embedPage.includes("newChartInteractionId"));

const css = readFileSync(
  resolve("/home/maximus/projects/Strelko/src/pages-extra.css"),
  "utf8"
);
assert.ok(!css.includes("public-embed-scroll-btn"));
assert.ok(!css.includes("is-charts-active"));
assert.ok(css.includes("public-embed-charts-overlay"));
assert.ok(css.includes("touch-action: pan-y"));

const chartUrl = archiveEmbedUrl("full", false, { hourlyAccess: false }, {
  days: 7,
  publicEmbed: true,
});
assert.ok(chartUrl.includes("public=1"));
assert.ok(chartUrl.includes("controls=1"), "javni chart ima notranji izbirnik obdobja");
assert.ok(chartUrl.includes("hourly=1"), "javni chart vključuje Po urah");

const embedHtml = readFileSync(
  resolve("/home/maximus/projects/strele2/web/public/embed.html"),
  "utf8"
);
assert.ok(embedHtml.includes(PUBLIC_CHART_POINTER_TYPE));
assert.ok(embedHtml.includes(PUBLIC_CHART_LAYOUT_TYPE));
assert.ok(embedHtml.includes("rememberPointerId"));
assert.ok(embedHtml.includes("notifyChartChromeLayout"));
assert.ok(embedHtml.includes("isAllowedPointerOrigin"));
assert.ok(embedHtml.includes("EMBED.public"));
assert.ok(embedHtml.includes("public-period__native"));
assert.ok(embedHtml.includes("publicPeriodBtn"));
assert.ok(!embedHtml.includes("Pomikanje strani"));
assert.ok(!embedHtml.includes("initPublicChartActivation"));
assert.ok(!embedHtml.includes("strele-public-embed-wheel"));
assert.ok(embedHtml.includes("publicPeriodMenu"));
assert.ok(embedHtml.includes("togglePublicPeriodMenu"));
assert.ok(embedHtml.includes("if (EMBED.public)"));
assert.ok(embedHtml.includes('EMBED.controls && !EMBED.public'));

assert.ok(PUBLIC_CHART_PARENT_LAYOUT_TYPE.includes("layout"));

console.log("verify-public-charts-pointer: OK");
