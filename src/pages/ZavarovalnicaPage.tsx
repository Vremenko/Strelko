import { useEffect, useRef } from "react";
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

const RESULTS_ID = "zavarovalnica-results";

function scrollElementAfterPaint(elementId: string) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById(elementId)?.scrollIntoView({ behavior: "auto", block: "start" });
    });
  });
}

function scrollWindowTopAfterPaint() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  });
}

export function ZavarovalnicaPage() {
  const { searchResult, previewScreen, loading, savedQueryId, zavarovalnicaSkipFormScrollRef } =
    useStrelko();
  const location = useLocation();
  const hasQueryParam = Boolean(new URLSearchParams(location.search).get("query"));

  const viewState = deriveZavarovalnicaViewState(
    searchResult,
    previewScreen,
    loading,
    hasQueryParam
  );
  const prevViewRef = useRef<QueryViewState>(viewState);
  const scrolledForQueryRef = useRef<string | null>(null);
  const previewKind = previewScreen === "no-strikes" ? "no-strikes" : "teaser";

  useEffect(() => {
    const prev = prevViewRef.current;

    if (viewState === "results" && searchResult && savedQueryId) {
      if (!(prev === "results" && scrolledForQueryRef.current === savedQueryId)) {
        scrolledForQueryRef.current = savedQueryId;
        scrollElementAfterPaint(RESULTS_ID);
      }
    }

    if (viewState === "preview" && prev !== "preview" && prev !== "unlocking") {
      if (!zavarovalnicaSkipFormScrollRef.current) {
        scrollWindowTopAfterPaint();
      }
    }

    if (
      (viewState === "form" || viewState === "loading") &&
      (prev === "results" || prev === "preview" || prev === "unlocking")
    ) {
      scrolledForQueryRef.current = null;
      if (!zavarovalnicaSkipFormScrollRef.current) {
        scrollWindowTopAfterPaint();
      }
    }

    prevViewRef.current = viewState;
  }, [viewState, searchResult, savedQueryId, zavarovalnicaSkipFormScrollRef]);

  if (viewState === "results" && searchResult) {
    return (
      <section id={RESULTS_ID} className="zavarovalnica-page page--standard">
        <ErrorBoundary
          fallback={
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              Pregleda rezultatov trenutno ni mogoče prikazati. Poskusite znova iskanje.
            </p>
          }
        >
          <ResultsView zavarovalnica />
        </ErrorBoundary>
      </section>
    );
  }

  if (viewState === "preview" || viewState === "unlocking") {
    return (
      <section className="zavarovalnica-page page--standard">
        {previewKind === "no-strikes" ? <PreviewNoStrikes /> : <PreviewTeaser />}
      </section>
    );
  }

  /* form | loading: začetno iskanje; SearchCard prikaže indikator med loading. */
  return (
    <section className="zavarovalnica-page page--standard">
      <div className="page-header">
        <header className="zavarovalnica-hero">
          <h1>
            Vam je <em>strela</em> poškodovala klimatsko napravo, televizijo ali drugo elektroniko?
          </h1>
        </header>
      </div>
      <div className="zavarovalnica-intro">
        <p className="zavarovalnica-lead">
          Strelko preveri udare strel v bližini vašega naslova in pripravi pregleden izpis, ki vam
          lahko pomaga pri komunikaciji z zavarovalnico.
        </p>
      </div>
      <div className="zavarovalnica-main-grid">
        <div className="zavarovalnica-main-grid__form">
          <SearchCard
            busy={loading || viewState === "loading"}
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
    </section>
  );
}
