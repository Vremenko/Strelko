import type { WidgetState } from "../types";

export type WidgetPreviewSize = "compact" | "full";
export const NATIONAL_WIDGET_SCOPE = "slovenija" as const;

function buildWidgetParams(widget: WidgetState, size: WidgetPreviewSize): URLSearchParams {
  const params = new URLSearchParams();
  if (widget.publicWidgetScope === NATIONAL_WIDGET_SCOPE) {
    params.set("scope", NATIONAL_WIDGET_SCOPE);
    params.set("label", "SLOVENIJA");
  } else {
    const mid = widget.publicWidgetObMid;
    if (mid) params.set("ob_mid", String(mid));
  }
  params.set("theme", widget.publicWidgetTheme || "dark");
  params.set("size", size === "full" ? "full" : "compact");
  params.set("api", `${location.origin}/widget/api`);
  return params;
}

export function widgetPreviewPath(widget: WidgetState, size: WidgetPreviewSize): string {
  const params = buildWidgetParams(widget, size);
  return params.has("ob_mid") || params.has("scope")
    ? `/widget/obcina.html?${params}`
    : `/widget/obcina.html?size=${size === "full" ? "full" : "compact"}`;
}

export function widgetEmbedConfigKey(widget: WidgetState, size: WidgetPreviewSize): string {
  return [size, widget.publicWidgetScope ?? "", widget.publicWidgetObMid ?? "", widget.publicWidgetTheme].join("|");
}

export function newWidgetEmbedFrameId(size: WidgetPreviewSize): string {
  const full = size === "full";
  return `strele-obcina-${full ? "full" : "compact"}-${Math.random().toString(36).slice(2, 8)}`;
}

export function widgetEmbedHtml(
  widget: WidgetState,
  size: WidgetPreviewSize,
  frameId: string
): string {
  const full = size === "full";
  const theme = widget.publicWidgetTheme || "dark";
  const bg = theme === "dark" ? "#333333" : "#f7f7f8";
  const src = `${location.origin}${widgetPreviewPath(widget, size)}`;
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

export async function copyWidgetEmbedCode(code: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
      return true;
    }
    const ta = document.createElement("textarea");
    ta.value = code;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
