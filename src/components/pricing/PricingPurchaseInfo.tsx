import { PURCHASE_CLOSING_NOTE, PURCHASE_STEPS } from "../../lib/pricing-offers";

export function PricingPurchaseInfo() {
  return (
    <section
      className="pricing-info-card pricing-surface-card pricing-purchase-info"
      aria-labelledby="pricing-purchase-title"
    >
      <h2 className="pricing-section-title" id="pricing-purchase-title">
        Nakup, naročnina in preklic
      </h2>
      <ol className="pricing-steps-list">
        {PURCHASE_STEPS.map((step, i) => (
          <li key={step}>
            <span className="pricing-steps-list__num">{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <p className="pricing-purchase-info__closing">
        <strong>{PURCHASE_CLOSING_NOTE.lead}</strong> {PURCHASE_CLOSING_NOTE.body}
      </p>
    </section>
  );
}
