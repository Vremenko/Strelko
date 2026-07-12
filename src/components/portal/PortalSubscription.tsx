import { PortalInvoicesSection } from "./PortalInvoicesSection";

/** Zavihek Plačila — zgodovinski id URL-ja ostaja `narocnina`. */
export function PortalSubscription() {
  return (
    <div className="portal-panel">
      <PortalInvoicesSection />
    </div>
  );
}
