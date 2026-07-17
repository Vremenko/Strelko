import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useStrelko } from "../context/StrelkoContext";
import { setAuthReturn } from "../lib/auth-intent";
import { archiveEmbedUrl, archiveMapEmbedUrl } from "../lib/archive-embed";
import {
  activateStatDaysOverlayForGrafi,
  deactivateStatDaysOverlay,
  initArchiveDaysOverlay,
  initArchiveEmbedTap,
} from "../lib/archive-embed-interaction";
import {
  attachMapPeriodGate,
  ensureMapLockPortal,
  setMapLockPortalActive,
} from "../lib/map-period-access";
import { isPodpornikActive } from "../lib/portal-account";
import {
  ensureHourlyLockPortal,
  measureHourlyLockBox,
  type HourlyLockBox,
} from "../lib/archive-hourly-lock";
import { hasArchiveFullAccess, STRELKO_OPEN_ACCESS } from "../lib/season";
import { LockedContent } from "./LockedContent";
import type { StatTab } from "../types";

const LOCKED_OBCINA_CHARTS = [
  { id: "obcina", title: "Občine z največ strelami" },
  { id: "obcinaGostota", title: "Občine z največjo gostoto strel" },
] as const;

function ArchiveLockedChartPanel({ id, title }: { id: string; title: string }) {
  return (
    <section className="panel archive-locked-chart-panel" data-panel={id}>
      <div className="panel-head">
        <div className="panel-head-top">
          <h2 className="panel-head-title">{title}</h2>
        </div>
      </div>
      <div className="chart-wrap tall archive-locked-chart-panel__chart locked-content-surface">
        <LockedContent mode="supporter" inset />
      </div>
    </section>
  );
}

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
  const hourlyAccess = STRELKO_OPEN_ACCESS || isPodpornikActive(credits);
  const src = archiveEmbedUrl(scope, fullAccess, { hourlyAccess });
  const height = scope === "preview" ? "200" : "900";
  const title =
    scope === "preview" ? "Dnevni graf strel — Slovenija" : "Arhiv strel — Slovenija";
  const { show, wrapRef } = useLazyShow(visible);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  /**
   * CTA v parent (absolute v wrap): iframe ostane pointer-events:none → scroll deluje.
   * Meritev upošteva iframe vs parent koordinatni sistem (brez zamika levo).
   */
  const [hourlyLockBox, setHourlyLockBox] = useState<HourlyLockBox | null>(null);

  const syncHourlyLockOverlay = useCallback(() => {
    if (scope !== "full" || hourlyAccess || !visible) {
      setHourlyLockBox(null);
      return;
    }
    const iframe = iframeRef.current;
    const wrap = wrapRef.current;
    const mount = iframe?.contentDocument
      ? ensureHourlyLockPortal(iframe.contentDocument)
      : null;
    if (!iframe || !wrap || !mount) {
      setHourlyLockBox(null);
      return;
    }
    setHourlyLockBox(measureHourlyLockBox(wrap, iframe, mount));
  }, [hourlyAccess, scope, visible]);

  useEffect(() => {
    if (scope !== "full" || hourlyAccess || !visible) {
      setHourlyLockBox(null);
      return;
    }
    const onMessage = (ev: MessageEvent) => {
      const iframe = iframeRef.current;
      if (!iframe || ev.source !== iframe.contentWindow) return;
      if (ev.data?.type === "strele-embed-resize") {
        syncHourlyLockOverlay();
      }
    };
    window.addEventListener("message", onMessage);
    window.addEventListener("resize", syncHourlyLockOverlay);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("resize", syncHourlyLockOverlay);
    };
  }, [hourlyAccess, scope, visible, syncHourlyLockOverlay]);

  useLayoutEffect(() => {
    if (scope !== "full") return;
    if (!visible) {
      deactivateStatDaysOverlay(wrapId);
      return;
    }
    if (show) {
      activateStatDaysOverlayForGrafi(wrapId, iframeId);
      syncHourlyLockOverlay();
    }
  }, [visible, show, scope, wrapId, iframeId, syncHourlyLockOverlay]);

  return (
    <>
      <div
        ref={wrapRef}
        className={`archive-charts-embed-wrap${scope === "full" ? " archive-charts-embed-wrap--full" : ""}${hourlyLockBox ? " archive-charts-embed-wrap--hourly-lock" : ""}${visible ? "" : " stat-panel--hidden"}`}
        id={wrapId}
        data-embed-src={src}
        data-embed-scope={scope}
      >
        {show ? (
          <iframe
            ref={iframeRef}
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
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  syncHourlyLockOverlay();
                  if (scope === "full" && visible) {
                    activateStatDaysOverlayForGrafi(wrapId, iframeId);
                  }
                });
              });
            }}
          />
        ) : (
          <p className="archive-charts-placeholder" aria-hidden="true">
            Nalagam {scope === "preview" ? "statistiko" : "grafe"} …
          </p>
        )}
        {hourlyLockBox ? (
          <div
            className="archive-hourly-lock-overlay"
            style={{
              top: hourlyLockBox.top,
              left: hourlyLockBox.left,
              width: hourlyLockBox.width,
              height: hourlyLockBox.height,
            }}
          >
            <LockedContent mode="supporter" inset className="archive-hourly-locked" />
          </div>
        ) : null}
      </div>
      {scope === "full" && !fullAccess && visible ? (
        <div className="archive-locked-charts charts-layout">
          {LOCKED_OBCINA_CHARTS.map((chart) => (
            <ArchiveLockedChartPanel key={chart.id} id={chart.id} title={chart.title} />
          ))}
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
  const src = archiveMapEmbedUrl(30, { defaultRangeDays: 7 });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const detachGateRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockMount, setLockMount] = useState<HTMLElement | null>(null);
  const mapHeight = window.matchMedia("(max-width:899px)").matches ? "480" : "560";

  const syncLockPortal = useCallback((iframe: HTMLIFrameElement, lockedNow: boolean) => {
    const doc = iframe.contentDocument;
    if (!doc) return;
    const mount = ensureMapLockPortal(doc);
    setMapLockPortalActive(mount, lockedNow);
    setLockMount(mount);
    setLocked(lockedNow);
  }, []);

  const ensureMounted = () => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    setMounted(true);
  };

  const wirePeriodGate = useCallback(
    (iframe: HTMLIFrameElement) => {
      detachGateRef.current?.();
      detachGateRef.current = attachMapPeriodGate(iframe, (lockedNow, mount) => {
        setLocked(lockedNow);
        setLockMount(mount);
      });
    },
    []
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

  useEffect(() => () => detachGateRef.current?.(), []);

  useLayoutEffect(() => {
    if (visible) {
      deactivateStatDaysOverlay("archive-embed-full-wrap");
    }
  }, [visible]);

  const notifyMapVisible = (iframe: HTMLIFrameElement) => {
    iframe.contentWindow?.postMessage({ type: "strele-map-visible" }, "*");
    wirePeriodGate(iframe);
    syncLockPortal(iframe, false);
  };

  return (
    <div
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
      {locked && lockMount
        ? createPortal(
            <LockedContent mode="supporter" className="archive-map-locked" />,
            lockMount
          )
        : null}
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
  const location = useLocation();
  const { openAuth } = useStrelko();

  useLayoutEffect(() => {
    initArchiveEmbedTap();
    initArchiveDaysOverlay();
  }, []);

  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      const data = ev.data;
      if (!data || typeof data !== "object" || data.type !== "strele-embed-auth") return;
      if (data.action !== "login") return;
      setAuthReturn(`${location.pathname}${location.search}${location.hash}`);
      openAuth("login");
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [location.hash, location.pathname, location.search, openAuth]);

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
