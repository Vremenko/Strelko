import { useStrelko } from "../../context/StrelkoContext";
import { Link } from "react-router-dom";

export function CookieBanner() {
  const { cookieAccepted, acceptCookies } = useStrelko();
  if (cookieAccepted) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Obvestilo o piškotkih">
      <div className="cookie-banner-inner">
        <p>
          Za delovanje prijave uporabljamo nujne piškotke oziroma localStorage.{" "}
          <Link to="/piskotki">Več o piškotkih</Link>
        </p>
        <button type="button" className="btn btn-primary btn-sm" onClick={acceptCookies}>
          Razumem
        </button>
      </div>
    </div>
  );
}
