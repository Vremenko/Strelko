import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import {
  pageJsonLd,
  resolvePageSeo,
  KNOWN_APP_PATHS,
  siteJsonLdGraph,
  socialMetaFromPageSeo,
  sitemapXml,
} from "../src/lib/page-seo";
import { renderPrerenderSnapshotHtml } from "../src/lib/prerender-body";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "..", "dist");
const PUBLIC = path.resolve(__dirname, "..", "public");

function outputFileForRoute(routePath: string): string {
  if (routePath === "/") return path.join(DIST, "index.html");
  return path.join(DIST, routePath.slice(1), "index.html");
}

function escapeAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

function upsertMeta($: cheerio.CheerioAPI, name: string, content: string): void {
  const el = $(`meta[name="${name}"]`);
  if (el.length) {
    el.attr("content", content);
    return;
  }
  $("head").append(`<meta name="${name}" content="${escapeAttr(content)}" />`);
}

function upsertProperty($: cheerio.CheerioAPI, property: string, content: string): void {
  const el = $(`meta[property="${property}"]`);
  if (el.length) {
    el.attr("content", content);
    return;
  }
  $("head").append(`<meta property="${property}" content="${escapeAttr(content)}" />`);
}

function upsertCanonical($: cheerio.CheerioAPI, href: string): void {
  const el = $('link[rel="canonical"]');
  if (el.length) {
    el.attr("href", href);
    return;
  }
  $("head").append(`<link rel="canonical" href="${escapeAttr(href)}" />`);
}

function upsertJsonLd($: cheerio.CheerioAPI, id: string, data: Record<string, unknown>): void {
  const json = JSON.stringify(data).replaceAll("<", "\\u003c");
  const el = $(`script#${id}`);
  if (el.length) {
    el.text(json);
    return;
  }
  $("head").append(`<script id="${id}" type="application/ld+json">${json}</script>`);
}

function renderRouteHtml(template: string, routePath: string): string {
  const seo = resolvePageSeo(routePath, "");
  const social = socialMetaFromPageSeo(seo);

  const $ = cheerio.load(template);
  $("title").text(seo.title);
  upsertMeta($, "description", seo.description);
  upsertMeta($, "robots", seo.robots);
  upsertCanonical($, seo.canonical);

  upsertProperty($, "og:title", social.ogTitle);
  upsertProperty($, "og:description", social.ogDescription);
  upsertProperty($, "og:url", social.ogUrl);
  upsertProperty($, "og:image", social.ogImage);
  upsertProperty($, "og:image:alt", social.ogImageAlt);
  upsertProperty($, "og:site_name", social.ogSiteName);
  upsertProperty($, "og:locale", social.ogLocale);
  upsertProperty($, "og:type", social.ogType);

  upsertMeta($, "twitter:card", social.twitterCard);
  upsertMeta($, "twitter:title", social.twitterTitle);
  upsertMeta($, "twitter:description", social.twitterDescription);
  upsertMeta($, "twitter:image", social.twitterImage);
  upsertMeta($, "twitter:image:alt", social.ogImageAlt);

  if (routePath === "/") {
    upsertJsonLd($, "strelko-site-jsonld", siteJsonLdGraph());
  } else {
    $("#strelko-site-jsonld").remove();
  }
  upsertJsonLd($, "strelko-page-jsonld", pageJsonLd(seo));

  $("#app").html(renderPrerenderSnapshotHtml(routePath));

  return $.html();
}

async function main(): Promise<void> {
  if (process.env.SKIP_PRERENDER === "1") {
    console.log("prerender: preskočeno (SKIP_PRERENDER=1)");
    return;
  }

  const templatePath = path.join(DIST, "index.html");
  const template = await fs.readFile(templatePath, "utf8");
  const lastmod = new Date().toISOString().slice(0, 10);

  for (const routePath of KNOWN_APP_PATHS) {
    const html = renderRouteHtml(template, routePath);
    const outFile = outputFileForRoute(routePath);
    await fs.mkdir(path.dirname(outFile), { recursive: true });
    await fs.writeFile(outFile, html, "utf8");
    console.log(`prerender: ${routePath} -> ${path.relative(DIST, outFile)}`);
  }

  await fs.writeFile(path.join(DIST, "sitemap.xml"), sitemapXml(lastmod), "utf8");
  console.log(`prerender: sitemap.xml (lastmod=${lastmod})`);

  const ogImage = path.join(PUBLIC, "og-image.png");
  try {
    await fs.copyFile(ogImage, path.join(DIST, "og-image.png"));
    console.log("prerender: og-image.png");
  } catch {
    console.warn("prerender: og-image.png ni na voljo v public/");
  }

  console.log(`prerender: uspešno (${KNOWN_APP_PATHS.length} strani)`);
}

main().catch((err) => {
  console.error("prerender: napaka", err);
  process.exit(1);
});
