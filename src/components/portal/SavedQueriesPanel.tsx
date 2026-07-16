import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStrelko } from "../../context/StrelkoContext";
import { tokenCountLabel } from "../../lib/ob-skodi-tokens";
import { PortalEmptyState } from "./PortalEmptyState";
import { PortalQueriesPagination } from "./PortalQueriesPagination";
import { SavedQueriesList } from "./SavedQueriesList";

const PAGE_SIZE = 5;

export type SavedQueriesPanelProps = {
  /** Če je nastavljeno, prikaže samo prvih N poizvedb (brez paginacije). */
  maxItems?: number;
  /** Povezava pod seznamom (npr. »Prikaži vse v Moj Strelko«). */
  footerLink?: { to: string; label: string };
  /**
   * `portal` — prazno stanje z CTA (Moj Strelko).
   * `hide` — ob praznem seznamu ne prikaže ničesar (vrača null).
   */
  emptyBehavior?: "portal" | "hide";
  /** Naslov nad panelom (npr. na Pomoči pri zavarovalnici). */
  sectionTitle?: string;
  sectionClassName?: string;
  sectionTitleId?: string;
};

/**
 * Skupni panel seznama shranjenih poizvedb.
 * Vizualno enak v Moj Strelko in pod obrazcem na Pomoči pri zavarovalnici.
 */
export function SavedQueriesPanel({
  maxItems,
  footerLink,
  emptyBehavior = "portal",
  sectionTitle,
  sectionClassName,
  sectionTitleId,
}: SavedQueriesPanelProps) {
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
  const pendingScrollRef = useRef<{ x: number; y: number } | null>(null);

  const paginated = maxItems == null;

  useEffect(() => {
    setPage(0);
  }, [savedQueries.length]);

  const totalPages = Math.max(1, Math.ceil(savedQueries.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);

  useEffect(() => {
    if (!paginated) return;
    if (page !== safePage) setPage(safePage);
  }, [paginated, page, safePage]);

  const visibleQueries = useMemo(() => {
    if (maxItems != null) return savedQueries.slice(0, maxItems);
    return savedQueries.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  }, [savedQueries, maxItems, safePage]);

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

  const goToPage = useCallback(
    (next: number) => {
      pendingScrollRef.current = { x: window.scrollX, y: window.scrollY };
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setPage(Math.max(0, Math.min(totalPages - 1, next)));
    },
    [totalPages]
  );

  useLayoutEffect(() => {
    if (!paginated) return;
    const saved = pendingScrollRef.current;
    if (!saved) return;
    pendingScrollRef.current = null;
    window.scrollTo(saved.x, saved.y);
  }, [paginated, safePage]);

  if (emptyBehavior === "hide" && !savedQueriesLoading && !savedQueriesError && savedQueries.length === 0) {
    return null;
  }

  const panel = (
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
          <div className="portal-queries-list-wrap">
            <SavedQueriesList
              queries={visibleQueries}
              creditsBalance={creditsBalance}
              pdfBusyId={pdfBusyId}
              pdfErrors={pdfErrors}
              onOpen={onOpen}
              onPdf={(id) => void onPdf(id)}
            />
            {paginated ? (
              <PortalQueriesPagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            ) : null}
            {footerLink ? (
              <p className="portal-card__footer-link">
                <Link to={footerLink.to}>{footerLink.label}</Link>
              </p>
            ) : null}
          </div>
        )}
      </article>
    </div>
  );

  if (!sectionTitle) return panel;

  return (
    <section
      className={sectionClassName}
      aria-labelledby={sectionTitleId || undefined}
    >
      <h2 id={sectionTitleId} className="zavarovalnica-recent__title">
        {sectionTitle}
      </h2>
      {panel}
    </section>
  );
}
