import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { SearchCard } from "../components/SearchCard";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { PreviewNoStrikes, PreviewTeaser } from "../components/PreviewScreens";
import { ResultsView } from "../components/ResultsView";
import { ZavarovalnicaRecentQueries } from "../components/ZavarovalnicaRecentQueries";
import { useStrelko } from "../context/StrelkoContext";
import {
  deriveZavarovalnicaViewState,
  type QueryViewState,
} from "../lib/zavarovalnica-view-transition";

function scrollWindowTopAfterPaint() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  });
}

export function ZavarovalnicaPage() {
  const {
    searchResult,
    previewScreen,
    loading,
    savedQueryId,
    pendingResultNavigation,
    holdResultsQueryId,
    preferFormAfterBack,
    zavarovalnicaSkipFormScrollRef,
  } = useStrelko();
  const location = useLocation();
  const hasQueryParam = Boolean(new URLSearchParams(location.search).get("query"));

  const viewState = deriveZavarovalnicaViewState(
    searchResult,
    previewScreen,
    loading,
    hasQueryParam,
    pendingResultNavigation,
    holdResultsQueryId,
    savedQueryId,
    preferFormAfterBack
  );
  const prevViewRef = useRef<QueryViewState>(viewState);
  const scrolledForQueryRef = useRef<string | null>(null);
  const previewKind = previewScreen === "no-strikes" ? "no-strikes" : "teaser";
  const showResults = viewState === "results" && Boolean(searchResult);

  useLayoutEffect(() => {
    if (!showResults || !savedQueryId) return;
    if (scrolledForQueryRef.current === savedQueryId) return;
    scrolledForQueryRef.current = savedQueryId;
    window.scrollTo(0, 0);
  }, [showResults, savedQueryId]);

  useEffect(() => {
    const prev = prevViewRef.current;

    if (viewState === "preview" && prev !== "preview" && prev !== "unlocking") {
      if (!zavarovalnicaSkipFormScrollRef.current) {
        scrollWindowTopAfterPaint();
      }
    }

    if (viewState === "form" && (prev === "results" || prev === "preview" || prev === "unlocking")) {
      scrolledForQueryRef.current = null;
      if (!zavarovalnicaSkipFormScrollRef.current) {
        scrollWindowTopAfterPaint();
      }
    }

    prevViewRef.current = viewState;
  }, [viewState, zavarovalnicaSkipFormScrollRef]);

  return (
    <section className="zavarovalnica-page page--standard">
      {searchResult ? (
        <div hidden={!showResults} aria-hidden={!showResults}>
          <ErrorBoundary
            fallback={
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                Pregleda rezultatov trenutno ni mogoče prikazati. Poskusite znova iskanje.
              </p>
            }
          >
            <ResultsView zavarovalnica />
          </ErrorBoundary>
        </div>
      ) : null}

      {!showResults && (viewState === "preview" || viewState === "unlocking") ? (
        previewKind === "no-strikes" ? (
          <PreviewNoStrikes />
        ) : (
          <PreviewTeaser />
        )
      ) : null}

      {/* Samo čisto nalaganje — BREZ marketing naslova in BREZ celotnega obrazca. */}
      {!showResults && viewState === "loading" ? (
        <div className="zavarovalnica-loading" role="status" aria-live="polite">
          <p className="zavarovalnica-loading__text">Pripravljam pregled …</p>
        </div>
      ) : null}

      {/* Marketing obrazec samo v stanju form — nikoli med aktivno poizvedbo. */}
      {!showResults && viewState === "form" ? (
        <>
          <div className="page-header">
            <header className="zavarovalnica-hero">
              <h1>
                Vam je <em>strela</em> poškodovala klimatsko napravo, televizijo ali drugo
                elektroniko?
              </h1>
            </header>
          </div>
          <div className="zavarovalnica-intro">
            <p className="zavarovalnica-lead">
              Strelko preveri udare strel v bližini vašega naslova in pripravi pregleden izpis, ki
              vam lahko pomaga pri komunikaciji z zavarovalnico.
            </p>
          </div>
          <div className="zavarovalnica-main-grid">
            <div className="zavarovalnica-main-grid__form">
              <SearchCard
                busy={false}
                inline
                title="Preverite strele v bližini naslova"
                intro="Vnesite naslov ter izberite radij in obdobje pregleda."
                label="Vnesite naslov (kraj in hišna št.), občino ali ulico"
                placeholder="npr. Ulica 1, Ljubljana"
                buttonText="Prikaži rezultate"
                showOptions
              />
            </div>
            <aside className="zavarovalnica-main-grid__aside">
              <div className="zavarovalnica-includes">
                <h3 className="zavarovalnica-includes__title">Kaj vključuje pregled</h3>
                <ul className="zavarovalnica-includes__list">
                  <li>zaznane strele v okolici izbranega naslova,</li>
                  <li>čas in oddaljenost posamezne strele,</li>
                  <li>pregled rezultatov v tabeli,</li>
                  <li>zemljevid z označeno lokacijo in udari strel,</li>
                  <li>povzetek izbranega radija in obdobja,</li>
                  <li>izvoz pregleda v PDF.</li>
                </ul>
              </div>
            </aside>
          </div>
          <ZavarovalnicaRecentQueries />
        </>
      ) : null}
    </section>
  );
}
