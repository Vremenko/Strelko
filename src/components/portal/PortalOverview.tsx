import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useStrelko } from "../../context/StrelkoContext";
import { portalTabPath } from "../../lib/auth-intent";
import {
  getPodpornikOverview,
  isSubscriptionNotRestorableError,
  tokenBalanceLabel,
} from "../../lib/portal-account";
import { tokensSpentSummaryLabel } from "../../lib/ob-skodi-tokens";

function queryCountLabel(count: number): string {
  if (count === 1) return "1 poizvedba";
  if (count === 2) return "2 poizvedbi";
  if (count >= 3 && count <= 4) return `${count} poizvedbe`;
  return `${count} poizvedb`;
}

export function PortalOverview() {
  const {
    credits,
    savedQueries,
    savedQueriesLoading,
    openBillingPortal,
    restoreSubscription,
  } = useStrelko();
  const navigate = useNavigate();
  const [restoreBusy, setRestoreBusy] = useState(false);

  const tokenBalance = tokenBalanceLabel(credits);
  const podpornik = getPodpornikOverview(credits);
  const queryCount = savedQueries.length;
  const tokensSpent = savedQueries.reduce((sum, q) => sum + q.tokens_spent, 0);
  const queriesStat =
    savedQueriesLoading && queryCount === 0 ? "Nalagam …" : queryCountLabel(queryCount);

  const onRestore = async () => {
    if (restoreBusy) return;
    setRestoreBusy(true);
    try {
      await restoreSubscription();
    } catch (e) {
      if (isSubscriptionNotRestorableError(e)) {
        navigate("/cenik");
        return;
      }
      window.alert(
        (e as Error).message || "Naročnine trenutno ni mogoče obnoviti. Poskusite znova."
      );
    } finally {
      setRestoreBusy(false);
    }
  };

  return (
    <div className="portal-panel">
      <section className="portal-overview-section" aria-labelledby="portal-services-heading">
        <h2 id="portal-services-heading" className="portal-overview-section__title">
          Vaše storitve
        </h2>
        <div className="portal-services-grid">
          <article className="portal-card portal-card--service">
            <h3 className="portal-card__title">Stanje žetonov</h3>
            <div className="portal-card__service-body">
              <p className="portal-overview-stat">{tokenBalance}</p>
              <p className="portal-overview-stat-sub">na voljo</p>
              <p className="portal-card__hint">
                Žetoni ne potečejo in ostanejo na vašem računu, dokler jih ne porabite.
              </p>
            </div>
            <div className="portal-card__service-footer">
              <p className="portal-card__footer-link">
                <Link to="/cenik">Kupite dodatne žetone</Link>
              </p>
            </div>
          </article>

          <article className="portal-card portal-card--service">
            <div className="portal-card__service-head">
              <h3 className="portal-card__title">Paket Podpornik</h3>
              <span
                className={`portal-badge ${
                  podpornik.cancelScheduled
                    ? "portal-badge--cancel-pending"
                    : podpornik.active
                      ? "portal-badge--active"
                      : "portal-badge--inactive"
                }`}
              >
                {podpornik.cancelScheduled
                  ? "Preklicano"
                  : podpornik.active
                    ? "Aktiven"
                    : "Ni aktiven"}
              </span>
            </div>
            <div className="portal-card__service-body">
              {podpornik.active ? (
                podpornik.expiryLabel ? (
                  <p className="portal-overview-stat portal-overview-stat--expiry">
                    {podpornik.expiryLabel}
                  </p>
                ) : null
              ) : (
                <p className="portal-card__hint">
                  Dostop do celotnega arhiva, naprednih statistik in widgeta.
                </p>
              )}
            </div>
            <div className="portal-card__service-footer">
              {podpornik.canRestore ? (
                <>
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    disabled={restoreBusy}
                    onClick={() => void onRestore()}
                  >
                    {restoreBusy ? "Obnavljam …" : "Obnovi naročnino"}
                  </button>
                  {podpornik.cancelNotice ? (
                    <p className="portal-card__cancel-notice">{podpornik.cancelNotice}</p>
                  ) : null}
                </>
              ) : podpornik.canCancel ? (
                <>
                  {podpornik.renewalNotice ? (
                    <p className="portal-card__cancel-notice portal-card__renewal-notice">
                      {podpornik.renewalNotice}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-ghost btn-block portal-card__cancel-btn"
                    onClick={() => void openBillingPortal()}
                  >
                    Prekliči naročnino
                  </button>
                  <p className="portal-card__cancel-notice">
                    Prekinitev je mogoča tudi po e-pošti na podpora@meteoinfo.si.
                  </p>
                </>
              ) : podpornik.cancelNotice ? (
                <p className="portal-card__cancel-notice">{podpornik.cancelNotice}</p>
              ) : !podpornik.active ? (
                <Link to="/cenik" className="btn btn-ghost btn-block">
                  Aktiviraj paket
                </Link>
              ) : null}
            </div>
          </article>
        </div>
      </section>

      <section className="portal-overview-section" aria-labelledby="portal-usage-heading">
        <h2 id="portal-usage-heading" className="portal-overview-section__title">
          Uporaba Strelka
        </h2>
        <article className="portal-card portal-card--usage">
          <div className="portal-card--usage__main">
            <h3 className="portal-card__title">Vaše poizvedbe</h3>
            <p className="portal-overview-stat">{queriesStat}</p>
            <p className="portal-overview-stat-sub">
              {tokensSpentSummaryLabel(tokensSpent)}
            </p>
          </div>
          <div className="portal-card--usage__action">
            <p className="portal-card__footer-link">
              <Link to={portalTabPath("poizvedbe")}>Odpri poizvedbe</Link>
            </p>
          </div>
        </article>
      </section>

      <div className="portal-quick-actions">
        <Link to="/pomoc-pri-zavarovalnici" className="btn btn-primary">
          Nova poizvedba
        </Link>
      </div>
    </div>
  );
}
