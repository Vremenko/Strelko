import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useStrelko } from "../../context/StrelkoContext";
import { TOKEN_USAGE_RULES } from "../../lib/pricing-offers";
import { tokenWord } from "../../lib/ob-skodi-tokens";
import {
  formatQueryExecutedAt,
} from "../../lib/saved-queries";
import { PortalEmptyState } from "./PortalEmptyState";

function formatPeriod(from: string, to: string): string {
  return `${from} – ${to}`;
}

export function PortalQueries() {
  const {
    savedQueries,
    savedQueriesLoading,
    savedQueriesError,
    loadSavedQueries,
    openSavedQuery,
    generateSavedQueryPdf,
  } = useStrelko();
  const [pdfBusyId, setPdfBusyId] = useState<string | null>(null);

  const onOpen = useCallback(
    (queryId: string) => {
      void openSavedQuery(queryId);
    },
    [openSavedQuery]
  );

  const onPdf = useCallback(
    async (queryId: string) => {
      setPdfBusyId(queryId);
      try {
        await generateSavedQueryPdf(queryId);
      } finally {
        setPdfBusyId(null);
      }
    },
    [generateSavedQueryPdf]
  );

  return (
    <div className="portal-panel">
      <article className="portal-card portal-card--full">
        {savedQueriesLoading ? (
          <div className="portal-empty-state legal-card">
            <p className="portal-empty-state__text">Nalagam shranjene poizvedbe …</p>
          </div>
        ) : savedQueriesError ? (
          <div className="portal-empty-state legal-card">
            <h2 className="portal-empty-state__title">Poizvedb ni mogoče naložiti</h2>
            <p className="portal-empty-state__text">{savedQueriesError}</p>
            <div className="portal-empty-actions">
              <button type="button" className="btn btn-primary" onClick={() => void loadSavedQueries()}>
                Poskusi znova
              </button>
            </div>
          </div>
        ) : savedQueries.length === 0 ? (
          <PortalEmptyState
            title="Še nimate shranjenih poizvedb"
            description="Ko izvedete podrobno iskanje na strani Pomoč pri zavarovalnici, se poizvedba samodejno shrani tukaj. Pri vsaki poizvedbi boste videli lokacijo, radij, obdobje, datum izvedbe, porabljene žetone in rezultat."
          >
            <div className="portal-empty-actions">
              <Link to="/pomoc-pri-zavarovalnici" className="btn btn-primary">
                Nova poizvedba
              </Link>
            </div>
          </PortalEmptyState>
        ) : (
          <div className="portal-queries-list">
            {savedQueries.map((q) => {
              const locationLabel = q.label?.trim() || `${q.lat.toFixed(4)}, ${q.lon.toFixed(4)}`;
              const pdfBusy = pdfBusyId === q.id;
              return (
                <article key={q.id} className="portal-query-card">
                  <header className="portal-query-card__head">
                    <h3 className="portal-query-card__title">{locationLabel}</h3>
                    <p className="portal-query-card__meta">
                      Izvedeno {formatQueryExecutedAt(q.created_at)}
                    </p>
                  </header>
                  <dl className="portal-query-card__details">
                    <div>
                      <dt>Obdobje</dt>
                      <dd>{formatPeriod(q.date_from, q.date_to)}</dd>
                    </div>
                    <div>
                      <dt>Radij</dt>
                      <dd>{q.radius_km} km</dd>
                    </div>
                    <div>
                      <dt>Porabljeni žetoni</dt>
                      <dd>
                        {q.tokens_spent} {tokenWord(q.tokens_spent)}
                      </dd>
                    </div>
                    <div>
                      <dt>Rezultat</dt>
                      <dd>{q.total_strikes} udarov</dd>
                    </div>
                  </dl>
                  <div className="portal-query-card__actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => onOpen(q.id)}
                    >
                      Odpri
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={pdfBusy}
                      onClick={() => void onPdf(q.id)}
                    >
                      {pdfBusy ? "Pripravljam PDF …" : q.pdf_button_label}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </article>

      <article className="portal-card portal-card--rules">
        <h2 className="portal-card__title">Kratka pravila porabe žetonov</h2>
        <ul className="plan-features">
          {TOKEN_USAGE_RULES.map((r) => (
            <li key={r.daysLabel}>
              {r.daysLabel}: <strong>{r.tokens}</strong> {tokenWord(r.tokens)}
            </li>
          ))}
          <li>
            Prva izdelava PDF-ja: <strong>+1 žeton</strong>
          </li>
          <li>Ponovna izdelava PDF-ja iste lokacije in radija je brezplačna, če je obdobje enako ali krajše od že plačenega</li>
        </ul>
      </article>
    </div>
  );
}
