import { Link } from "react-router-dom";
import { HeroHouseIllustration } from "../components/HeroHouseIllustration";
import { SearchCard } from "../components/SearchCard";
import { LandingArchivePreview, ArchiveEmbedHost } from "../components/ArchiveEmbed";
import { PreviewNoStrikes, PreviewTeaser } from "../components/PreviewScreens";
import { IconInsurance, IconMap, IconShield } from "../components/icons";
import { ResultsView } from "../components/ResultsView";
import { useStrelko } from "../context/StrelkoContext";

export function LandingPage() {
  const { searchResult, previewScreen, loading, user } = useStrelko();

  if (searchResult) {
    return (
      <>
        <ArchiveEmbedHost />
        <ResultsView />
      </>
    );
  }

  if (previewScreen === "teaser") {
    return (
      <>
        <ArchiveEmbedHost />
        <PreviewTeaser />
      </>
    );
  }

  if (previewScreen === "no-strikes") {
    return (
      <>
        <ArchiveEmbedHost />
        <PreviewNoStrikes />
      </>
    );
  }

  return (
    <>
      <ArchiveEmbedHost />
      <section className="hero">
        <HeroHouseIllustration />
        <h2>
          Vam je udar <em>strele</em> uničil klimatsko napravo ali televizijo?
        </h2>
        <p className="lead lead-follow">
          Strelko vam lahko pomaga povrniti stroške z informativnim pregledom udarov strel v bližini.
        </p>
        <SearchCard busy={loading} showOptions />
      </section>
      <section className="features">
        <Link to="/pomoc-pri-zavarovalnici" className="feature feature--link">
          <IconInsurance />
          <h4>Pomoč pri zavarovalnici</h4>
          <p>Podatki za dokazovanje bližnjih udarov strel pri zavrnitvi škode.</p>
        </Link>
        <Link to="/statistika#zemljevid" className="feature feature--link">
          <IconMap />
          <h4>Zemljevid udarov</h4>
          <p>Pregled strel okoli vašega doma na interaktivnem zemljevidu.</p>
        </Link>
        <Link to="/statistika" className="feature feature--link">
          <IconShield />
          <h4>Arhiv strel</h4>
          <p>Statistika udarov strel po Sloveniji — dnevni in urni pregled.</p>
        </Link>
      </section>
      <LandingArchivePreview loggedIn={!!user} />
    </>
  );
}
