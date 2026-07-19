import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { RequireAdmin } from "../components/RequireAdmin";
import { archiveEmbedUrl, archiveMapEmbedUrl } from "../lib/archive-embed";
import { copyTextToClipboard } from "../lib/widget-obcine";
import {
  assertPublicEmbedHtml,
  buildPublicEmbedHtml,
  buildPublicEmbedSrc,
  periodDaysForId,
  PUBLIC_CHART_PERIODS,
  PUBLIC_MAP_PERIODS,
  type PublicChartPeriodId,
  type PublicEmbedKind,
  type PublicMapPeriodId,
} from "../lib/public-embed";

const COPY_MS = 2500;

/** Predogled na /admin2: arhivski iframe (dovoljen s strelko).
 *  Javni /embed/* ima frame-ancestors samo za meteoinfo.si. */
function adminPreviewSrc(kind: PublicEmbedKind, periodId: string): string {
  const days = periodDaysForId(kind, periodId);
  if (kind === "charts") {
    return archiveEmbedUrl("full", false, { hourlyAccess: false }, { days, publicEmbed: true });
  }
  return archiveMapEmbedUrl(days === 1 || days === 7 ? days : 7, {
    defaultRangeDays: 7,
    hideGrid: true,
    supporter: false,
  });
}

function EmbedGeneratorCard({
  kind,
  title,
  description,
  periods,
  period,
  onPeriod,
}: {
  kind: PublicEmbedKind;
  title: string;
  description: string;
  periods: readonly { id: string; label: string }[];
  period: string;
  onPeriod: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  const html = useMemo(
    () => buildPublicEmbedHtml(kind, period, { frameId: `admin2-preview-${kind}` }),
    [kind, period]
  );
  const publicSrc = useMemo(() => buildPublicEmbedSrc(kind, period), [kind, period]);
  const previewSrc = useMemo(() => adminPreviewSrc(kind, period), [kind, period]);

  useEffect(() => {
    try {
      assertPublicEmbedHtml(html, kind);
      setCopyError(null);
    } catch (err) {
      setCopyError(err instanceof Error ? err.message : "Koda ni veljavna.");
    }
  }, [html, kind]);

  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (!ev.data || ev.data.type !== "strele-embed-resize") return;
      const frame = previewRef.current;
      if (!frame || ev.source !== frame.contentWindow) return;
      const h = Math.max(480, Math.min(2400, +ev.data.height || 0));
      if (h > 0) frame.style.height = `${h}px`;
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    return () => {
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
    };
  }, []);

  const onCopy = async () => {
    setCopyError(null);
    try {
      assertPublicEmbedHtml(html, kind);
      await copyTextToClipboard(html);
      setCopied(true);
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
      copyResetRef.current = setTimeout(() => setCopied(false), COPY_MS);
    } catch (err) {
      setCopied(false);
      setCopyError(err instanceof Error ? err.message : "Kopiranje ni uspelo.");
    }
  };

  const publicPath = publicSrc.replace(/^https?:\/\/[^/]+/, "");

  return (
    <article className="admin2-card legal-card">
      <header className="admin2-card__head">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>

      <label className="admin2-field field-labeled">
        <span>Privzeto obdobje</span>
        <select
          value={period}
          onChange={(e) => onPeriod(e.target.value)}
          aria-label={`Obdobje za ${title}`}
        >
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <div className="admin2-preview">
        <p className="admin2-label">Predogled v živo</p>
        <p className="admin2-preview-note">
          Predogled uporablja isti arhivski prikaz kot Statistika. Kopirljiva koda kaže na{" "}
          <code>{publicPath}</code> (vgradnja samo z meteoinfo.si). Če spremeniš obdobje,
          znova kopiraj in prilepi celotno kodo na WordPress.
        </p>
        <iframe
          ref={previewRef}
          key={previewSrc}
          className="admin2-preview__iframe"
          src={previewSrc}
          title={`Predogled: ${title}`}
          width="100%"
          loading="lazy"
          style={{
            width: "100%",
            border: 0,
            display: "block",
            minHeight: kind === "charts" ? 850 : 640,
            background: "#1a1a1a",
          }}
        />
      </div>

      <div className="admin2-code">
        <p className="admin2-label">Iframe koda</p>
        <textarea
          className="admin2-code__ta widget-obcine-embed-code"
          readOnly
          value={html}
          rows={12}
          aria-label={`Koda za ${title}`}
        />
        <div className="admin2-code__actions">
          <button type="button" className="btn btn-primary" onClick={() => void onCopy()}>
            Kopiraj kodo
          </button>
          {copied ? (
            <span className="admin2-copy-ok" role="status">
              Koda je kopirana
            </span>
          ) : null}
          {copyError ? (
            <span className="admin2-copy-err" role="alert">
              {copyError}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Admin2Inner() {
  const [chartPeriod, setChartPeriod] = useState<PublicChartPeriodId>("7d");
  const [mapPeriod, setMapPeriod] = useState<PublicMapPeriodId>("7d");

  return (
    <section className="portal-page page--standard admin-page admin2-page">
      <header className="page-header">
        <h1>Vgradne kode</h1>
        <p className="pricing-lead">
          Ustvarite iframe-kode za vgradnjo javnih grafov in občinskega zemljevida na meteoinfo.si.
          Prikazi uporabljajo iste komponente kot stran Statistika — brez navigacije in noge.
          Obdobje izbereš tukaj, nato kodo kopiraš in prilepiš na WordPress — sprememba obdobja
          na tej strani ne posodobi že vgrajene kode na meteoinfo.si.
        </p>
        <p>
          <Link to="/admin" className="btn btn-ghost">
            Nazaj na admin
          </Link>
        </p>
      </header>

      <div className="admin2-grid">
        <EmbedGeneratorCard
          kind="charts"
          title="Javni statistični grafi"
          description="En iframe z grafi: po dnevih, po urah in po statističnih regijah. Klik na dnevni stolpec posodobi spodnja grafa. Vsebine paketa Podpornik (občine) niso vključene."
          periods={PUBLIC_CHART_PERIODS}
          period={chartPeriod}
          onPeriod={(id) => setChartPeriod(id as PublicChartPeriodId)}
        />
        <EmbedGeneratorCard
          kind="map"
          title="Zemljevid občin in graf"
          description="En iframe z občinskim zemljevidom, grafom pod njim in izbirnikom obdobja (Danes, 7 dni). Zavihek Mreža 1 × 1 km in zaklenjena obdobja niso vključeni."
          periods={PUBLIC_MAP_PERIODS}
          period={mapPeriod}
          onPeriod={(id) => setMapPeriod(id as PublicMapPeriodId)}
        />
      </div>
    </section>
  );
}

export function Admin2Page() {
  return (
    <RequireAdmin>
      <Admin2Inner />
    </RequireAdmin>
  );
}
