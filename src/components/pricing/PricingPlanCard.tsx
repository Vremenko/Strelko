import type { PricingOffer } from "../../lib/pricing-offers";

interface PricingPlanCardProps {
  offer: PricingOffer;
  description?: string;
  footerNote?: string;
  disclaimer?: string;
  children?: React.ReactNode;
}

export function PricingPlanCard({
  offer,
  description,
  footerNote,
  disclaimer,
  children,
}: PricingPlanCardProps) {
  return (
    <article className="plan-card pricing-plan-card pricing-surface-card">
      <h3 className="pricing-plan-card__title">{offer.name}</h3>
      {description ? <p className="pricing-plan-card__desc">{description}</p> : null}
      <p className="pricing-plan-card__price">
        <span className="pricing-plan-card__amount">{offer.priceEur}</span>
        {offer.pricePeriod ? (
          <span className="pricing-plan-card__period">{offer.pricePeriod}</span>
        ) : null}
      </p>
      <p className="pricing-plan-card__label">{offer.priceLabel}</p>
      <p className="pricing-plan-card__ex-vat">{offer.priceExVat}</p>
      <ul className="plan-features pricing-plan-card__features">
        {offer.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      {footerNote ? <p className="pricing-plan-card__footer-note">{footerNote}</p> : null}
      {disclaimer ? <p className="pricing-plan-card__disclaimer">{disclaimer}</p> : null}
      {children}
    </article>
  );
}
