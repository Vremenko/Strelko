import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
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
import { canAccessMapGrid, markMapGridLockFlash } from "../lib/map-grid-access";
import {
  ensureHourlyLockPortal,
  measureHourlyLockBox,
  type HourlyLockBox,
} from "../lib/archive-hourly-lock";
import { hasArchiveFullAccess } from "../lib/season";
import { LockedContent } from "./LockedContent";
import type { StatTab } from "../types";

export const STRELKO_ACCESS_REVOKED_EVENT = "strelko-access-revoked";

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

export type ArchiveAccessMode = "auto" | "public";

interface ArchiveChartEmbedProps {
  wrapId: string;
  iframeId: string;
  scope: "preview" | "full";
  visible?: boolean;
  /** public = vedno javni grafi (brez Podpornik odklepov), tudi če je uporabnik prijavljen. */
  accessMode?: ArchiveAccessMode;
  /** Privzeto obdobje v dnevih (npr. 7). */
  periodDays?: number;
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
  accessMode = "auto",
  periodDays,
}: ArchiveChartEmbedProps) {
  const { credits, plansMeta } = useStrelko();
  const forcePublic = accessMode === "public";
  const fullAccess = forcePublic ? false : hasArchiveFullAccess(credits, plansMeta);
  /* Po urah: odklenjeno za vse (tudi brez Podpornika); v javnem embedu tudi. */
  const hourlyAccess = true;
  const src = archiveEmbedUrl(
    scope,
    fullAccess,
    { hourlyAccess },
    { days: periodDays, publicEmbed: forcePublic }
  );
  /* Javni embed: 3 paneli (dnevi + ure + regije); nato točno prek resize. */
  const height = forcePublic ? "980" : scope === "preview" ? "200" : "900";
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
    if (forcePublic || scope !== "full" || hourlyAccess || !visible) {
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
  }, [forcePublic, hourlyAccess, scope, visible]);

  useEffect(() => {
    if (forcePublic || scope !== "full" || hourlyAccess || !visible) {
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
  }, [forcePublic, hourlyAccess, scope, visible, syncHourlyLockOverlay]);

  useLayoutEffect(() => {
    if (scope !== "full") return;
    if (forcePublic) {
      deactivateStatDaysOverlay(wrapId);
      return;
    }
    if (!visible) {
      deactivateStatDaysOverlay(wrapId);
      return;
    }
    if (show) {
      activateStatDaysOverlayForGrafi(wrapId, iframeId);
      syncHourlyLockOverlay();
    }
  }, [visible, show, scope, wrapId, iframeId, syncHourlyLockOverlay, forcePublic]);

  return (
    <>
      <div
        ref={wrapRef}
        className={`archive-charts-embed-wrap${scope === "full" ? " archive-charts-embed-wrap--full" : ""}${hourlyLockBox ? " archive-charts-embed-wrap--hourly-lock" : ""}${forcePublic ? " archive-charts-embed-wrap--public" : ""}${visible ? "" : " stat-panel--hidden"}`}
        id={wrapId}
        data-embed-src={src}
        data-embed-scope={scope}
      >
        {show ? (
          <iframe
            ref={iframeRef}
            key={src}
            id={iframeId}
            className={`archive-charts-embed${forcePublic ? " archive-charts-embed--public" : ""}`}
            src={src}
            title={title}
            width="100%"
            height={height}
            loading={window.matchMedia("(max-width:899px)").matches ? "eager" : "lazy"}
            scrolling="no"
            style={
              forcePublic
                ? { overflow: "hidden", minHeight: 850 }
                : { overflow: "hidden" }
            }
            onLoad={() => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  syncHourlyLockOverlay();
                  if (scope === "full" && visible && !forcePublic) {
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
      {scope === "full" && !fullAccess && !forcePublic && visible ? (
        <div className="archive-locked-charts charts-layout">
          {LOCKED_OBCINA_CHARTS.map((chart) => (
            <ArchiveLockedChartPanel key={chart.id} id={chart.id} title={chart.title} />
          ))}
        </div>
      ) : null}
    </>
  );
}

function ArchiveMapEmbedSupporter({
  visible = true,
  periodDays = 30,
  hideGrid = false,
}: {
  visible?: boolean;
  periodDays?: number;
  hideGrid?: boolean;
}) {
  const src = archiveMapEmbedUrl(periodDays, hideGrid ? { hideGrid: true } : undefined);
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

  useEffect(() => {
    const onRevoked = () => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "strele-map-set-access", supporter: false },
        "*"
      );
    };
    window.addEventListener(STRELKO_ACCESS_REVOKED_EVENT, onRevoked);
    return () => window.removeEventListener(STRELKO_ACCESS_REVOKED_EVENT, onRevoked);
  }, []);

  useLayoutEffect(() => {
    if (visible) {
      deactivateStatDaysOverlay("archive-embed-full-wrap");
    }
  }, [visible]);

  const notifyMapVisible = (iframe: HTMLIFrameElement) => {
    iframe.contentWindow?.postMessage({ type: "strele-map-visible" }, "*");
    iframe.contentWindow?.postMessage({ type: "strele-map-set-access", supporter: true }, "*");
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

function ArchiveMapEmbedGated({
  visible = true,
  periodDays,
  hideGrid = false,
}: {
  visible?: boolean;
  /**
   * 1 ali 7 = fiksno obdobje (javni embed z ?period=).
   * Brez vrednosti: map-embed izbere Danes, če so danes strele, sicer 7 dni
   * (days=30 v URL je signal »ne zakleni«, default_range_days=7 je rezervni).
   */
  periodDays?: number;
  hideGrid?: boolean;
}) {
  const lockedFreeDays =
    periodDays === 1 || periodDays === 7 ? periodDays : null;
  const src = archiveMapEmbedUrl(lockedFreeDays ?? 30, {
    defaultRangeDays: 7,
    hideGrid,
    supporter: false,
  });
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
      /* Javni embed: plačljivih obdobij ni v DOM — Podpornik portal ni potreben. */
      if (hideGrid) {
        detachGateRef.current = null;
        return;
      }
      detachGateRef.current = attachMapPeriodGate(iframe, (lockedNow, mount) => {
        setLocked(lockedNow);
        setLockMount(mount);
      });
    },
    [hideGrid]
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

export function ArchiveMapEmbed({
  visible = true,
  accessMode = "auto",
  periodDays,
  hideGridTab = false,
}: {
  visible?: boolean;
  accessMode?: ArchiveAccessMode;
  periodDays?: number;
  /** Javni embed: skrij Mreža 1 × 1 km. */
  hideGridTab?: boolean;
}) {
  const { credits } = useStrelko();
  const forcePublic = accessMode === "public";
  const hasSupporter = forcePublic ? false : canAccessMapGrid(credits);
  const prevAccessRef = useRef(hasSupporter);

  if (!forcePublic && prevAccessRef.current && !hasSupporter) {
    markMapGridLockFlash();
  }
  prevAccessRef.current = hasSupporter;

  if (hasSupporter) {
    return (
      <ArchiveMapEmbedSupporter
        visible={visible}
        periodDays={periodDays ?? 30}
        hideGrid={hideGridTab}
      />
    );
  }

  return (
    <ArchiveMapEmbedGated
      visible={visible}
      periodDays={periodDays}
      hideGrid={forcePublic || hideGridTab}
    />
  );
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
        <Link to="/statistika" className="btn btn-primary archive-charts-more">
          Več grafov
        </Link>
      </div>
    </section>
  );
}
