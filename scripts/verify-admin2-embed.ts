/**
 * Ciljni testi /admin2 in javnih embedov (brez Vitest).
 * Zagon: npx tsx scripts/verify-admin2-embed.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isAdminRole } from "../src/lib/admin-access.ts";
import { shouldAllowFraming } from "../src/lib/frame-guard.ts";
import { archiveEmbedUrl, archiveMapEmbedUrl } from "../src/lib/archive-embed.ts";
import {
  assertPublicEmbedHtml,
  buildPublicEmbedHtml,
  buildPublicEmbedPath,
  buildPublicEmbedSrc,
  EMBED_CHARTS_PATH,
  EMBED_MAP_PATH,
  isAllowedPublicEmbedParentOrigin,
  isPublicEmbedActivateGesture,
  isPublicEmbedPath,
  parsePublicPeriodParam,
  periodDaysForId,
  PUBLIC_CHART_PERIODS,
  PUBLIC_EMBED_ACTIVATE_SLOP_PX,
  PUBLIC_EMBED_CHART_HEIGHT_FACTOR,
  PUBLIC_EMBED_CHILD_ORIGIN,
  PUBLIC_EMBED_RESIZE_TYPE,
  PUBLIC_MAP_PERIODS,
  isAllowedPublicChartPeriodId,
} from "../src/lib/public-embed.ts";
import { KNOWN_APP_PATHS, resolvePageSeo, SITEMAP_PATHS } from "../src/lib/page-seo.ts";
import { MAP_FREE_DAY_OPTIONS, MAP_LOCKED_DAY_OPTIONS } from "../src/lib/map-period-access.ts";

function isUmamiExcludedPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/admin2" ||
    pathname.startsWith("/embed/")
  );
}

assert.equal(isAdminRole("admin"), true);
assert.equal(isAdminRole("team"), true);
assert.equal(isAdminRole("member"), false);

assert.ok((KNOWN_APP_PATHS as readonly string[]).includes("/admin2"));
assert.ok((KNOWN_APP_PATHS as readonly string[]).includes(EMBED_CHARTS_PATH));
assert.ok(!(SITEMAP_PATHS as readonly string[]).includes("/admin2"));
assert.ok(!(SITEMAP_PATHS as readonly string[]).includes(EMBED_CHARTS_PATH));

const admin2Seo = resolvePageSeo("/admin2", "");
assert.match(admin2Seo.robots, /noindex/);

assert.equal(isUmamiExcludedPath("/embed/statistika-grafi"), true);

assert.equal(shouldAllowFraming("/embed/statistika-grafi"), true);
assert.equal(shouldAllowFraming("/embed/obcine-zemljevid"), true);
assert.equal(shouldAllowFraming("/admin2"), false);

assert.equal(parsePublicPeriodParam("charts", "90d"), "90d");
assert.equal(parsePublicPeriodParam("charts", "30"), "30d");
assert.equal(parsePublicPeriodParam("charts", "30d"), "30d");
assert.equal(parsePublicPeriodParam("charts", "hack"), "7d");
assert.equal(parsePublicPeriodParam("map", "30d"), "7d");
assert.equal(periodDaysForId("charts", "30d"), 30);
assert.deepEqual(
  [...MAP_FREE_DAY_OPTIONS],
  PUBLIC_MAP_PERIODS.map((p) => p.days)
);
assert.ok(MAP_LOCKED_DAY_OPTIONS.includes(14));

/* Grafi: prozoren sloj + resize, BREZ aktivacije / gumba Pomikanje strani */
const chartsHtml = buildPublicEmbedHtml("charts", "7d", { frameId: "t-charts" });
assertPublicEmbedHtml(chartsHtml, "charts");
assert.ok(chartsHtml.includes(`src="${PUBLIC_EMBED_CHILD_ORIGIN}${EMBED_CHARTS_PATH}?period=7d"`));
assert.ok(chartsHtml.includes("strelko-pe"));
assert.ok(chartsHtml.includes("pointer-events:none"));
assert.ok(chartsHtml.includes("touch-action:pan-y"));
assert.ok(chartsHtml.includes("strelko-pe__overlay"));
assert.ok(!chartsHtml.includes("Pomikanje strani"));
assert.ok(!chartsHtml.includes("strelko-pe__scroll-btn"));
assert.ok(!chartsHtml.includes("strelko-pe__period-select"));
assert.ok(!chartsHtml.includes("strelko-pe__period-label"));
assert.ok(!chartsHtml.includes("Kliknite za uporabo grafov"));
assert.ok(!chartsHtml.includes("Dotaknite se za uporabo grafov"));
assert.ok(!chartsHtml.includes("strelko-pe__badge"));
assert.ok(!chartsHtml.includes("setActive"));
assert.ok(chartsHtml.includes(PUBLIC_EMBED_RESIZE_TYPE));
assert.ok(chartsHtml.includes(PUBLIC_EMBED_CHILD_ORIGIN));
assert.ok(!chartsHtml.includes("strele-public-embed-wheel"));
assert.ok(!chartsHtml.includes("scrollBy"));
assert.ok(!chartsHtml.includes("Po meri"));
assert.ok(!chartsHtml.includes("&&"), "WP-safe: brez &&");
assert.ok(
  chartsHtml.includes("min-height:850px") ||
    chartsHtml.includes("applyHeight(850)") ||
    chartsHtml.includes("Math.max(850")
);

