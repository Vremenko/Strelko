import { SearchCard } from "../components/SearchCard";
import { CreditsBar } from "../components/CreditsBar";
import { PreviewNoStrikes, PreviewTeaser } from "../components/PreviewScreens";
import { ResultsView } from "../components/ResultsView";
import { useStrelko } from "../context/StrelkoContext";

export function ZavarovalnicaPage() {
  const { searchResult, previewScreen, loading } = useStrelko();

  if (searchResult) {
    return (
      <>
        <CreditsBar />
        <ResultsView zavarovalnica />
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
    <section className="zavarovalnica-page">
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
          ter jih shranite kot PDF izpis.
        </p>
      </div>
      <div className="zavarovalnica-grid">
        <div className="zavarovalnica-block zavarovalnica-block--how">
          <h3 className="zavarovalnica-subtitle">Kako deluje</h3>
          <ol className="zavarovalnica-steps">
            <li>Vnesete naslov, kjer je nastala škoda, ter izberete obdobje pregleda.</li>
            <li>Strelko preveri zaznane udare strel v izbranem radiju okoli naslova.</li>
            <li>Rezultate prikaže na zemljevidu in v tabeli.</li>
            <li>Pregled lahko shranite kot PDF in ga uporabite kot prilogo pri prijavi škode.</li>
          </ol>
        </div>
        <div className="zavarovalnica-block zavarovalnica-block--benefits">
          <h3 className="zavarovalnica-subtitle">Kaj vključuje pregled</h3>
          <ul className="zavarovalnica-list">
            <li>pregled zaznanih udarov strel v bližini izbranega naslova,</li>
            <li>zemljevid z lokacijami udarov in označeno lokacijo naslova,</li>
            <li>čas in oddaljenost posameznih udarov strel,</li>
            <li>povzetek rezultatov za izbrano obdobje,</li>
            <li>možnost izvoza oziroma shranjevanja pregleda v PDF obliki.</li>
          </ul>
        </div>
      </div>
      <SearchCard
        busy={loading}
        inline
        title="Preverite udare strel v bližini"
        intro="Vnesite naslov, izberite radij in obdobje pregleda. Po kliku na gumb se bodo prikazani udari strel v okolici izbrane lokacije."
        label="Vnesite naslov (kraj in hišna št.), občino ali ulico"
        placeholder="npr. Škrabčev trg 2, Ribnica"
        buttonText="Prikaži rezultate"
        showOptions
      />
    </section>
  );
}
