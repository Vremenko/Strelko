import { Outlet } from "react-router-dom";
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

export function AppLayout() {
  useAuthReturn();
  const { sessionLoadWarning } = useStrelko();
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