assert.equal(isAllowedPublicChartPeriodId("30d"), true);
assert.equal(isAllowedPublicChartPeriodId("custom"), false);

const mapHtml = buildPublicEmbedHtml("map", "today", { frameId: "t-map" });
assertPublicEmbedHtml(mapHtml, "map");
assert.ok(mapHtml.includes(`${EMBED_MAP_PATH}?period=today`));
assert.ok(!mapHtml.includes("strelko-pe__overlay"));
assert.ok(!mapHtml.includes("Pomikanje strani"));

assert.throws(() => assertPublicEmbedHtml('<iframe src="/evil"></iframe>', "charts"));

assert.equal(isPublicEmbedActivateGesture(0, 0), true);
assert.equal(isPublicEmbedActivateGesture(2, 3), true);
assert.equal(isPublicEmbedActivateGesture(0, PUBLIC_EMBED_ACTIVATE_SLOP_PX), false);
assert.equal(isPublicEmbedActivateGesture(40, 2), false);

assert.equal(PUBLIC_EMBED_CHART_HEIGHT_FACTOR, 0.8);

function applyPublicChartHeight(px: number, isPublic: boolean, mobile: boolean): number {
  const scaled = Math.round(px * (isPublic ? PUBLIC_EMBED_CHART_HEIGHT_FACTOR : 1));
  if (!isPublic) return scaled;
  return Math.max(mobile ? 176 : 200, scaled);
}
assert.equal(applyPublicChartHeight(260, true, false), 208);
assert.equal(applyPublicChartHeight(340, true, false), 272);
assert.equal(applyPublicChartHeight(260, false, false), 260);

const chartUrl = archiveEmbedUrl("full", false, { hourlyAccess: false }, {
  days: 7,
  publicEmbed: true,
});
assert.ok(chartUrl.includes("public=1"));
assert.ok(chartUrl.includes("controls=1"), "javni chart z notranjim daysSelect");
assert.ok(chartUrl.includes("hourly=1"), "javni chart vključuje Po urah");

const mapUrl = archiveMapEmbedUrl(7, {
  defaultRangeDays: 7,
  hideGrid: true,
  supporter: false,
});
assert.ok(mapUrl.includes("grid=0"));

assert.equal(isAllowedPublicEmbedParentOrigin("https://meteoinfo.si"), true);
assert.equal(isAllowedPublicEmbedParentOrigin("https://strelko.meteoinfo.si"), false);

assert.equal(isPublicEmbedPath("/embed/statistika-grafi"), true);
assert.equal(buildPublicEmbedPath("charts", "bogus"), `${EMBED_CHARTS_PATH}?period=7d`);
assert.ok(buildPublicEmbedSrc("map", "7d").startsWith(PUBLIC_EMBED_CHILD_ORIGIN));

const embedHtml = readFileSync(
  resolve("/home/maximus/projects/strele2/web/public/embed.html"),
  "utf8"
);
assert.ok(embedHtml.includes("publicPeriodBtn"));
assert.ok(embedHtml.includes("publicChartHeightFactor"));
assert.ok(embedHtml.includes("overflow: visible !important"));
assert.ok(embedHtml.includes("document.documentElement.scrollHeight"));
assert.ok(embedHtml.includes("da se spodnji graf posodobi za izbrani dan"));
assert.ok(embedHtml.includes("da se spodnji grafi posodobijo za izbrani dan"));
assert.ok(!embedHtml.includes("Pomikanje strani"));
assert.ok(!embedHtml.includes("initPublicChartActivation"));
assert.ok(!embedHtml.includes("strele-public-embed-wheel"));
assert.ok(!embedHtml.includes("chart-toolbar--embed-period"));
assert.ok(!embedHtml.includes("publicPeriodToolbarHtml"));
assert.ok(embedHtml.includes('EMBED.controls && !EMBED.public'));

console.log("verify-admin2-embed: OK");
