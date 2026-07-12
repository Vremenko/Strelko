import { PURCHASE_STEPS } from "../../lib/pricing-offers";

interface PricingPurchaseInfoProps {
  paymentsEnabled: boolean;
}

export function PricingPurchaseInfo({ paymentsEnabled }: PricingPurchaseInfoProps) {
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
      <ul className="plan-features pricing-purchase-info__notes">
        <li>
          Po preklicu novih plačil ne bo, dostop do paketa Podpornik pa ostane aktiven do konca že
          plačanega obdobja.
        </li>
        <li>
          Potrdila o plačilu in računi bodo po povezavi plačilnega sistema poslani po e-pošti ter
          dostopni v razdelku Moj Strelko.
        </li>
      </ul>
      {!paymentsEnabled ? (
        <p className="pricing-unavailable-notice" role="status">
          Nakup žetonov in aktivacija naročnine trenutno še nista na voljo.
        </p>
      ) : null}
    </section>
  );
}
