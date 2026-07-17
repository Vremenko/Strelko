import { Link } from "react-router-dom";
import { useStrelko } from "../../context/StrelkoContext";
import { portalTabPath } from "../../lib/auth-intent";
import { getPodpornikOverview, tokenBalanceLabel } from "../../lib/portal-account";
import { tokensSpentSummaryLabel } from "../../lib/ob-skodi-tokens";
import { PortalTokenPurchase } from "./PortalTokenPurchase";

function queryCountLabel(count: number): string {
  if (count === 1) return "1 poizvedba";
  if (count === 2) return "2 poizvedbi";
  if (count >= 3 && count <= 4) return `${count} poizvedbe`;
  return `${count} poizvedb`;
}

export function PortalOverview() {
  const { credits, savedQueries, savedQueriesLoading, openBillingPortal, alerts, openAlerts } =
    useStrelko();

  const tokenBalance = tokenBalanceLabel(credits);
  const podpornik = getPodpornikOverview(credits);
  const queryCount = savedQueries.length;
  const tokensSpent = savedQueries.reduce((sum, q) => sum + q.tokens_spent, 0);
  const queriesStat =
    savedQueriesLoading && queryCount === 0 ? "Nalagam …" : queryCountLabel(queryCount);
  const smsEligible = !!alerts?.sms_eligible;
  const smsActive = !!alerts?.alert_enabled && !!alerts?.alert_phone;

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
              {podpornik.canCancel ? (
                <>
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

          <article className="portal-card portal-card--service">
            <div className="portal-card__service-head">
              <h3 className="portal-card__title">SMS opozorila</h3>
              <span
                className={`portal-badge ${
                  smsActive ? "portal-badge--active" : smsEligible ? "portal-badge--inactive" : "portal-badge--inactive"
                }`}
              >
                {smsActive ? "Vklopljeno" : smsEligible ? "Na voljo" : "Ni na voljo"}
              </span>
            </div>
            <div className="portal-card__service-body">
              {smsEligible ? (
                <>
                  <p className="portal-card__hint">
                    Obvestilo po SMS, ko se v izbranem radiju pojavi strela. Največ 1× na dan na
                    lokacijo.
                  </p>
                  {alerts?.saved_label ? (
                    <p className="portal-overview-stat-sub">
                      Lokacija: <strong>{alerts.saved_label}</strong>
                      {alerts.alert_radius_km != null ? ` · ${alerts.alert_radius_km} km` : null}
                    </p>
                  ) : (
                    <p className="portal-overview-stat-sub">Lokacija še ni nastavljena.</p>
                  )}
                </>
              ) : (
                <p className="portal-card__hint">
                  Vključeno v paketu Podpornik — nastavite telefon, lokacijo in radij.
                </p>
              )}
            </div>
            <div className="portal-card__service-footer">
              {smsEligible ? (
                <button type="button" className="btn btn-ghost btn-block" onClick={openAlerts}>
                  {smsActive ? "Uredi opozorila" : "Nastavi opozorila"}
                </button>
              ) : (
                <Link to="/cenik" className="btn btn-ghost btn-block">
                  Aktiviraj Podpornik
                </Link>
              )}
            </div>
          </article>
        </div>
      </section>

      <section className="portal-overview-section" aria-labelledby="portal-tokens-heading">
        <h2 id="portal-tokens-heading" className="portal-overview-section__title">
          Nakup žetonov
        </h2>
        <p className="portal-card__hint portal-overview-section__lead">
          Žetone lahko kadar koli dokupite — tudi ob aktivnem paketu Podpornik. Novi žetoni se
          prištejejo obstoječemu stanju.
        </p>
        <PortalTokenPurchase />
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
