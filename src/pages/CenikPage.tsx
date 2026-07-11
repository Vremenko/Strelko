import { PricingPlanCard } from "../components/pricing/PricingPlanCard";
import { PricingPurchaseInfo } from "../components/pricing/PricingPurchaseInfo";
import { TokenUsageExplainer } from "../components/pricing/TokenUsageExplainer";
import { useStrelko } from "../context/StrelkoContext";
import {
  checkoutPlanForTab,
  portalTabPath,
  setAuthReturn,
  setCheckoutPlanId,
} from "../lib/auth-intent";
import {
  PRICING_OB_SKODI,
  PRICING_PODPORNIST,
  PRICING_VAT_RATE_NOTE,
} from "../lib/pricing-offers";

export function CenikPage() {
  const { user, openAuth, paymentsEnabled, setSelectedPlan, checkout } = useStrelko();

  const handleOfferCta = (tab: "zetoni" | "narocnina") => {
    if (!paymentsEnabled) {
      return;
    }
    const planId = checkoutPlanForTab(tab);
    if (user) {
      setSelectedPlan(planId);
      void checkout();
      return;
    }
    setAuthReturn(portalTabPath(tab));
    setCheckoutPlanId(planId);
    openAuth("register");
  };

  const obSkodiCtaLabel = !paymentsEnabled
    ? "Nakup bo kmalu na voljo"
    : user
      ? "Kupite žetone"
      : "Kupite žetone — prijava";

  const podpornikCtaLabel = !paymentsEnabled
    ? "Naročnina bo kmalu na voljo"
    : user
      ? "Postanite podpornik"
      : "Postanite podpornik — prijava";

  const ctaDisabled = !paymentsEnabled;

  return (
    <article className="pricing-page page--standard">
      <header className="page-header pricing-page-header">
        <h1>Cenik</h1>
        <p className="pricing-page-header__subtitle">
          Potrebujete podroben pregled za zavarovalnico ali želite redno spremljati strele?
        </p>
        <p className="pricing-page-header__intro">
          Za podroben pregled udarov strel, zemljevid in možnost izdelave PDF-poročila izberite Ob
          škodi. Za polni arhiv, napredne statistike in widget ter podporo nadaljnjemu razvoju
          Strelka in produktov Meteoinfa izberite Podpornika.
        </p>
      </header>

      <section className="pricing-plans" aria-label="Paketi">
        <div className="plan-grid plan-grid--2 pricing-plan-grid">
          <PricingPlanCard offer={PRICING_OB_SKODI}>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => handleOfferCta("zetoni")}
              disabled={ctaDisabled}
              aria-disabled={ctaDisabled}
            >
              {obSkodiCtaLabel}
            </button>
          </PricingPlanCard>
          <PricingPlanCard offer={PRICING_PODPORNIST}>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => handleOfferCta("narocnina")}
              disabled={ctaDisabled}
              aria-disabled={ctaDisabled}
            >
              {podpornikCtaLabel}
            </button>
          </PricingPlanCard>
        </div>
        <p className="pricing-vat-rate-note">{PRICING_VAT_RATE_NOTE}</p>
      </section>

      <TokenUsageExplainer />

      <PricingPurchaseInfo />
    </article>
  );
}
