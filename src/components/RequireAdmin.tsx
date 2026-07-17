import { useEffect, useRef, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useStrelko } from "../context/StrelkoContext";
import { isAdminRole } from "../lib/admin-access";
import { setAuthReturn } from "../lib/auth-intent";
import { getToken } from "../lib/utils";

export function RequireAdmin({ children }: { children: ReactNode }) {
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
    if (autoOpenedForReturnToRef.current === returnTo) return;
    autoOpenedForReturnToRef.current = returnTo;
    openAuth("login");
  }, [user, location.pathname, location.search, openAuth]);

  if (!user) {
    return (
      <section className="portal-page page--standard">
        <header className="page-header">
          <h1>Strelko admin</h1>
          <p className="pricing-lead">Za dostop se prijavite z admin ali team računom.</p>
        </header>
        <div className="portal-empty-state legal-card">
          <p>Prijava je potrebna.</p>
          <button type="button" className="btn btn-primary" onClick={() => openAuth("login")}>
            Prijava
          </button>
        </div>
      </section>
    );
  }

  if (!isAdminRole(user.role)) {
    return (
      <section className="portal-page page--standard">
        <header className="page-header">
          <h1>Strelko admin</h1>
          <p className="pricing-lead">Nimate pravic za ta panel ({user.email}).</p>
        </header>
        <div className="portal-empty-state legal-card">
          <Link to="/" className="btn btn-ghost">
            Nazaj na domačo stran
          </Link>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
