import { Outlet } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer, Disclaimer } from "./components/layout/Footer";
import { CookieBanner } from "./components/layout/CookieBanner";
import { AuthModal } from "./components/modals/AuthModal";
import { AlertsModal } from "./components/modals/AlertsModal";
import { CreditsModal, CheckoutSuccessModal } from "./components/modals/CreditsModal";
import { WidgetSetupModal } from "./components/modals/WidgetSetupModal";
import { ForgotPasswordModal } from "./components/modals/ForgotPasswordModal";

export function AppLayout() {
  return (
    <>
      <div className="hero-bg" />
      <div className="content-wrap">
        <Header />
        <Outlet />
        <Disclaimer />
        <Footer />
      </div>
      <CookieBanner />
      <AuthModal />
      <AlertsModal />
      <CreditsModal />
      <CheckoutSuccessModal />
      <WidgetSetupModal />
      <ForgotPasswordModal />
    </>
  );
}
