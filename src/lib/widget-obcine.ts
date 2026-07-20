import type { WidgetState } from "../types";

export type WidgetPreviewSize = "compact" | "full";
export const NATIONAL_WIDGET_SCOPE = "slovenija" as const;

export type ObcinaWidgetPublic = {
  public_key: string;
  ob_mid?: number | null;
  scope?: string | null;
  theme: "dark" | "light";
  size: WidgetPreviewSize;
  embed_path: string;
  active: boolean;
};

export type ObcinaWidgetPreviewToken = {
  token: string;
  preview_path: string;
  expires_in_sec: number;
};

export type ObcinaWidgetList = {
  widgets: ObcinaWidgetPublic[];
};

export function widgetPreviewBody(widget: WidgetState, size: WidgetPreviewSize) {
  if (widget.publicWidgetScope === NATIONAL_WIDGET_SCOPE) {
    return { scope: NATIONAL_WIDGET_SCOPE, theme: widget.publicWidgetTheme || "dark", size };
  }
  const mid = widget.publicWidgetObMid;
  return {
    ob_mid: mid ? Number(mid) : undefined,
    theme: widget.publicWidgetTheme || "dark",
    size,
  };
}

export function widgetProductionPreviewPath(publicKey: string): string {
  return `/widget/obcina.html?id=${encodeURIComponent(publicKey)}`;
}

export function widgetEmbedConfigKey(widget: WidgetState, size: WidgetPreviewSize): string {
  return [size, widget.publicWidgetScope ?? "", widget.publicWidgetObMid ?? "", widget.publicWidgetTheme].join("|");
}

export function widgetTargetConfigKey(
  size: WidgetPreviewSize,
  obMid: number | string | null | undefined,
  scope: string | null | undefined
): string {
  return [size, scope ?? "", obMid ?? ""].join("|");
}

export function findMatchingObcinaWidget(
  widgets: ObcinaWidgetPublic[],
  widget: WidgetState,
  size: WidgetPreviewSize
): ObcinaWidgetPublic | null {
  const targetKey = widgetTargetConfigKey(
    size,
    widget.publicWidgetObMid,
    widget.publicWidgetScope === NATIONAL_WIDGET_SCOPE ? NATIONAL_WIDGET_SCOPE : null
  );
  return (
    widgets.find((row) => {
      const rowKey = widgetTargetConfigKey(
        row.size,
        row.ob_mid,
        row.scope === NATIONAL_WIDGET_SCOPE ? NATIONAL_WIDGET_SCOPE : null
      );
      return rowKey === targetKey;
    }) ?? null
  );
}

export function newWidgetEmbedFrameId(size: WidgetPreviewSize): string {
  const full = size === "full";
  return `strele-obcina-${full ? "full" : "compact"}-${Math.random().toString(36).slice(2, 8)}`;
}

const PUBLIC_KEY_HEX_RE = /^[a-f0-9]{32}$/;

export function isValidObcinaWidgetPublicKey(publicKey: string): boolean {
  return PUBLIC_KEY_HEX_RE.test(publicKey.trim());
}

export function expectedObcinaEmbedPath(publicKey: string): string {
  return widgetProductionPreviewPath(publicKey.trim());
}

export function assertObcinaWidgetEmbedRecord(widget: ObcinaWidgetPublic): void {
  const key = widget.public_key.trim();
  if (!isValidObcinaWidgetPublicKey(key)) {
    throw new Error("Ključ widgeta ni veljaven.");
  }
  if (widget.embed_path !== expectedObcinaEmbedPath(key)) {
    throw new Error("Pot embed kode se ne ujema s ključem.");
  }
}

export function assertObcinaEmbedHtml(html: string, publicKey: string): void {
  const key = publicKey.trim();
  if (!isValidObcinaWidgetPublicKey(key)) {
    throw new Error("Ključ widgeta ni veljaven.");
  }
  const srcMatch = html.match(/src="([^"]+)"/);
  if (!srcMatch) {
    throw new Error("Embed koda ne vsebuje iframe URL-ja.");
  }
  const url = new URL(srcMatch[1], location.origin);
  if (!url.pathname.endsWith("/widget/obcina.html")) {
    throw new Error("Embed koda ne vsebuje pravilne poti widgeta.");
  }
  if (url.searchParams.get("id") !== key) {
    throw new Error("Embed koda ne vsebuje pravilnega ključa widgeta.");
  }
  for (const param of ["ob_mid", "theme", "size", "api", "token", "scope"]) {
    if (url.searchParams.has(param)) {
      throw new Error("Embed koda vsebuje nedovoljene parametre.");
    }
  }
}

export function buildVerifiedEmbedHtml(widget: ObcinaWidgetPublic): { html: string; frameId: string } {
  assertObcinaWidgetEmbedRecord(widget);
  const frameId = newWidgetEmbedFrameId(widget.size);
  const html = widgetEmbedHtml(widget, frameId);
  assertObcinaEmbedHtml(html, widget.public_key);
  return { html, frameId };
}

export async function resolveVerifiedEmbedForWidget(
  widget: ObcinaWidgetPublic,
  configKey: string,
  verifyPublic: (publicKey: string) => Promise<unknown>
): Promise<{ widget: ObcinaWidgetPublic; html: string; frameId: string; configKey: string } | null> {
  try {
    assertObcinaWidgetEmbedRecord(widget);
    await verifyPublic(widget.public_key);
    const { html, frameId } = buildVerifiedEmbedHtml(widget);
    return { widget, html, frameId, configKey };
  } catch {
    return null;
  }
}

