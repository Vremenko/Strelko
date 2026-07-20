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
        <h1>
          Preverite udare strel <em>v svoji bližini</em>
        </h1>
        <p className="lead lead-follow">
          Oglejte si zemljevid strel v Sloveniji, raziščite statistiko ali pripravite poročilo za
          zavarovalnico.
        </p>
      </section>
      <section className="features">
        <Link to="/pomoc-pri-zavarovalnici" className="feature feature--link">
          <IconInsurance />
          <h4>Pomoč pri zavarovalnici</h4>
          <p>Preverite udare strel v bližini izbrane lokacije in ustvarite PDF-poročilo.</p>
        </Link>
        <Link to="/statistika#zemljevid" className="feature feature--link">
          <IconMap />
          <h4>Zemljevid strel</h4>
          <p>Na interaktivnem zemljevidu preverite, kje in kdaj so bile v Sloveniji zaznane strele.</p>
        </Link>
        <Link to="/statistika" className="feature feature--link">
          <IconShield />
          <h4>Statistika strel</h4>
          <p>
            Oglejte si število udarov strel po dnevih in urah ter primerjavo po regijah in občinah.
          </p>
        </Link>
      </section>
      <LandingArchivePreview />
    </>
  );
}
