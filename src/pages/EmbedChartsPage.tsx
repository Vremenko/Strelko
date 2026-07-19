import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ArchiveChartEmbed } from "../components/ArchiveEmbed";
import {
  usePublicEmbedAutoHeight,
  useForwardInnerEmbedResize,
} from "../hooks/useEmbedAutoHeight";
import {
  periodDaysForId,
  resolvePublicEmbedPeriod,
  isAllowedPublicEmbedParentOrigin,
  PUBLIC_EMBED_PARENT_ORIGINS,
} from "../lib/public-embed";
import {
  PUBLIC_CHART_LAYOUT_TYPE,
  PUBLIC_CHART_PARENT_LAYOUT_TYPE,
  PUBLIC_CHART_PARENT_POINTER_TYPE,
  PUBLIC_CHART_POINTER_TYPE,
  chartEmbedTargetOrigin,
  hasFinePointerMedia,
  isPublicChartTapGesture,
  isValidRelativeCoord,
  newChartInteractionId,
  parseChartLayoutPayload,
  parseChartPointerPayload,
  relativeFromClient,
} from "../lib/public-chart-pointer";

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/**
 * Javni grafi: iframe vedno pointer-events:none.
 * Prozoren sloj pokrije celoten iframe (tudi izbirnik) in pošlje klike/hover.
 */
function usePublicChartsPointerLayer(iframeId: string) {
  const pressRef = useRef<{
    x: number;
    y: number;
    moved: boolean;
    id: string;
  } | null>(null);
  const hoverRafRef = useRef(0);
  const hoverPendingRef = useRef<{
    relativeX: number;
    relativeY: number;
    interactionId: string;
  } | null>(null);
  const fineRef = useRef(false);

  useEffect(() => {
    fineRef.current = hasFinePointerMedia();
  }, []);

  const postToCharts = useCallback(
    (
      action: "click" | "move" | "leave",
      relativeX: number,
      relativeY: number,
      interactionId: string
    ) => {
      const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
      const cw = iframe?.contentWindow;
      if (!cw) return;
      cw.postMessage(
        {
          type: PUBLIC_CHART_POINTER_TYPE,
          action,
          relativeX,
          relativeY,
          interactionId,
        },
        chartEmbedTargetOrigin()
      );
    },
    [iframeId]
  );

  /** WP pošlje koordinate glede na zunanji Strelko iframe → pretvori v notranji. */
  const relayParentPointer = useCallback(
    (
      action: "click" | "move" | "leave",
      relativeX: number,
      relativeY: number,
      interactionId: string
    ) => {
      if (action === "leave") {
        postToCharts("leave", 0, 0, interactionId);
        return;
      }
      const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
      if (!iframe) return;
      const vw = window.innerWidth || document.documentElement.clientWidth || 1;
      const vh = window.innerHeight || document.documentElement.clientHeight || 1;
      const clientX = relativeX * vw;
      const clientY = relativeY * vh;
      const rect = iframe.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const innerX = clamp01((clientX - rect.left) / rect.width);
      const innerY = clamp01((clientY - rect.top) / rect.height);
      if (!isValidRelativeCoord(innerX) || !isValidRelativeCoord(innerY)) return;
      postToCharts(action, innerX, innerY, interactionId);
    },
    [iframeId, postToCharts]
  );

  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (!isAllowedPublicEmbedParentOrigin(ev.origin)) return;
      if (window.parent !== window && ev.source !== window.parent) return;
      const ptr = parseChartPointerPayload(ev.data, PUBLIC_CHART_PARENT_POINTER_TYPE);
      if (!ptr) return;
      relayParentPointer(ptr.action, ptr.relativeX, ptr.relativeY, ptr.interactionId);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [relayParentPointer]);

  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
      if (!iframe || ev.source !== iframe.contentWindow) return;
      const layout = parseChartLayoutPayload(ev.data, PUBLIC_CHART_LAYOUT_TYPE);
      if (!layout) return;
      if (window.parent === window) return;
      const payload = {
        type: PUBLIC_CHART_PARENT_LAYOUT_TYPE,
        chartTopPx: layout.chartTopPx,
        chartTopRatio: layout.chartTopRatio,
        height: layout.height,
      };
      for (const origin of PUBLIC_EMBED_PARENT_ORIGINS) {
        try {
          window.parent.postMessage(payload, origin);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [iframeId]);

  useEffect(() => {
    return () => {
      if (hoverRafRef.current) cancelAnimationFrame(hoverRafRef.current);
    };
  }, []);

  const onPointerDown = (ev: React.PointerEvent) => {
    if (ev.pointerType === "mouse" && ev.button !== 0) return;
    pressRef.current = {
      x: ev.clientX,
      y: ev.clientY,
      moved: false,
      id: newChartInteractionId(),
    };
  };

  const onPointerMove = (ev: React.PointerEvent) => {
    const press = pressRef.current;
    if (press) {
      if (!isPublicChartTapGesture(ev.clientX - press.x, ev.clientY - press.y)) {
        press.moved = true;
      }
      return;
    }
    if (!fineRef.current || ev.pointerType === "touch") return;
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
    if (!iframe) return;
    const rel = relativeFromClient(ev.clientX, ev.clientY, iframe.getBoundingClientRect());
    if (!rel) return;
    hoverPendingRef.current = {
      ...rel,
      interactionId: newChartInteractionId(),
    };
    if (hoverRafRef.current) return;
    hoverRafRef.current = requestAnimationFrame(() => {
      hoverRafRef.current = 0;
      const pending = hoverPendingRef.current;
      hoverPendingRef.current = null;
      if (!pending) return;
      postToCharts("move", pending.relativeX, pending.relativeY, pending.interactionId);
    });
  };

  const onPointerUp = (ev: React.PointerEvent) => {
    const press = pressRef.current;
    pressRef.current = null;
    if (!press || press.moved) return;
    if (!isPublicChartTapGesture(ev.clientX - press.x, ev.clientY - press.y)) return;
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
    if (!iframe) return;
    const rel = relativeFromClient(ev.clientX, ev.clientY, iframe.getBoundingClientRect());
    if (!rel) return;
    postToCharts("click", rel.relativeX, rel.relativeY, press.id);
  };

  const onPointerCancel = () => {
    pressRef.current = null;
  };

  const onPointerLeave = () => {
    if (pressRef.current) return;
    postToCharts("leave", 0, 0, newChartInteractionId());
  };

  return {
    overlayHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onPointerLeave,
    },
  };
}

/** Javni iframe: dnevni + regije (public). */
export function EmbedChartsPage() {
  const [params] = useSearchParams();
  const periodId = useMemo(() => resolvePublicEmbedPeriod("charts", params), [params]);
  const periodDays = useMemo(() => periodDaysForId("charts", periodId), [periodId]);

  usePublicEmbedAutoHeight(true, 850);
  useForwardInnerEmbedResize("#embed-charts-iframe");

  const { overlayHandlers } = usePublicChartsPointerLayer("embed-charts-iframe");

  return (
    <div className="public-embed-page public-embed-page--charts">
      <div className="public-embed-charts-box">
        <ArchiveChartEmbed
          wrapId="embed-charts-wrap"
          iframeId="embed-charts-iframe"
          scope="full"
          visible
          accessMode="public"
          periodDays={periodDays}
        />
        <div
          className="public-embed-charts-overlay"
          aria-hidden="true"
          {...overlayHandlers}
        />
      </div>
    </div>
  );
}
