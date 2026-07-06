import { Outlet } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { Footer, Disclaimer } from "./components/layout/Footer";
import { CookieBanner } from "./components/layout/CookieBanner";
import { AuthModal } from "./components/modals/AuthModal";
import { AlertsModal } from "./components/modals/AlertsModal";
import { CreditsModal, CheckoutSuccessModal } from "./components/modals/CreditsModal";

export function AppLayout() {
  return (
    <>
      <div className="hero-bg" />
      <div className="lightning-flash" />
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
    </>
  );
}
