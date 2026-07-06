import { Link } from "react-router-dom";
import { HeroHouseIllustration } from "../components/HeroHouseIllustration";
import { LandingArchivePreview, ArchiveEmbedHost } from "../components/ArchiveEmbed";
import { PreviewNoStrikes, PreviewTeaser } from "../components/PreviewScreens";
import { IconInsurance, IconMap, IconShield } from "../components/icons";
import { useStrelko } from "../context/StrelkoContext";

export function LandingPage() {
  const { previewScreen } = useStrelko();

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
      <section className="hero hero--landing">
        <HeroHouseIllustration />
        <h2>
          Strele v bližini vašega doma — <em>na enem mestu</em>
        </h2>
        <p className="lead lead-follow">
          Preverite udare strel, si oglejte statistiko Slovenije ali pripravite podlago za
          zavarovalnico.
        </p>
      </section>
      <section className="features">
        <Link to="/pomoc-pri-zavarovalnici" className="feature feature--link">
          <IconInsurance />
          <h4>Pomoč pri zavarovalnici</h4>
          <p>Podatki in PDF poročilo za dokazovanje bližnjih udarov (paket Ob škodi).</p>
        </Link>
        <Link to="/statistika#zemljevid" className="feature feature--link">
          <IconMap />
          <h4>Zemljevid udarov</h4>
          <p>Pregled strel po Sloveniji na interaktivnem zemljevidu.</p>
        </Link>
        <Link to="/statistika" className="feature feature--link">
          <IconShield />
          <h4>Statistika strel</h4>
          <p>Sezonski arhiv in brezplačen widget občine za vašo spletno stran.</p>
        </Link>
      </section>
      <LandingArchivePreview />
    </>
  );
}
