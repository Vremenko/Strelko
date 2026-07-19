import { useEffect, useRef } from "react";
import {
  isAllowedPublicEmbedParentOrigin,
  PUBLIC_EMBED_RESIZE_TYPE,
} from "../lib/public-embed";

/**
 * Pošilja višino dovoljenim staršem (meteoinfo.si) prek postMessage.
 * Uporablja ResizeObserver — brez časovnega ugibanja.
 */
export function usePublicEmbedAutoHeight(enabled = true, minHeight = 320): void {
  const lastHeightRef = useRef(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (window.parent === window) return;

    const postHeight = (raw: number) => {
      const height = Math.max(minHeight, Math.round(raw));
      if (Math.abs(height - lastHeightRef.current) < 2) return;
      lastHeightRef.current = height;
      const payload = { type: PUBLIC_EMBED_RESIZE_TYPE, height };
      for (const origin of [
        "https://meteoinfo.si",
        "https://www.meteoinfo.si",
        window.location.origin,
      ]) {
        if (
          origin === window.location.origin ||
          isAllowedPublicEmbedParentOrigin(origin)
        ) {
          try {
            window.parent.postMessage(payload, origin);
          } catch {
            /* ignore */
          }
        }
      }
    };

    const measure = () => {
      const root = document.getElementById("root") || document.body;
      const charts = document.getElementById("embed-charts-wrap");
      const iframe = document.getElementById("embed-charts-iframe");
      const h = Math.max(
        root?.scrollHeight || 0,
        document.documentElement.scrollHeight || 0,
        document.body?.scrollHeight || 0,
        charts?.scrollHeight || 0,
        (iframe ? iframe.offsetTop + iframe.offsetHeight : 0) || 0
      );
      postHeight(h);
    };

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => measure())
        : null;
    if (ro) {
      ro.observe(document.documentElement);
      if (document.body) ro.observe(document.body);
      const root = document.getElementById("root");
      if (root) ro.observe(root);
      const charts = document.getElementById("embed-charts-wrap");
      if (charts) ro.observe(charts);
      const iframe = document.getElementById("embed-charts-iframe");
      if (iframe) ro.observe(iframe);
    }

    window.addEventListener("resize", measure);
    measure();
    const t1 = window.setTimeout(() => {
      const charts = document.getElementById("embed-charts-wrap");
      const iframe = document.getElementById("embed-charts-iframe");
      if (ro && charts) ro.observe(charts);
      if (ro && iframe) ro.observe(iframe);
      measure();
    }, 200);
    const t2 = window.setTimeout(measure, 800);
    const t3 = window.setTimeout(measure, 2000);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [enabled, minHeight]);
}

/** Posreduje strele-embed-resize iz notranjega arhivskega iframe-a v višino iframe-a. */
export function useForwardInnerEmbedResize(
  iframeSelector: string,
  onInnerHeight?: (height: number) => void
): void {
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      const iframe = document.querySelector(iframeSelector) as HTMLIFrameElement | null;
      if (!iframe || ev.source !== iframe.contentWindow) return;
      if (!ev.data || ev.data.type !== "strele-embed-resize") return;
      const h = Number(ev.data.height) || 0;
      if (h > 0) {
        const next = Math.max(320, Math.min(2400, Math.round(h)));
        iframe.style.height = `${next}px`;
        iframe.height = String(next);
        onInnerHeight?.(next);
        /* Sproži ponovno merjenje zunanjega public-embed višine. */
        window.dispatchEvent(new Event("resize"));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [iframeSelector, onInnerHeight]);
}
