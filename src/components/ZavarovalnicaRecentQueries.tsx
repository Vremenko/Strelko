import { useStrelko } from "../context/StrelkoContext";
import { portalTabPath } from "../lib/auth-intent";
import { SavedQueriesPanel } from "./portal/SavedQueriesPanel";

const RECENT_LIMIT = 3;

/** Zadnjih nekaj poizvedb pod obrazcem — isti prikaz kartic kot v Moj Strelko. */
export function ZavarovalnicaRecentQueries() {
  const { user } = useStrelko();
  if (!user) return null;

  return (
    <SavedQueriesPanel
      maxItems={RECENT_LIMIT}
      emptyBehavior="hide"
      sectionClassName="zavarovalnica-recent"
      sectionTitle="Moje zadnje poizvedbe"
      sectionTitleId="zavarovalnica-recent-title"
      footerLink={{
        to: portalTabPath("poizvedbe"),
        label: "Prikaži vse v Moj Strelko",
      }}
    />
  );
}
