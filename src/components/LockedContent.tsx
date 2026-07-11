import { useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useStrelko } from "../context/StrelkoContext";
import {
  checkoutPlanForTab,
  setAuthReturn,
  setCheckoutPlanId,
} from "../lib/auth-intent";

export type LockedContentMode = "supporter" | "tokens";

const SUPPORTER_TITLE = "Ta vsebina je na voljo s paketom Podpornik";
const SUPPORTER_TEXT =
  "Z aktivacijo paketa Podpornik pridobite dostop do dodatnih prikazov in funkcij, hkrati pa neposredno podprete ekipo Meteoinfo pri razvoju novih aplikacij, meteoroloških produktov ter nadaljnjih izboljšav storitve Strelko.";

interface LockedContentProps {
  mode: LockedContentMode;
  className?: string;
  /** Transparent centered content inside a dark `.locked-content-surface` pane. */
  inset?: boolean;
}

export function LockedContent({ mode, className, inset }: LockedContentProps) {
  const { user, openAuth, openCredits, paymentsEnabled, setSelectedPlan, checkout } =
    useStrelko();
  const location = useLocation();

  const returnPath = `${location.pathname}${location.search}${location.hash}`;

  const activatePodpornik = useCallback(() => {
    if (!paymentsEnabled) return;
    const planId = checkoutPlanForTab("narocnina");
    setSelectedPlan(planId);
    void checkout();
  }, [checkout, paymentsEnabled, setSelectedPlan]);

  const login = useCallback(() => {
    setAuthReturn(returnPath);
    openAuth("login");
  }, [openAuth, returnPath]);

  const buyTokens = useCallback(() => {
    if (user) {
      openCredits();
      return;
    }
    setAuthReturn(returnPath);
    setCheckoutPlanId(checkoutPlanForTab("zetoni"));
    openAuth("register");
  }, [openAuth, openCredits, returnPath, user]);

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
          {isSupporter ? SUPPORTER_TITLE : tokenLead}
        </h3>
        {isSupporter ? <p className="locked-content__text">{SUPPORTER_TEXT}</p> : null}
        <div
          className={`locked-content__actions${
            isSupporter && !user ? " locked-content__actions--stacked" : ""
          }`}
        >
          {isSupporter ? (
            user ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={activatePodpornik}
                disabled={!paymentsEnabled}
                aria-disabled={!paymentsEnabled}
              >
                {paymentsEnabled ? "Aktiviraj paket Podpornik" : "Naročnina bo kmalu na voljo"}
              </button>
            ) : (
              <>
                <button type="button" className="btn btn-primary" onClick={login}>
                  Prijava
                </button>
                <Link to="/cenik" className="btn btn-ghost">
                  Cenik
                </Link>
              </>
            )
          ) : user ? (
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
      </div>
    </div>
  );
}
