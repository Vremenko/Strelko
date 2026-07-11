import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useStrelko } from "../context/StrelkoContext";
import { archiveEmbedUrl, archiveMapEmbedUrl } from "../lib/archive-embed";
import {
  activateStatDaysOverlayForGrafi,
  deactivateStatDaysOverlay,
  initArchiveDaysOverlay,
  initArchiveEmbedTap,
} from "../lib/archive-embed-interaction";
import {
  attachMapPeriodGate,
  getMapStageOverlayBox,
  isMapPeriodLockedInIframe,
} from "../lib/map-period-access";
import { isPodpornikActive } from "../lib/portal-account";
import { hasArchiveFullAccess, STRELKO_OPEN_ACCESS } from "../lib/season";
import { LockedContent } from "./LockedContent";
import type { StatTab } from "../types";

interface ArchiveChartEmbedProps {
  wrapId: string;
  iframeId: string;
  scope: "preview" | "full";
  visible?: boolean;
}

function useLazyShow(enabled: boolean) {
  const [show, setShow] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) {
      setShow(false);
      return;
    }
    const wrap = wrapRef.current;
    if (!wrap) return;

    const reveal = () => setShow(true);
    const isMobile = window.matchMedia("(max-width:899px)").matches;
    if (isMobile || !("IntersectionObserver" in window)) {
      reveal();
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          obs.disconnect();
          reveal();
        }
      },
      { rootMargin: "240px 0px" }
    );
    obs.observe(wrap);
    return () => obs.disconnect();
  }, [enabled]);

  return { show, wrapRef };
}

export function ArchiveChartEmbed({
  wrapId,
  iframeId,
  scope,
  visible = true,
}: ArchiveChartEmbedProps) {
  const { credits, plansMeta } = useStrelko();
  const fullAccess = hasArchiveFullAccess(credits, plansMeta);
  const src = archiveEmbedUrl(scope, fullAccess);
  const height = scope === "preview" ? "200" : "900";
  const title =
    scope === "preview" ? "Dnevni graf strel — Slovenija" : "Arhiv strel — Slovenija";
  const { show, wrapRef } = useLazyShow(visible);

  useLayoutEffect(() => {
    if (scope !== "full") return;
    if (!visible) {
      deactivateStatDaysOverlay(wrapId);
      return;
    }
    if (show) {
      activateStatDaysOverlayForGrafi(wrapId, iframeId);
    }
  }, [visible, show, scope, wrapId, iframeId]);

  return (
    <>
      <div
        ref={wrapRef}
        className={`archive-charts-embed-wrap${scope === "full" ? " archive-charts-embed-wrap--full" : ""}${visible ? "" : " stat-panel--hidden"}`}
        id={wrapId}
        data-embed-src={src}
        data-embed-scope={scope}
      >
        {show ? (
          <iframe
            key={src}
            id={iframeId}
            className="archive-charts-embed"
            src={src}
            title={title}
            width="100%"
            height={height}
            loading={window.matchMedia("(max-width:899px)").matches ? "eager" : "lazy"}
            scrolling="no"
            style={{ overflow: "hidden" }}
            onLoad={() => {
              if (scope === "full" && visible) {
                activateStatDaysOverlayForGrafi(wrapId, iframeId);
              }
            }}
          />
        ) : (
          <p className="archive-charts-placeholder" aria-hidden="true">
            Nalagam {scope === "preview" ? "statistiko" : "grafe"} …
          </p>
        )}
      </div>
      {scope === "full" && !fullAccess && visible ? (
        <div className="archive-locked-charts">
          <LockedContent mode="supporter" className="archive-locked-charts__panel" />
          <LockedContent mode="supporter" className="archive-locked-charts__panel" />
        </div>
      ) : null}
    </>
  );
}

function ArchiveMapEmbedSupporter({ visible = true }: { visible?: boolean }) {
  const src = archiveMapEmbedUrl(30);
  const wrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mountedRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const mapHeight = window.matchMedia("(max-width:899px)").matches ? "480" : "560";

  const ensureMounted = () => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    setMounted(true);
  };

  useEffect(() => {
    if (mountedRef.current) return;

    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const run = () => {
      if (cancelled || mountedRef.current) return;
      ensureMounted();
    };

    if (typeof requestIdleCallback !== "undefined") {
      idleId = requestIdleCallback(run, { timeout: 800 });
    } else {
      timeoutId = setTimeout(run, 800);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof cancelIdleCallback !== "undefined") {
        cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (visible) ensureMounted();
  }, [visible]);

  useEffect(() => {
    if (!visible || !mounted) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "strele-map-visible" }, "*");
  }, [visible, mounted]);

  useLayoutEffect(() => {
    if (visible) {
      deactivateStatDaysOverlay("archive-embed-full-wrap");
    }
  }, [visible]);

  const notifyMapVisible = (iframe: HTMLIFrameElement) => {
    iframe.contentWindow?.postMessage({ type: "strele-map-visible" }, "*");
  };

  return (
    <div
      ref={wrapRef}
      className={`archive-map-wrap${visible ? "" : " stat-panel--hidden"}`}
      id="archive-map-wrap"
      data-map-src={src}
    >
      {mounted ? (
        <iframe
          ref={iframeRef}
          id="archive-map-iframe"
          className="archive-map-iframe"
          src={src}
          title="Zemljevid strel po občinah — Slovenija"
          width="100%"
          height={mapHeight}
          loading="eager"
          scrolling="no"
          style={{ overflow: "hidden" }}
          onLoad={(e) => notifyMapVisible(e.currentTarget)}
        />
      ) : (
        <p className="archive-charts-placeholder" aria-hidden="true">
          Nalagam zemljevid …
        </p>
      )}
    </div>
  );
}

