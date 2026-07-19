import { Link } from "react-router-dom";
import { useStrelko } from "../../context/StrelkoContext";

export function CookieBanner() {
  const { privacyConsent, setPrivacyConsent } = useStrelko();
  if (privacyConsent !== null) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Obvestilo o zasebnosti">
      <div className="cookie-banner-inner">
        <p>
          Za delovanje Strelka uporabljamo nujno lokalno shranjevanje. Z vašim dovoljenjem vključimo tudi
          anonimno statistiko obiska z lastno analitiko Umami.{" "}
          <Link to="/piskotki">Več o zasebnosti</Link>
        </p>
        <div className="cookie-banner-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setPrivacyConsent("necessary")}
          >
            Samo nujno
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setPrivacyConsent("analytics")}
          >
            Dovoli analitiko
          </button>
        </div>
      </div>
    </div>
  );
}
