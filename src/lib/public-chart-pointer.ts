/** Protokol klika/hoverja na javnih grafih (Strelko lupina ↔ strele2 embed). */

import { SITE_ORIGIN } from "./page-seo";

/** Prag (px): premik ≥ tega = drsenje, ne klik na stolpec. */
export const PUBLIC_CHART_TAP_SLOP_PX = 10;

export const PUBLIC_CHART_POINTER_TYPE = "strele-chart-pointer";
export const PUBLIC_CHART_LAYOUT_TYPE = "strele-chart-layout";

/** Zunanji WP lupina → Strelko (isto telo, drug type za ločitev ravni). */
export const PUBLIC_CHART_PARENT_POINTER_TYPE = "strele-public-chart-pointer";
export const PUBLIC_CHART_PARENT_LAYOUT_TYPE = "strele-public-chart-layout";

export type PublicChartPointerAction = "click" | "move" | "leave";

export type PublicChartPointerPayload = {
  type: typeof PUBLIC_CHART_POINTER_TYPE | typeof PUBLIC_CHART_PARENT_POINTER_TYPE;
  action: PublicChartPointerAction;
  relativeX: number;
  relativeY: number;
  interactionId: string;
};

export type PublicChartLayoutPayload = {
  type: typeof PUBLIC_CHART_LAYOUT_TYPE | typeof PUBLIC_CHART_PARENT_LAYOUT_TYPE;
  chartTopPx: number;
  chartTopRatio: number;
  height: number;
};

export function newChartInteractionId(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

export function isValidRelativeCoord(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1;
}

export function isPublicChartTapGesture(
  deltaX: number,
  deltaY: number,
  slopPx = PUBLIC_CHART_TAP_SLOP_PX
): boolean {
  return Math.hypot(deltaX, deltaY) < slopPx;
}

export function hasFinePointerMedia(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Ciljni origin ob pošiljanju v notranji arhivski iframe (isti gostitelj). */
export function chartEmbedTargetOrigin(): string {
  return SITE_ORIGIN;
}

/** Ciljni origin ob pošiljanju iz WP v Strelko. */
export function publicEmbedTargetOrigin(): string {
  return SITE_ORIGIN;
}

export function parseChartPointerPayload(
  data: unknown,
  expectedType: typeof PUBLIC_CHART_POINTER_TYPE | typeof PUBLIC_CHART_PARENT_POINTER_TYPE
): PublicChartPointerPayload | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.type !== expectedType) return null;
  if (d.action !== "click" && d.action !== "move" && d.action !== "leave") return null;
  const interactionId = typeof d.interactionId === "string" ? d.interactionId.trim() : "";
  if (!interactionId || interactionId.length > 80) return null;
  if (d.action === "leave") {
    return {
      type: expectedType,
      action: "leave",
      relativeX: 0,
      relativeY: 0,
      interactionId,
    };
  }
  if (!isValidRelativeCoord(d.relativeX) || !isValidRelativeCoord(d.relativeY)) return null;
  return {
    type: expectedType,
    action: d.action,
    relativeX: d.relativeX,
    relativeY: d.relativeY,
    interactionId,
  };
}

export function parseChartLayoutPayload(
  data: unknown,
  expectedType: typeof PUBLIC_CHART_LAYOUT_TYPE | typeof PUBLIC_CHART_PARENT_LAYOUT_TYPE
): PublicChartLayoutPayload | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.type !== expectedType) return null;
  const chartTopPx = Number(d.chartTopPx);
  const chartTopRatio = Number(d.chartTopRatio);
  const height = Number(d.height);
  if (!Number.isFinite(chartTopPx) || chartTopPx < 0 || chartTopPx > 4000) return null;
  if (!Number.isFinite(chartTopRatio) || chartTopRatio < 0 || chartTopRatio > 1) return null;
  if (!Number.isFinite(height) || height < 1 || height > 8000) return null;
  return {
    type: expectedType,
    chartTopPx,
    chartTopRatio,
    height,
  };
}

export function relativeFromClient(
  clientX: number,
  clientY: number,
  rect: DOMRectReadOnly
): { relativeX: number; relativeY: number } | null {
  if (rect.width < 1 || rect.height < 1) return null;
  const relativeX = (clientX - rect.left) / rect.width;
  const relativeY = (clientY - rect.top) / rect.height;
  if (!isValidRelativeCoord(relativeX) || !isValidRelativeCoord(relativeY)) return null;
  return { relativeX, relativeY };
}