function ArchiveMapEmbedGated({ visible = true }: { visible?: boolean }) {
  const src = archiveMapEmbedUrl(7);
  const wrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const detachGateRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [overlayBox, setOverlayBox] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const mapHeight = window.matchMedia("(max-width:899px)").matches ? "480" : "560";

  const updateOverlay = useCallback(() => {
    const iframe = iframeRef.current;
    const wrap = wrapRef.current;
    if (!iframe || !wrap) return;
    const lockedNow = iframe.contentDocument
      ? isMapPeriodLockedInIframe(iframe.contentDocument)
      : false;
    setLocked(lockedNow);
    if (!lockedNow) {
      setOverlayBox(null);
      return;
    }
    setOverlayBox(getMapStageOverlayBox(iframe, wrap));
  }, []);

  const ensureMounted = () => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    setMounted(true);
  };

  const wirePeriodGate = useCallback(
    (iframe: HTMLIFrameElement) => {
      detachGateRef.current?.();
      detachGateRef.current = attachMapPeriodGate(iframe, {
        onLockedChange: () => updateOverlay(),
        onLayoutChange: () => updateOverlay(),
      });
    },
    [updateOverlay]
  );

  useEffect(() => {
    if (mountedRef.current) return;

    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const run = () => {
      if (cancelled || mountedRef.current) return;
      ensureMounted();
    };

    if (typeof requestIdleCallback !== "undefined") {
      idleId = requestIdleCallback(run, { timeout: 800 });
    } else {
      timeoutId = setTimeout(run, 800);
    }

    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof cancelIdleCallback !== "undefined") {
        cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (visible) ensureMounted();
  }, [visible]);

  useEffect(() => {
    if (!visible || !mounted) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "strele-map-visible" }, "*");
  }, [visible, mounted]);

  useEffect(() => {
    updateOverlay();
  }, [updateOverlay, mounted, visible]);

  useEffect(() => {
    const onResize = () => updateOverlay();
    window.addEventListener("resize", onResize);
    const onMessage = (ev: MessageEvent) => {
      if (ev.data?.type === "strele-embed-resize") updateOverlay();
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("message", onMessage);
    };
  }, [updateOverlay]);

  useEffect(() => () => detachGateRef.current?.(), []);

  useLayoutEffect(() => {
    if (visible) {
      deactivateStatDaysOverlay("archive-embed-full-wrap");
    }
  }, [visible]);

  const notifyMapVisible = (iframe: HTMLIFrameElement) => {
    iframe.contentWindow?.postMessage({ type: "strele-map-visible" }, "*");
    wirePeriodGate(iframe);
    updateOverlay();
  };

  return (
    <div
      ref={wrapRef}
      className={`archive-map-wrap archive-map-wrap--gated${visible ? "" : " stat-panel--hidden"}`}
      id="archive-map-wrap"
      data-map-src={src}
    >
      {mounted ? (
        <iframe
          ref={iframeRef}
          id="archive-map-iframe"
          className="archive-map-iframe"
          src={src}
          title="Zemljevid strel po občinah — Slovenija"
          width="100%"
          height={mapHeight}
          loading="eager"
          scrolling="no"
          style={{ overflow: "hidden" }}
          onLoad={(e) => notifyMapVisible(e.currentTarget)}
        />
      ) : (
        <p className="archive-charts-placeholder" aria-hidden="true">
          Nalagam zemljevid …
        </p>
      )}
      {locked && overlayBox ? (
        <div
          className="archive-map-lock-overlay"
          style={{
            top: overlayBox.top,
            left: overlayBox.left,
            width: overlayBox.width,
            height: overlayBox.height,
          }}
        >
          <LockedContent mode="supporter" className="archive-map-locked" />
        </div>
      ) : null}
    </div>
  );
}

export function ArchiveMapEmbed({ visible = true }: { visible?: boolean }) {
  const { credits } = useStrelko();
  const hasSupporter = STRELKO_OPEN_ACCESS || isPodpornikActive(credits);

  if (hasSupporter) {
    return <ArchiveMapEmbedSupporter visible={visible} />;
  }

  return <ArchiveMapEmbedGated visible={visible} />;
}

export function ArchiveEmbedHost() {
  useLayoutEffect(() => {
    initArchiveEmbedTap();
    initArchiveDaysOverlay();
  }, []);
  return null;
}

export function StatistikaTabs({
  tab,
  onChange,
}: {
  tab: StatTab;
  onChange: (t: StatTab) => void;
}) {
  return (
    <div className="stat-tabs" role="tablist" aria-label="Pogled">
      {(["grafi", "zemljevid"] as const).map((t) => (
        <button
          key={t}
          type="button"
          className={`stat-tab${tab === t ? " stat-tab--active" : ""}`}
          role="tab"
          aria-selected={tab === t}
          onClick={() => onChange(t)}
        >
          {t === "grafi" ? "Grafi" : "Zemljevid"}
        </button>
      ))}
    </div>
  );
}

export function LandingArchivePreview() {
  return (
    <section className="archive-charts-preview" id="statistika-strel">
      <ArchiveChartEmbed
        wrapId="archive-embed-wrap"
        iframeId="archive-embed"
        scope="preview"
      />
      <div className="archive-charts-actions">
        <a href="/statistika" className="btn btn-primary archive-charts-more">
          Več grafov
        </a>
      </div>
    </section>
  );
}
