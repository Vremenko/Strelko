import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import { resolvePageSeo, SITEMAP_PATHS } from "../src/lib/page-seo";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "..", "dist");

function outputFileForRoute(routePath: string): string {
  if (routePath === "/") return path.join(DIST, "index.html");
  return path.join(DIST, routePath.slice(1), "index.html");
}

function upsertMeta($: cheerio.CheerioAPI, name: string, content: string): void {
  const el = $(`meta[name="${name}"]`);
  if (el.length) {
    el.attr("content", content);
    return;
  }
  $("head").append(`<meta name="${name}" content="${escapeAttr(content)}" />`);
}

function upsertCanonical($: cheerio.CheerioAPI, href: string): void {
  const el = $('link[rel="canonical"]');
  if (el.length) {
    el.attr("href", href);
    return;
  }
  $("head").append(`<link rel="canonical" href="${escapeAttr(href)}" />`);
}

function escapeAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

function renderRouteHtml(template: string, routePath: string): string {
  const seo = resolvePageSeo(routePath, "");

  const $ = cheerio.load(template);
  $("title").text(seo.title);
  upsertMeta($, "description", seo.description);
  upsertMeta($, "robots", seo.robots);
  upsertCanonical($, seo.canonical);
  // #app pustimo prazen — vsebina v body bi pred nalaganjem CSS/JS povzročila "flash".

  return $.html();
}

async function main(): Promise<void> {
  if (process.env.SKIP_PRERENDER === "1") {
    console.log("prerender: preskočeno (SKIP_PRERENDER=1)");
    return;
  }

  const templatePath = path.join(DIST, "index.html");
  const template = await fs.readFile(templatePath, "utf8");

  for (const routePath of SITEMAP_PATHS) {
    const html = renderRouteHtml(template, routePath);
    const outFile = outputFileForRoute(routePath);
    await fs.mkdir(path.dirname(outFile), { recursive: true });
    await fs.writeFile(outFile, html, "utf8");
    console.log(`prerender: ${routePath} -> ${path.relative(DIST, outFile)}`);
  }

  console.log(`prerender: uspešno (${SITEMAP_PATHS.length} strani)`);
}

main().catch((err) => {
  console.error("prerender: napaka", err);
  process.exit(1);
});
