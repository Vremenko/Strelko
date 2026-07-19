import { Link } from "react-router-dom";
import { useStrelko } from "../../context/StrelkoContext";

export function CookieBanner() {
  const { privacyConsent, setPrivacyConsent } = useStrelko();
  if (privacyConsent !== null) return null;

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
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setPrivacyConsent("analytics")}
          >
            Sprejmi
          </button>
          <Link to="/piskotki" className="btn btn-ghost btn-sm">
            Več informacij
          </Link>
        </div>
      </div>
    </div>
  );
}
