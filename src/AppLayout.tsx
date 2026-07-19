import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "./components/layout/Header";
import { Footer, Disclaimer } from "./components/layout/Footer";
import { CookieBanner } from "./components/layout/CookieBanner";
import { AuthModal } from "./components/modals/AuthModal";
import { AlertsModal } from "./components/modals/AlertsModal";
import { CheckoutSuccessModal } from "./components/modals/CreditsModal";
import { WidgetSetupModal } from "./components/modals/WidgetSetupModal";
import { ForgotPasswordModal } from "./components/modals/ForgotPasswordModal";
import { useAuthReturn } from "./hooks/useAuthReturn";
import { useStrelko } from "./context/StrelkoContext";
import { installFrameGuard } from "./lib/frame-guard";

export function AppLayout() {
  useAuthReturn();
  const { sessionLoadWarning } = useStrelko();
  const location = useLocation();

  useEffect(() => {
    installFrameGuard(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <div className="hero-bg" />
      <div className="content-wrap">
        <Header />
        {sessionLoadWarning ? (
          <p className="session-load-warning" role="status">
            {sessionLoadWarning}
          </p>
        ) : null}
        <Outlet />
        <Disclaimer />
        <Footer />
      </div>
      <CookieBanner />
      <AuthModal />
      <AlertsModal />
      <CheckoutSuccessModal />
      <WidgetSetupModal />
      <ForgotPasswordModal />
    </>
  );
}
