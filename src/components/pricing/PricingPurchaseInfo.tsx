import { PURCHASE_STEPS } from "../../lib/pricing-offers";

export function PricingPurchaseInfo() {
  return (
    <section className="pricing-purchase-info legal-card">
      <h2 className="pricing-section-title">Nakup, naročnina in preklic</h2>
      <ol className="pricing-steps-list">
        {PURCHASE_STEPS.map((step, i) => (
          <li key={step}>
            <span className="pricing-steps-list__num">{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <ul className="plan-features pricing-purchase-info__notes">
        <li>Naročnina Podpornik se mesečno samodejno obnovi, dokler jo ne prekličete v Moj Strelko.</li>
        <li>Po preklicu se ne izvedejo nova plačila; dostop ostane do konca že plačanega obdobja.</li>
        <li>
          Potrdila in računi bodo po povezavi plačilnega sistema dostopni po e-pošti in v Moj Strelko,
          ko bo ta funkcionalnost vklopljena.
        </li>
      </ul>
    </section>
  );
}
