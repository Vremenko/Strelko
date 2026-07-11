import { ObSkodiTokenPurchase } from "../components/pricing/ObSkodiTokenPurchase";
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
import { isObSkodiPurchaseAllowed } from "../lib/ob-skodi-tokens";
import { PRICING_PODPORNIST, PRICING_VAT_RATE_NOTE } from "../lib/pricing-offers";

export function CenikPage() {
  const { user, openAuth, paymentsEnabled, setSelectedPlan, checkout } = useStrelko();

  const handlePodpornikCta = () => {
    if (!paymentsEnabled) return;
    const planId = checkoutPlanForTab("narocnina");
    if (user) {
      setSelectedPlan(planId);
      void checkout();
      return;
    }
    setAuthReturn(portalTabPath("narocnina"));
    setCheckoutPlanId(planId);
    openAuth("register");
  };

  const handleObSkodiPurchase = (_quantity: number) => {
    if (!isObSkodiPurchaseAllowed(paymentsEnabled)) return;
    const planId = checkoutPlanForTab("zetoni");
    if (user) {
      setSelectedPlan(planId);
      void checkout();
      return;
    }
    setAuthReturn(portalTabPath("narocnina"));
    setCheckoutPlanId(planId);
    openAuth("register");
  };

  const podpornikCtaLabel = !paymentsEnabled
    ? "Naročnina bo kmalu na voljo"
    : user
      ? "Postanite podpornik"
      : "Postanite podpornik — prijava";

  const podpornikDisabled = !paymentsEnabled;

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
          <article className="plan-card pricing-plan-card">
            <div className="portal-card__head">
              <h3 className="pricing-plan-card__title">Ob škodi – žetoni</h3>
              <span className="portal-card__tag">Enkratno</span>
            </div>
            <ObSkodiTokenPurchase
              paymentsEnabled={paymentsEnabled}
              onPurchase={handleObSkodiPurchase}
            />
          </article>
          <PricingPlanCard offer={PRICING_PODPORNIST}>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handlePodpornikCta}
              disabled={podpornikDisabled}
              aria-disabled={podpornikDisabled}
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
