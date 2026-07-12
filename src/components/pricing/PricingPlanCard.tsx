import type { PricingOffer } from "../../lib/pricing-offers";

interface PricingPlanCardProps {
  offer: PricingOffer;
  badge?: string;
  description?: string;
  features?: readonly string[];
  footerNote?: string;
  disclaimer?: string;
  hidePriceLabel?: boolean;
  priceExVat?: string;
  children?: React.ReactNode;
}

export function PricingPlanCard({
  offer,
  badge,
  description,
  features,
  footerNote,
  disclaimer,
  hidePriceLabel = false,
  priceExVat,
  children,
}: PricingPlanCardProps) {
  const featureItems = features ?? offer.features;
  const exVatLabel = priceExVat ?? offer.priceExVat;
  return (
    <article className="plan-card pricing-plan-card pricing-surface-card">
      {badge ? <span className="pricing-plan-card__badge">{badge}</span> : null}
      <h3 className="pricing-plan-card__title">{offer.name}</h3>
      {description ? <p className="pricing-plan-card__desc">{description}</p> : null}
      <div className="pricing-plan-card__main">
        <p className="pricing-plan-card__price">
          <span className="pricing-plan-card__amount">{offer.priceEur}</span>
          {offer.pricePeriod ? (
            <span className="pricing-plan-card__period">{offer.pricePeriod}</span>
          ) : null}
        </p>
        {!hidePriceLabel ? <p className="pricing-plan-card__label">{offer.priceLabel}</p> : null}
        <p className="pricing-plan-card__ex-vat">{exVatLabel}</p>
        <ul className="plan-features pricing-plan-card__features">
          {featureItems.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        {footerNote ? <p className="pricing-plan-card__footer-note">{footerNote}</p> : null}
        {disclaimer ? <p className="pricing-plan-card__disclaimer">{disclaimer}</p> : null}
      </div>
      {children ? (
        <div className="pricing-plan-card__footer pricing-plan-card__footer--cta">{children}</div>
      ) : null}
    </article>
  );
}
