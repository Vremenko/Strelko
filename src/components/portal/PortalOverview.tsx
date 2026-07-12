import { Link } from "react-router-dom";
import { useStrelko } from "../../context/StrelkoContext";
import { portalTabPath } from "../../lib/auth-intent";
import {
  getPodpornikStatus,
  tokenBalanceLabel,
} from "../../lib/portal-account";
import { tokenCountLabel } from "../../lib/ob-skodi-tokens";

export function PortalOverview() {
  const { credits, savedQueries, savedQueriesLoading, openBillingPortal } = useStrelko();

  const tokenBalance = tokenBalanceLabel(credits);
  const podpornik = getPodpornikStatus(credits);
  const queryCount = savedQueries.length;
  const queriesValue =
    savedQueriesLoading && queryCount === 0
      ? "Nalagam …"
      : queryCount === 0
        ? "Ni shranjenih"
        : `${queryCount} ${queryCount === 1 ? "poizvedba" : queryCount === 2 ? "poizvedbi" : queryCount <= 4 ? "poizvedbe" : "poizvedb"}`;
  const queriesHint =
    queryCount === 0
      ? "Ko izvedete podrobno iskanje, se poizvedba samodejno shrani tukaj."
      : "Odprite poizvedbo za ponovni ogled brez dodatne porabe žetonov.";

  return (
    <div className="portal-panel">
      <div className="portal-overview-grid">
        <article className="portal-card portal-card--overview">
          <div className="portal-card__overview-main">
            <h2 className="portal-card__title">Žetoni</h2>
            <p className="portal-card__value portal-card__value--accent">{tokenBalance}</p>
            <p className="portal-card__hint">
              Kupljeni žetoni ne potečejo in ostanejo na vašem računu, dokler jih ne porabite.
            </p>
          </div>
          <div className="portal-card__overview-footer">
            <p className="portal-card__footer-link">
              <Link to="/cenik">Kupite dodatne žetone</Link>
            </p>
          </div>
        </article>

        <article className="portal-card portal-card--overview">
          <div className="portal-card__overview-main">
            <h2 className="portal-card__title">Podpornik</h2>
            <p className="portal-card__value">{podpornik.label}</p>
            {podpornik.hint ? <p className="portal-card__hint">{podpornik.hint}</p> : null}
          </div>
          {podpornik.canCancel ? (
            <div className="portal-card__overview-footer">
              <button
                type="button"
                className="btn btn-ghost btn-block portal-card__cancel-btn"
                onClick={() => void openBillingPortal()}
              >
                Prekliči naročnino
              </button>
            </div>
          ) : null}
        </article>

        <article className="portal-card portal-card--overview">
          <div className="portal-card__overview-main">
            <h2 className="portal-card__title">Poizvedbe</h2>
            <p className="portal-card__value">{queriesValue}</p>
            <p className="portal-card__hint">{queriesHint}</p>
            {queryCount > 0 ? (
              <p className="portal-card__hint">
                Skupna poraba:{" "}
                <strong>
                  {tokenCountLabel(savedQueries.reduce((sum, q) => sum + q.tokens_spent, 0))}
                </strong>
              </p>
            ) : null}
          </div>
          <div className="portal-card__overview-footer">
            <p className="portal-card__footer-link">
              <Link to={portalTabPath("poizvedbe")}>Odpri poizvedbe</Link>
            </p>
          </div>
        </article>
      </div>

      <div className="portal-quick-actions">
        <Link to="/pomoc-pri-zavarovalnici" className="btn btn-primary">
          Nova poizvedba
        </Link>
        <Link to={portalTabPath("poizvedbe")} className="btn btn-ghost">
          Moje poizvedbe
        </Link>
      </div>
    </div>
  );
}
