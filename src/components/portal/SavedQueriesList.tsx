import { PdfDownloadPanel } from "../PdfDownloadPanel";
import { formatSlDateRange } from "../../lib/dates";
import { tokenCountLabel } from "../../lib/ob-skodi-tokens";
import { formatQueryExecutedAt, strikeCountLabel } from "../../lib/saved-queries";
import type { SavedQuerySummary } from "../../types";

type SavedQueriesListProps = {
  queries: SavedQuerySummary[];
  creditsBalance: number | null;
  pdfBusyId: string | null;
  pdfErrors: Record<string, string | null>;
  onOpen: (queryId: string) => void;
  onPdf: (queryId: string) => void;
};

/** Skupni prikaz kartic poizvedb — enak v Moj Strelko in na Pomoči pri zavarovalnici. */
export function SavedQueriesList({
  queries,
  creditsBalance,
  pdfBusyId,
  pdfErrors,
  onOpen,
  onPdf,
}: SavedQueriesListProps) {
  return (
    <div className="portal-queries-list">
      {queries.map((q) => {
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
                  {q.tokens_spent === 0 ? "Brezplačno" : tokenCountLabel(q.tokens_spent)}
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
                onDownload={() => onPdf(q.id)}
                errorMessage={pdfErrors[q.id] ?? null}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}
