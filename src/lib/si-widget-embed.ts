/** Javni embed widgeta Slovenija (kartice, brez zemljevida in grafa) za meteoinfo.si. */

import { SITE_ORIGIN } from "./page-seo";

export const SI_WIDGET_EMBED_PATH = "/widget/public/obcina-si-embed.html";

export const SI_WIDGET_EMBED_RESIZE_TYPE = "strele-embed-resize" as const;

export type SiWidgetTheme = "dark" | "light";

export function parseSiWidgetTheme(raw: string | null | undefined): SiWidgetTheme {
  return String(raw || "").trim().toLowerCase() === "light" ? "light" : "dark";
}

export function buildSiWidgetEmbedPath(theme: string = "dark"): string {
  const t = parseSiWidgetTheme(theme);
  return `${SI_WIDGET_EMBED_PATH}?theme=${encodeURIComponent(t)}`;
}

export function buildSiWidgetEmbedSrc(
  theme: string = "dark",
  origin: string = SITE_ORIGIN
): string {
  return `${origin.replace(/\/+$/, "")}${buildSiWidgetEmbedPath(theme)}`;
}

export function assertSiWidgetEmbedHtml(html: string): void {
  if (!html.includes(SI_WIDGET_EMBED_PATH)) {
    throw new Error("Koda nima poti do SI widget embeda.");
  }
  if (!html.includes("theme=")) {
    throw new Error("Koda nima parametra theme.");
  }
  if (!html.includes(SI_WIDGET_EMBED_RESIZE_TYPE)) {
    throw new Error("Koda nima poslušalca za samodejno višino.");
  }
  if (/chart\.umd|leaflet|maptiler/i.test(html)) {
    throw new Error("Koda ne sme vključevati zemljevida ali grafa.");
  }
}

export function buildSiWidgetEmbedHtml(
  theme: string = "dark",
  opts?: { frameId?: string }
): string {
  const t = parseSiWidgetTheme(theme);
  const frameId = (opts?.frameId || "strelko-si-widget").replace(/[^a-zA-Z0-9_-]/g, "");
  const src = buildSiWidgetEmbedSrc(t);
  const title = "Udari strel — Slovenija (Strelko)";
  return (
    `<div style="width:100%;max-width:960px;margin:0;padding:0;background:transparent">` +
    `<iframe id="${frameId}" src="${src}" title="${title}" scrolling="no" ` +
    `style="width:100%;max-width:960px;height:0;border:none;border-radius:14px;display:block;margin:0 auto;padding:0;background:transparent;overflow:hidden;min-height:0"></iframe>` +
    `<script>(function(){var f=document.getElementById("${frameId}");if(!f)return;` +
    `window.addEventListener("message",function(ev){` +
    `if(!ev.data||ev.data.type!=="${SI_WIDGET_EMBED_RESIZE_TYPE}"||ev.source!==f.contentWindow)return;` +
    `var h=+ev.data.height||0;if(h>0){f.style.height=h+"px";f.style.overflow="hidden";}` +
    `});})();<\/script></div>`
  );
}
