import { useEffect, useRef } from "react";
import { SearchCard } from "../components/SearchCard";
import { CreditsBar } from "../components/CreditsBar";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { PreviewNoStrikes, PreviewTeaser } from "../components/PreviewScreens";
import { ResultsView } from "../components/ResultsView";
import { useStrelko } from "../context/StrelkoContext";

export function ZavarovalnicaPage() {
  const { searchResult, previewScreen, loading } = useStrelko();
  const hadSearchResultRef = useRef(Boolean(searchResult));

  useEffect(() => {
    const hasResult = Boolean(searchResult);
    if (hasResult && !hadSearchResultRef.current) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    hadSearchResultRef.current = hasResult;
  }, [searchResult]);

  if (searchResult) {
    return (
      <>
        <CreditsBar />
        <ErrorBoundary
          fallback={
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              Pregleda rezultatov trenutno ni mogoče prikazati. Poskusite znova iskanje.
            </p>
          }
        >
          <ResultsView zavarovalnica />
        </ErrorBoundary>
      </>
    );
  }

  if (previewScreen === "teaser") {
    return <PreviewTeaser />;
  }

  if (previewScreen === "no-strikes") {
    return <PreviewNoStrikes />;
  }

  return (
    <section className="zavarovalnica-page page--standard">
      <div className="page-header">
        <header className="zavarovalnica-hero">
          <h2>
            Vam je <em>strela</em> poškodovala klimatsko napravo, televizijo ali drugo elektroniko?
          </h2>
        </header>
        <div className="zavarovalnica-intro">
          <p className="zavarovalnica-lead">
            Strelko preveri udare strel v bližini vašega naslova in pripravi pregleden izpis, ki vam
            lahko pomaga pri komunikaciji z zavarovalnico.
          </p>
          <p className="zavarovalnica-lead">
            Na podlagi razpoložljivih podatkov prikažemo, ali so bili v izbranem obdobju v okolici
            vašega naslova zaznani udari strel. Rezultate si lahko ogledate na zemljevidu in v tabeli
            ter jih shranite kot informativni PDF za prijavo škode zavarovalnici.
          </p>
        </div>
      </div>
      <div className="zavarovalnica-includes">
        <h3 className="zavarovalnica-includes__title">Kaj vključuje pregled</h3>
        <ul className="zavarovalnica-includes__list">
          <li>zaznane strele v okolici izbranega naslova,</li>
          <li>čas in oddaljenost posamezne strele,</li>
          <li>pregled rezultatov v tabeli.</li>
          <li>zemljevid z označeno lokacijo in udari strel,</li>
          <li>povzetek izbranega radija in obdobja,</li>
          <li>izvoz pregleda v PDF.</li>
        </ul>
      </div>
      <SearchCard
        busy={loading}
        inline
        title="Preverite strele v bližini naslova"
        intro="Vnesite naslov ter izberite radij in obdobje pregleda."
        label="Vnesite naslov (kraj in hišna št.), občino ali ulico"
        placeholder="npr. Škrabčev trg 2, Ribnica"
        buttonText="Prikaži rezultate"
        showOptions
      />
    </section>
  );
}
