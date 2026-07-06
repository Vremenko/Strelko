import { useEffect, useRef, useState } from "react";
import { useStrelko } from "../context/StrelkoContext";
import { archiveEmbedUrl, archiveMapEmbedUrl } from "../lib/archive-embed";
import { initArchiveDaysOverlay, initArchiveEmbedTap } from "../lib/archive-embed-interaction";
import { hasArchiveFullAccess } from "../lib/season";
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

  return (
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
        />
      ) : (
        <p className="archive-charts-placeholder" aria-hidden="true">
          Nalagam {scope === "preview" ? "statistiko" : "grafe"} …
        </p>
      )}
    </div>
  );
}

export function ArchiveMapEmbed({ visible = true }: { visible?: boolean }) {
  const src = archiveMapEmbedUrl(30);
  const { show, wrapRef } = useLazyShow(visible);

  return (
    <div
      ref={wrapRef}
      className={`archive-map-wrap${visible ? "" : " stat-panel--hidden"}`}
      id="archive-map-wrap"
      data-map-src={src}
    >
      {show ? (
        <iframe
          id="archive-map-iframe"
          className="archive-map-iframe"
          src={src}
          title="Zemljevid strel po občinah — Slovenija"
          width="100%"
          height={window.matchMedia("(max-width:899px)").matches ? "480" : "560"}
          loading="eager"
          scrolling="no"
          style={{ overflow: "hidden" }}
          onLoad={(e) => {
            (e.currentTarget as HTMLIFrameElement).contentWindow?.postMessage(
              { type: "strele-map-visible" },
              "*"
            );
          }}
        />
      ) : (
        <p className="archive-charts-placeholder" aria-hidden="true">
          Nalagam zemljevid …
        </p>
      )}
    </div>
  );
}

export function ArchiveEmbedHost() {
  useEffect(() => {
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
      <h3 className="archive-charts-title">Statistika strel v Sloveniji</h3>
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
