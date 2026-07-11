import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useStrelko } from "../context/StrelkoContext";
import { archiveEmbedUrl, archiveMapEmbedUrl } from "../lib/archive-embed";
import {
  activateStatDaysOverlayForGrafi,
  deactivateStatDaysOverlay,
  initArchiveDaysOverlay,
  initArchiveEmbedTap,
} from "../lib/archive-embed-interaction";
import { isMapPeriodLocked, type MapPeriodMode } from "../lib/map-period-access";
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
      {scope === "full" && !fullAccess ? (
        <div className="archive-locked-charts">
          <LockedContent mode="supporter" className="archive-locked-charts__panel" />
          <LockedContent mode="supporter" className="archive-locked-charts__panel" />
        </div>
      ) : null}
    </>
  );
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function ArchiveMapToolbar({
  periodMode,
  days,
  mapDay,
  onPeriodModeChange,
  onDaysChange,
  onMapDayChange,
}: {
  periodMode: MapPeriodMode;
  days: number;
  mapDay: string;
  onPeriodModeChange: (mode: MapPeriodMode) => void;
  onDaysChange: (days: number) => void;
  onMapDayChange: (day: string) => void;
}) {
  const selectValue =
    periodMode === "day" ? "pick" : String(days);

  return (
    <div className="archive-map-toolbar" role="toolbar" aria-label="Nastavitve zemljevida">
      <label className="archive-map-toolbar__field" htmlFor="archive-map-period-select">
        Obdobje
      </label>
      <select
        id="archive-map-period-select"
        className="archive-map-toolbar__select"
        value={selectValue}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "pick") {
            onPeriodModeChange("day");
            onMapDayChange(mapDay || todayIso());
            return;
          }
          onPeriodModeChange("range");
          onDaysChange(parseInt(value, 10) || 7);
        }}
      >
        <option value="1">Danes</option>
        <option value="7">7 dni</option>
        <option value="14">14 dni</option>
        <option value="30">30 dni</option>
        <option value="90">90 dni</option>
        <option value="pick">Datum</option>
      </select>
      {periodMode === "day" ? (
        <input
          type="date"
          className="archive-map-toolbar__date"
          aria-label="Datum prikaza"
          value={mapDay}
          max={todayIso()}
          onChange={(e) => onMapDayChange(e.target.value)}
        />
      ) : null}
    </div>
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
  const [periodMode, setPeriodMode] = useState<MapPeriodMode>("range");
  const [days, setDays] = useState(7);
  const [mapDay, setMapDay] = useState(todayIso());
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mapHeight = window.matchMedia("(max-width:899px)").matches ? "480" : "560";
  const locked = isMapPeriodLocked(days, periodMode);
  const mapSrc =
    !locked && periodMode === "range"
      ? archiveMapEmbedUrl(days, { hideChrome: true })
      : !locked && periodMode === "day" && mapDay
        ? archiveMapEmbedUrl(1, { hideChrome: true, day: mapDay })
        : null;

  useLayoutEffect(() => {
    if (visible) {
      deactivateStatDaysOverlay("archive-embed-full-wrap");
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || locked || !mapSrc || !iframeRef.current) return;
    iframeRef.current.contentWindow?.postMessage({ type: "strele-map-visible" }, "*");
  }, [visible, locked, mapSrc]);

  return (
    <div
      className={`archive-map-wrap archive-map-wrap--gated${visible ? "" : " stat-panel--hidden"}`}
      id="archive-map-wrap"
    >
      <ArchiveMapToolbar
        periodMode={periodMode}
        days={days}
        mapDay={mapDay}
        onPeriodModeChange={setPeriodMode}
        onDaysChange={setDays}
        onMapDayChange={setMapDay}
      />
      <div className="archive-map-stage">
        {locked ? (
          <LockedContent mode="supporter" className="archive-map-locked" />
        ) : mapSrc ? (
          <iframe
            ref={iframeRef}
            id="archive-map-iframe"
            className="archive-map-iframe"
            src={mapSrc}
            title="Zemljevid strel po občinah — Slovenija"
            width="100%"
            height={mapHeight}
            loading="eager"
            scrolling="no"
            style={{ overflow: "hidden" }}
            onLoad={(e) => {
              e.currentTarget.contentWindow?.postMessage({ type: "strele-map-visible" }, "*");
            }}
          />
        ) : null}
      </div>
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
