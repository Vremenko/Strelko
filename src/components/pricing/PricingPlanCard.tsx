import type { PricingOffer } from "../../lib/pricing-offers";

interface PricingPlanCardProps {
  offer: PricingOffer;
  children?: React.ReactNode;
}

export function PricingPlanCard({ offer, children }: PricingPlanCardProps) {
  return (
    <article className="plan-card pricing-plan-card">
      <h3 className="pricing-plan-card__title">{offer.name}</h3>
      <p className="pricing-plan-card__price">
        <span className="pricing-plan-card__amount">{offer.priceEur}</span>
        {offer.pricePeriod ? (
          <span className="pricing-plan-card__period">{offer.pricePeriod}</span>
        ) : null}
      </p>
      <p className="pricing-plan-card__label">{offer.priceLabel}</p>
      <p className="pricing-plan-card__ex-vat">{offer.priceExVat}</p>
      <ul className="plan-features">
        {offer.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      {children}
    </article>
  );
}
