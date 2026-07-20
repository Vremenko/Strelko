import { Link } from "react-router-dom";
import { useStrelko } from "../../context/StrelkoContext";

export function CookieBanner() {
  const { privacyConsent, setPrivacyConsent, modals } = useStrelko();
  if (privacyConsent !== null) return null;
  /* Med prijavo/registracijo pasica ne sme prekrivati obrazca (zlasti na telefonu). */
  if (modals.auth || modals.forgotPassword) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Obvestilo o zasebnosti">
      <div className="cookie-banner-inner">
        <div className="cookie-banner-copy">
          <p className="cookie-banner-title">Vašo zasebnost spoštujemo.</p>
          <p>
            Strelko uporablja nujne nastavitve za delovanje strani in anonimno statistiko obiska, ki nam
            pomaga izboljševati vsebine.
          </p>
        </div>
        <div className="cookie-banner-actions">
          <Link to="/piskotki" className="btn btn-ghost btn-sm">
            Več informacij
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setPrivacyConsent("analytics")}
          >
            Sprejmi
          </button>
        </div>
      </div>
    </div>
  );
}
