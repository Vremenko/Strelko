import { useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RequireAuth } from "../components/RequireAuth";
import { PortalOverview } from "../components/portal/PortalOverview";
import { PortalQueries } from "../components/portal/PortalQueries";
import { PortalSubscription } from "../components/portal/PortalSubscription";
import { PortalTabs, parsePortalTab, type PortalTabId } from "../components/portal/PortalTabs";
import { useStrelko } from "../context/StrelkoContext";

function PortalContent({ tab }: { tab: PortalTabId }) {
  switch (tab) {
    case "poizvedbe":
      return <PortalQueries />;
    case "narocnina":
      return <PortalSubscription />;
    default:
      return <PortalOverview />;
  }
}

function MojStrelkoInner() {
  const { user } = useStrelko();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = parsePortalTab(searchParams.get("tab"));

  useEffect(() => {
    const raw = searchParams.get("tab");
    if (!raw) return;
    const parsed = parsePortalTab(raw);
    if (parsed !== raw) {
      navigate(`/moj-strelko?tab=${parsed}`, { replace: true });
    }
  }, [searchParams, navigate]);

  const onTabChange = useCallback(
    (next: PortalTabId) => {
      setSearchParams({ tab: next });
    },
    [setSearchParams]
  );

  return (
    <section className="portal-page page--standard">
      <header className="page-header portal-page-header">
        <h1>Moj Strelko</h1>
        <p className="pricing-lead portal-page-header__lead">
          Na enem mestu upravljajte svoje poizvedbe, žetone, pakete in plačila.
        </p>
        {user?.email ? (
          <p className="portal-page-header__email">{user.email}</p>
        ) : null}
      </header>

      <PortalTabs active={tab} onChange={onTabChange} />

      <PortalContent tab={tab} />
    </section>
  );
}

export function MojStrelkoPage() {
  return (
    <RequireAuth>
      <MojStrelkoInner />
    </RequireAuth>
  );
}
