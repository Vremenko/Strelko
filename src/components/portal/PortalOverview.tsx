import { Link } from "react-router-dom";
import { useStrelko } from "../../context/StrelkoContext";
import { portalTabPath } from "../../lib/auth-intent";
import {
  getPodpornikStatus,
  tokenBalanceLabel,
} from "../../lib/portal-account";

export function PortalOverview() {
  const { credits } = useStrelko();

  const tokenBalance = tokenBalanceLabel(credits);
  const podpornik = getPodpornikStatus(credits);

  return (
    <div className="portal-panel">
      <div className="portal-overview-grid">
        <article className="portal-card">
          <h2 className="portal-card__title">Žetoni</h2>
          <p className="portal-card__value">{tokenBalance}</p>
          <p className="portal-card__hint">
            Kupljeni žetoni ne potečejo in ostanejo na vašem računu, dokler jih ne porabite.
          </p>
          <p className="portal-card__footer-link">
            <Link to={portalTabPath("narocnina")}>Kupite dodatne žetone</Link>
          </p>
        </article>

        <article className="portal-card">
          <h2 className="portal-card__title">Podpornik</h2>
          <p className="portal-card__value portal-card__value--text">{podpornik.label}</p>
          <p className="portal-card__hint">{podpornik.hint}</p>
          <p className="portal-card__footer-link">
            <Link to={portalTabPath("narocnina")}>Paketi in plačila</Link>
          </p>
        </article>

        <article className="portal-card">
          <h2 className="portal-card__title">Poizvedbe</h2>
          <p className="portal-card__value portal-card__value--text">Ni shranjenih</p>
          <p className="portal-card__hint">
            Shranjene poizvedbe bodo na voljo tukaj, ko bo povezava z API-jem aktivna.
          </p>
          <p className="portal-card__footer-link">
            <Link to={portalTabPath("poizvedbe")}>Odpri poizvedbe</Link>
          </p>
        </article>
      </div>

      <div className="portal-quick-actions">
        <Link to="/pomoc-pri-zavarovalnici" className="btn btn-primary">
          Nova poizvedba
        </Link>
        <Link to={portalTabPath("narocnina")} className="btn btn-ghost">
          Paketi in plačila
        </Link>
        <Link to={portalTabPath("poizvedbe")} className="btn btn-ghost">
          Moje poizvedbe
        </Link>
      </div>
    </div>
  );
}
