import { Link } from "react-router-dom";
import { useStrelko } from "../context/StrelkoContext";
import { isPodpornikActive, tokenBalanceLabel } from "../lib/portal-account";

export function CreditsBar() {
  const { user, credits } = useStrelko();
  if (!user) return null;

  return (
    <div className="credits-bar">
      <span>
        👋 {user.email}
        {" · "}Žetoni: <strong>{tokenBalanceLabel(credits)}</strong>
        {isPodpornikActive(credits) ? (
          <>
            {" · "}
            <span className="plan-badge">Podpornik</span>
          </>
        ) : null}
      </span>
      <Link to="/cenik" className="btn btn-primary btn-sm">
        Cenik
      </Link>
    </div>
  );
}
