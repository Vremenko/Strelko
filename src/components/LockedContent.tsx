import { useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStrelko } from "../context/StrelkoContext";
import {
  checkoutPlanForTab,
  setAuthReturn,
  setCheckoutPlanId,
} from "../lib/auth-intent";
import {
  LOCKED_SUPPORTER_CTA,
  LOCKED_SUPPORTER_CTA_HREF,
  LOCKED_SUPPORTER_TEXT,
  LOCKED_SUPPORTER_TITLE,
} from "../lib/locked-supporter-copy";

export type LockedContentMode = "supporter" | "tokens";

interface LockedContentProps {
  mode: LockedContentMode;
  className?: string;
  /** Transparent centered content inside a dark `.locked-content-surface` pane. */
  inset?: boolean;
}

export function LockedContent({ mode, className, inset }: LockedContentProps) {
  const { user, openAuth } = useStrelko();
  const location = useLocation();
  const navigate = useNavigate();

  const returnPath = `${location.pathname}${location.search}${location.hash}`;

  const login = useCallback(() => {
    setAuthReturn(returnPath);
    openAuth("login");
  }, [openAuth, returnPath]);

  const buyTokens = useCallback(() => {
    if (user) {
      navigate("/cenik");
      return;
    }
    setAuthReturn(returnPath);
    setCheckoutPlanId(checkoutPlanForTab("zetoni"));
    openAuth("register");
  }, [navigate, openAuth, returnPath, user]);

  const isSupporter = mode === "supporter";
  const tokenLead = user
    ? "Za ogled potrebujete žeton."
    : "Za ogled se prijavite in kupite žetone.";

  const rootClass = [
    "locked-content",
    inset ? "locked-content--inset" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <div className="locked-content__inner">
        <span className="locked-content__icon" aria-hidden="true">
          🔒
        </span>
        <h3 className="locked-content__title">
          {isSupporter ? LOCKED_SUPPORTER_TITLE : tokenLead}
        </h3>
        {isSupporter ? <p className="locked-content__text">{LOCKED_SUPPORTER_TEXT}</p> : null}
        {isSupporter ? (
          <div className="locked-content__actions locked-content__actions--supporter">
            <Link to={LOCKED_SUPPORTER_CTA_HREF} className="btn btn-primary">
              {LOCKED_SUPPORTER_CTA}
            </Link>
          </div>
        ) : (
          <div className="locked-content__actions">
            {user ? (
              <button type="button" className="btn btn-primary" onClick={buyTokens}>
                Kupi žetone
              </button>
            ) : (
              <>
                <button type="button" className="btn btn-ghost" onClick={login}>
                  Prijava
                </button>
                <button type="button" className="btn btn-primary" onClick={buyTokens}>
                  Kupi žetone
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