export function widgetEmbedHtml(
  production: ObcinaWidgetPublic,
  frameId: string
): string {
  const full = production.size === "full";
  const theme = production.theme || "dark";
  const bg = theme === "dark" ? "#333333" : "#f7f7f8";
  const src = `${location.origin}${widgetProductionPreviewPath(production.public_key)}`;
  return `<div style="width:100%;max-width:${full ? "960" : "450"}px;margin:0 auto"><iframe id="${frameId}" src="${src}" title="Udari strel v občini — Strelko" style="width:100%;max-width:${full ? "960" : "450"}px;height:${full ? "640" : "420"}px;border:none;border-radius:14px;display:block;margin:0 auto;background:${bg}"></iframe><script>(function(){var f=document.getElementById("${frameId}");if(!f)return;window.addEventListener("message",function(ev){if(!ev.data||ev.data.type!=="strele-embed-resize"||ev.source!==f.contentWindow)return;var h=Math.max(320,Math.min(1400,+ev.data.height||0));if(h>0)f.style.height=h+"px";});})();<\/script></div>`;
}

declare global {
  interface Window {
    __wPR?: number;
  }
}

export function ensureWidgetResizeListener(): void {
  if (window.__wPR) return;
  window.__wPR = 1;
  window.addEventListener("message", (ev) => {
    if (!ev.data || ev.data.type !== "strele-embed-resize") return;
    const frame = document.getElementById("public-widget-iframe") as HTMLIFrameElement | null;
    if (!frame || ev.source !== frame.contentWindow) return;
    const h = Math.max(320, Math.min(1400, +ev.data.height || 0));
    if (h > 0) frame.style.height = `${h}px`;
  });
}

export async function copyTextToClipboard(text: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error("Brskalnik ne podpira varnega kopiranja. Poskusite znova v novem brskalniku.");
  }
  await navigator.clipboard.writeText(text);
}

/** Sporočilo starša → predogledni iframe: nova nastavitev brez ponovnega nalaganja lupine. */
export const OBCINA_PREVIEW_UPDATE_TYPE = "strele-obcina-preview-update" as const;

export type ObcinaPreviewUpdateMessage = {
  type: typeof OBCINA_PREVIEW_UPDATE_TYPE;
  token: string;
};

export function isObcinaPreviewUpdateMessage(data: unknown): data is ObcinaPreviewUpdateMessage {
  if (!data || typeof data !== "object") return false;
  const row = data as Record<string, unknown>;
  return row.type === OBCINA_PREVIEW_UPDATE_TYPE && typeof row.token === "string" && row.token.length > 0;
}

export function widgetPreviewTokenKey(body: {
  ob_mid?: number;
  scope?: string;
  theme?: string;
  size?: string;
}): string {
  return [body.scope ?? "", body.ob_mid ?? "", body.theme ?? "", body.size ?? ""].join("|");
}

/**
 * Zaporedni klici preview-token API-ja.
 * Vzporedni odgovori bi sicer prepisali piškotek seje, medtem ko iframe še uporablja
 * starejši žeton → 403 »Predogledna seja ni veljavna« in prazen predogled.
 * Enaki vzporedni zahtevki (isti ključ) delijo isti Promise — npr. StrictMode v dev.
 */
let previewTokenChain: Promise<void> = Promise.resolve();
const previewTokenInflight = new Map<string, Promise<ObcinaWidgetPreviewToken>>();

export function fetchObcinaWidgetPreviewTokenSerialized(
  request: () => Promise<ObcinaWidgetPreviewToken>,
  key?: string
): Promise<ObcinaWidgetPreviewToken> {
  if (key) {
    const existing = previewTokenInflight.get(key);
    if (existing) return existing;
  }

  const next = previewTokenChain.then(request, request);
  previewTokenChain = next.then(
    () => undefined,
    () => undefined
  );

  if (key) {
    previewTokenInflight.set(key, next);
    void next.finally(() => {
      if (previewTokenInflight.get(key) === next) previewTokenInflight.delete(key);
    });
  }

  return next;
}

const PREVIEW_CDN_PRELOADS: { href: string; as: "script" | "style"; crossOrigin?: string }[] = [
  { href: "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js", as: "script", crossOrigin: "" },
  { href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", as: "script", crossOrigin: "" },
  { href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", as: "style", crossOrigin: "" },
  { href: "https://cdn.maptiler.com/maptiler-sdk-js/v3.10.2/maptiler-sdk.umd.min.js", as: "script" },
  { href: "https://cdn.maptiler.com/maptiler-sdk-js/v3.10.2/maptiler-sdk.css", as: "style" },
  { href: "https://cdn.maptiler.com/leaflet-maptilersdk/v4.1.0/leaflet-maptilersdk.umd.min.js", as: "script" },
];

/** Prednalaganje statičnih CDN datotek predogleda — hitrejši prvi iframe. */
export function ensureObcinaPreviewAssetPreloads(): () => void {
  if (typeof document === "undefined") return () => undefined;
  const created: HTMLLinkElement[] = [];
  for (const asset of PREVIEW_CDN_PRELOADS) {
    const exists = document.head.querySelector(
      `link[rel="preload"][href="${asset.href}"]`
    );
    if (exists) continue;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = asset.as;
    link.href = asset.href;
    if (asset.crossOrigin !== undefined) link.crossOrigin = asset.crossOrigin;
    document.head.appendChild(link);
    created.push(link);
  }
  return () => {
    for (const link of created) link.remove();
  };
}
