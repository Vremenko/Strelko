import { BrowserRouter, Route, Routes } from "react-router-dom";
import { StrelkoProvider } from "./context/StrelkoContext";
import { AppLayout } from "./AppLayout";
import { PageMeta } from "./components/layout/PageMeta";
import { ScrollToTop } from "./components/layout/ScrollToTop";
import { LandingPage } from "./pages/LandingPage";
import { ZavarovalnicaPage } from "./pages/ZavarovalnicaPage";
import { StatistikaPage } from "./pages/StatistikaPage";
import { WidgetObcinePage } from "./pages/WidgetObcinePage";
import { LegalPage } from "./pages/LegalPage";
import { CenikPage } from "./pages/CenikPage";
import { MojStrelkoPage } from "./pages/MojStrelkoPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AdminPage } from "./pages/AdminPage";
import { LEGAL_PAGES, type LegalPageId } from "./lib/legal";

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PageMeta />
      <StrelkoProvider>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<AppLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="/pomoc-pri-zavarovalnici" element={<ZavarovalnicaPage />} />
            <Route path="/cenik" element={<CenikPage />} />
            <Route path="/moj-strelko" element={<MojStrelkoPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/statistika" element={<StatistikaPage />} />
            <Route path="/widget-obcine" element={<WidgetObcinePage />} />
            {(Object.entries(LEGAL_PAGES) as [LegalPageId, (typeof LEGAL_PAGES)[LegalPageId]][]).map(
              ([id, page]) => (
                <Route key={id} path={page.path} element={<LegalPage pageId={id} />} />
              )
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </StrelkoProvider>
    </BrowserRouter>
  );
}
