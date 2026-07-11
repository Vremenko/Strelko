import { useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useStrelko } from "../context/StrelkoContext";
import { setAuthReturn } from "../lib/auth-intent";
import { getToken } from "../lib/utils";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, openAuth } = useStrelko();
  const location = useLocation();
  const autoOpenedForReturnToRef = useRef<string | null>(null);

  useEffect(() => {
    const returnTo = `${location.pathname}${location.search}`;

    if (user || getToken()) {
      autoOpenedForReturnToRef.current = null;
      return;
    }

    setAuthReturn(returnTo);

    if (autoOpenedForReturnToRef.current === returnTo) {
      return;
    }

    autoOpenedForReturnToRef.current = returnTo;
    openAuth("login");
  }, [user, location.pathname, location.search, openAuth]);

  if (!user) {
    return (
      <section className="portal-page page--standard">
        <header className="page-header">
          <h1>Moj Strelko</h1>
          <p className="pricing-lead">
            Za dostop do portala se prijavite ali registrirajte. Po prijavi se boste samodejno
            vrnili sem.
          </p>
        </header>
        <div className="portal-empty-state legal-card">
          <p>Prijava je potrebna.</p>
          <div className="portal-empty-actions">
            <button type="button" className="btn btn-primary" onClick={() => openAuth("login")}>
              Prijava
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => openAuth("register")}>
              Registracija
            </button>
            <Link to="/cenik" className="btn btn-ghost">
              Cenik
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
