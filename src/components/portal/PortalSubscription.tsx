import { useStrelko } from "../../context/StrelkoContext";
import {
  formatPeriodEnd,
  getPodpornikStatus,
  isPodpornikActive,
} from "../../lib/portal-account";
import { PRICING_PODPORNIST } from "../../lib/pricing-offers";
import { PortalInvoicesSection } from "./PortalInvoicesSection";
import { PortalTokenPurchase } from "./PortalTokenPurchase";

export function PortalSubscription() {
  const { credits, openBillingPortal, paymentsEnabled, setSelectedPlan, checkout } = useStrelko();

  const podpornikActive = isPodpornikActive(credits);
  const podpornik = getPodpornikStatus(credits);
  const cancelScheduled = Boolean(credits?.subscription_cancel_at_period_end);
  const periodEnd = credits?.subscription_current_period_end;

  let statusClass = podpornikActive ? "portal-badge--active" : "portal-badge--inactive";
  if (podpornikActive && cancelScheduled) {
    statusClass = "portal-badge--cancel-pending";
  }

  const handleSubscribe = () => {
    setSelectedPlan("podpornik");
    void checkout();
  };

  return (
    <div className="portal-panel">
      <div className="portal-narocnina-grid">
        <PortalTokenPurchase />

        <article className="portal-card portal-card--offer">
          <div className="portal-card__head">
            <h2 className="portal-card__title">{PRICING_PODPORNIST.name}</h2>
            <span className={`portal-badge ${statusClass}`}>
              {podpornikActive && cancelScheduled ? "Preklicana" : podpornik.label}
            </span>
          </div>
          {podpornikActive && cancelScheduled && periodEnd ? (
            <p className="portal-cancel-notice" role="status">
              Naročnina je preklicana in ostane aktivna do {formatPeriodEnd(periodEnd)}.
            </p>
          ) : podpornikActive ? (
            <p className="portal-card__hint">{podpornik.hint}</p>
          ) : null}
          <p className="pricing-plan-card__price">
            <span className="pricing-plan-card__amount">{PRICING_PODPORNIST.priceEur}</span>
            {PRICING_PODPORNIST.pricePeriod ? (
              <span className="pricing-plan-card__period">{PRICING_PODPORNIST.pricePeriod}</span>
            ) : null}
          </p>
          <p className="pricing-plan-card__label">{PRICING_PODPORNIST.priceLabel}</p>
          <p className="pricing-plan-card__ex-vat">{PRICING_PODPORNIST.priceExVat}</p>
          <ul className="plan-features">
            {PRICING_PODPORNIST.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>

          {!podpornikActive ? (
            <>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={handleSubscribe}
                disabled={!paymentsEnabled}
                aria-disabled={!paymentsEnabled}
              >
                {paymentsEnabled ? "Postanite podpornik" : "Naročnina bo kmalu na voljo"}
              </button>
              {!paymentsEnabled ? (
                <p className="portal-disabled-note">
                  Naročnina trenutno ni na voljo (plačila niso vklopljena).
                </p>
              ) : null}
            </>
          ) : credits?.billing_portal_available ? (
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => void openBillingPortal()}
            >
              Upravljaj naročnino
            </button>
          ) : (
            <p className="portal-disabled-note">
              Upravljanje naročnine trenutno ni na voljo za vaš račun.
            </p>
          )}

          {podpornikActive ? (
            <div className="portal-card__subsection">
              <h3 className="portal-card__subtitle">Preklic naročnine</h3>
              <ul className="plan-features">
                <li>Naročnino lahko kadar koli prekličete.</li>
                <li>Po preklicu se ne izvedejo nova plačila.</li>
                <li>Dostop ostane aktiven do konca že plačanega obdobja.</li>
              </ul>
              {credits?.billing_portal_available ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-block"
                  onClick={() => void openBillingPortal()}
                >
                  Prekliči ali uredi naročnino
                </button>
              ) : null}
            </div>
          ) : null}
        </article>
      </div>

      <PortalInvoicesSection />
    </div>
  );
}
