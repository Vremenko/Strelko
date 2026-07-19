import {
  cookieConsentLabelSl,
  type CookieConsentValue,
} from "../lib/cookie-consent";
import { useStrelko } from "../context/StrelkoContext";

export function PrivacyConsentSettings() {
  const { privacyConsent, setPrivacyConsent } = useStrelko();

  const select = (value: CookieConsentValue) => {
    setPrivacyConsent(value);
  };

  return (
    <section className="legal-section privacy-consent-settings" aria-labelledby="privacy-consent-heading">
      <h2 id="privacy-consent-heading">Nastavitve zasebnosti</h2>
      <p>
        Trenutna izbira: <strong>{cookieConsentLabelSl(privacyConsent)}</strong>
      </p>
      <p className="privacy-consent-settings__hint">
        Spremembo lahko kadar koli uveljavite tukaj. Izbira ne vpliva na prijavo, nastavitve zemljevida ali
        shranjene poizvedbe.
      </p>
      <div className="privacy-consent-settings__actions">
        <button
          type="button"
          className={`btn btn-sm${privacyConsent === "necessary" ? " btn-primary" : " btn-ghost"}`}
          onClick={() => select("necessary")}
          aria-pressed={privacyConsent === "necessary"}
        >
          Uporabljaj samo nujno
        </button>
        <button
          type="button"
          className={`btn btn-sm${privacyConsent === "analytics" ? " btn-primary" : " btn-ghost"}`}
          onClick={() => select("analytics")}
          aria-pressed={privacyConsent === "analytics"}
        >
          Dovoli analitiko
        </button>
      </div>
    </section>
  );
}
