import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useStrelko } from "../../context/StrelkoContext";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function Header() {
  const {
    user,
    credits,
    openAuth,
    logout,
    openCredits,
    openBillingPortal,
  } = useStrelko();
  const navigate = useNavigate();
  const logged = !!user;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerHidden, setDrawerHidden] = useState(true);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    document.body.classList.remove("site-nav-open");
    setTimeout(() => setDrawerHidden(true), 280);
  }, []);

  const openDrawer = useCallback(() => {
    setDrawerHidden(false);
    requestAnimationFrame(() => {
      setDrawerOpen(true);
      document.body.classList.add("site-nav-open");
    });
  }, []);

  const toggleDrawer = () => {
    if (drawerHidden || !drawerOpen) openDrawer();
    else closeDrawer();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeDrawer]);

  const go = (path: string) => {
    closeDrawer();
    navigate(path);
  };

  return (
    <>
      <header className={`site-header${logged ? " site-header--logged-in" : " site-header--guest"}`}>
        <div className="site-header__bar">
          <Link to="/" className="logo logo--brand">
            <img
              src="/assets/strelko-logo.png"
              alt="Strelko"
              className="logo-img"
              width={300}
              height={70}
              decoding="async"
            />
          </Link>
          <button
            type="button"
            className="site-menu-toggle"
            id="site-menu-toggle"
            aria-expanded={drawerOpen}
            aria-controls="site-nav-drawer"
            aria-label="Meni"
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </button>
          <nav className="site-nav site-nav--desktop" aria-label="Glavna navigacija">
            <div className="site-nav__content">
              <Link to="/pomoc-pri-zavarovalnici" className="nav-link">
                Pomoč pri zavarovalnici
              </Link>
              <Link to="/statistika" className="nav-link">
                Arhiv strel
              </Link>
              <Link to="/widget-obcine" className="nav-link">
                Widget občine
              </Link>
            </div>
            <div className="site-nav__auth nav-actions">
              {logged ? (
                <>
                  <span className="credits-badge">
                    {credits?.plan_name_sl && (
                      <span className="plan-badge">{credits.plan_name_sl}</span>
                    )}
                    {credits?.plan_name_sl && " · "}Krediti:{" "}
                    <strong>{credits?.credits_balance ?? "—"}</strong>
                  </span>
                  <button type="button" className="btn btn-ghost" onClick={() => openCredits()}>
                    Paketi
                  </button>
                  {credits?.billing_portal_available && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => void openBillingPortal()}
                    >
                      Naročnina
                    </button>
                  )}
                  <button type="button" className="btn btn-ghost" onClick={logout}>
                    Odjava
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-ghost" onClick={() => openAuth("login")}>
                    Prijava
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => openAuth("register")}
                  >
                    Registracija
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
      <div
        id="site-nav-drawer"
        className={`site-nav-drawer${drawerOpen ? " is-open" : ""}`}
        hidden={drawerHidden}
      >
        <div className="site-nav-drawer__backdrop" onClick={closeDrawer} aria-hidden="true" />
        <div className="site-nav-drawer__panel" role="dialog" aria-modal="true" aria-label="Meni">
          <div className="site-nav-drawer__head">
            <button
              type="button"
              className="site-nav-drawer__close"
              aria-label="Zapri meni"
              onClick={closeDrawer}
            >
              <CloseIcon />
            </button>
          </div>
          <nav className="site-nav-drawer__content" aria-label="Vsebina">
            <button
              type="button"
              className="nav-link nav-link--drawer"
              onClick={() => go("/pomoc-pri-zavarovalnici")}
            >
              Pomoč pri zavarovalnici
            </button>
            <button type="button" className="nav-link nav-link--drawer" onClick={() => go("/statistika")}>
              Arhiv strel
            </button>
            <button type="button" className="nav-link nav-link--drawer" onClick={() => go("/widget-obcine")}>
              Widget občine
            </button>
          </nav>
          <div className="site-nav-drawer__auth">
            {logged ? (
              <>
                {credits?.plan_name_sl && (
                  <div className="site-nav-drawer__meta">
                    {credits.plan_name_sl} · Krediti:{" "}
                    <strong>{credits.credits_balance ?? "—"}</strong>
                  </div>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-block"
                  onClick={() => {
                    closeDrawer();
                    openCredits();
                  }}
                >
                  Paketi
                </button>
                {credits?.billing_portal_available && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-block"
                    onClick={() => {
                      closeDrawer();
                      void openBillingPortal();
                    }}
                  >
                    Naročnina
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-ghost btn-block"
                  onClick={() => {
                    closeDrawer();
                    logout();
                  }}
                >
                  Odjava
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-login btn-block"
                  onClick={() => {
                    closeDrawer();
                    openAuth("login");
                  }}
                >
                  Prijava
                </button>
                <button
                  type="button"
                  className="btn btn-register btn-block"
                  onClick={() => {
                    closeDrawer();
                    openAuth("register");
                  }}
                >
                  Registracija
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
