import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PdfDownloadPanel } from "../PdfDownloadPanel";
import { useStrelko } from "../../context/StrelkoContext";
import { formatSlDateRange } from "../../lib/dates";
import { TOKEN_USAGE_RULES } from "../../lib/pricing-offers";
import { tokenCountLabel } from "../../lib/ob-skodi-tokens";
import { formatQueryExecutedAt, strikeCountLabel } from "../../lib/saved-queries";
import { PortalEmptyState } from "./PortalEmptyState";

const QUERIES_PER_PAGE = 5;

export function PortalQueries() {
  const {
    credits,
    savedQueries,
    savedQueriesLoading,
    savedQueriesError,
    loadSavedQueries,
    openSavedQuery,
    generateSavedQueryPdf,
  } = useStrelko();
  const [pdfBusyId, setPdfBusyId] = useState<string | null>(null);
  const [pdfErrors, setPdfErrors] = useState<Record<string, string | null>>({});
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [savedQueries.length]);

  const totalPages = Math.max(1, Math.ceil(savedQueries.length / QUERIES_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const pageQueries = useMemo(
    () =>
      savedQueries.slice(
        safePage * QUERIES_PER_PAGE,
        safePage * QUERIES_PER_PAGE + QUERIES_PER_PAGE
      ),
    [savedQueries, safePage]
  );

  const onOpen = useCallback(
    (queryId: string) => {
      void openSavedQuery(queryId);
    },
    [openSavedQuery]
  );

  const onPdf = useCallback(
    async (queryId: string) => {
      setPdfBusyId(queryId);
      setPdfErrors((prev) => ({ ...prev, [queryId]: null }));
      try {
        await generateSavedQueryPdf(queryId);
      } catch (e) {
        const err = e as { status?: number; message?: string };
        if (err.status === 402) {
          setPdfErrors((prev) => ({
            ...prev,
            [queryId]: `Za izdelavo PDF-poročila potrebujete ${tokenCountLabel(1, "accusative")}.`,
          }));
        } else {
          alert(err.message || "PDF ni mogoče pripraviti.");
        }
      } finally {
        setPdfBusyId(null);
      }
    },
    [generateSavedQueryPdf]
  );

  const creditsBalance = credits?.credits_balance ?? null;

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
            {pageQueries.map((q) => {
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
                      <dd>{formatSlDateRange(q.date_from, q.date_to)}</dd>
                    </div>
                    <div>
                      <dt>Radij</dt>
                      <dd>{q.radius_km} km</dd>
                    </div>
                    <div>
                      <dt>Porabljeni žetoni</dt>
                      <dd>
                        {q.tokens_spent === 0
                          ? "Brezplačno"
                          : tokenCountLabel(q.tokens_spent)}
                      </dd>
                    </div>
                    <div>
                      <dt>Rezultat</dt>
                      <dd>{strikeCountLabel(q.total_strikes)}</dd>
                    </div>
                  </dl>
                  <div className="portal-query-card__actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm portal-query-card__btn"
                      onClick={() => onOpen(q.id)}
                    >
                      Odpri
                    </button>
                    <PdfDownloadPanel
                      compact
                      pdfTokensCost={q.pdf_tokens_cost}
                      pdfButtonLabel={q.pdf_button_label}
                      creditsBalance={creditsBalance}
                      downloading={pdfBusy}
                      onDownload={() => void onPdf(q.id)}
                      errorMessage={pdfErrors[q.id] ?? null}
                    />
                  </div>
                </article>
              );
            })}
            {savedQueries.length > QUERIES_PER_PAGE ? (
              <nav className="portal-queries-pagination" aria-label="Strani poizvedb">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={safePage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Prejšnja
                </button>
                <span className="portal-queries-pagination__status">
                  Stran {safePage + 1} od {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  Naslednja
                </button>
              </nav>
            ) : null}
          </div>
        )}
      </article>

      <article className="portal-card portal-card--rules">
        <h2 className="portal-card__title">Kratka pravila porabe žetonov</h2>
        <ul className="plan-features">
          {TOKEN_USAGE_RULES.map((r) => (
            <li key={r.daysLabel}>
              {r.daysLabel}: <strong>{tokenCountLabel(r.tokens)}</strong>
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
