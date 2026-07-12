import { ObSkodiTokenPurchase } from "../components/pricing/ObSkodiTokenPurchase";
import { PricingPlanCard } from "../components/pricing/PricingPlanCard";
import { PricingPurchaseInfo } from "../components/pricing/PricingPurchaseInfo";
import { TokenUsageExplainer } from "../components/pricing/TokenUsageExplainer";
import { useStrelko } from "../context/StrelkoContext";
import {
  CENIK_RETURN_PATH,
  checkoutPlanForTab,
  setAuthReturn,
  setCheckoutPlanId,
  setCheckoutQuantity,
} from "../lib/auth-intent";
import { isObSkodiPurchaseAllowed } from "../lib/ob-skodi-tokens";
import {
  CENIK_PODPORNIST_DESCRIPTION,
  CENIK_PODPORNIST_DISCLAIMER,
  CENIK_PODPORNIST_FEATURES,
  CENIK_ZETONI_DESCRIPTION,
  PRICING_PODPORNIST,
} from "../lib/pricing-offers";

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
    setAuthReturn(CENIK_RETURN_PATH);
    setCheckoutPlanId(planId);
    openAuth("login");
  };

  const handleObSkodiPurchase = (quantity: number) => {
    const planId = checkoutPlanForTab("zetoni");
    if (user) {
      if (!isObSkodiPurchaseAllowed(paymentsEnabled)) return;
      setSelectedPlan(planId);
      setCheckoutQuantity(quantity);
      void checkout();
      return;
    }
    if (!paymentsEnabled) return;
    setAuthReturn(CENIK_RETURN_PATH);
    setCheckoutPlanId(planId);
    setCheckoutQuantity(quantity);
    openAuth("login");
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
      </header>

      <section className="pricing-plans" aria-label="Ponudbi">
        <div className="plan-grid plan-grid--2 pricing-plan-grid">
          <article className="plan-card pricing-plan-card pricing-surface-card">
            <span className="pricing-plan-card__badge">Enkratni nakup</span>
            <h3 className="pricing-plan-card__title">Ob škodi</h3>
            <p className="pricing-plan-card__desc">{CENIK_ZETONI_DESCRIPTION}</p>
            <ObSkodiTokenPurchase
              variant="cenik"
              paymentsEnabled={paymentsEnabled}
              loggedIn={Boolean(user)}
              onPurchase={handleObSkodiPurchase}
            />
          </article>

          <PricingPlanCard
            offer={PRICING_PODPORNIST}
            badge="Mesečna naročnina"
            description={CENIK_PODPORNIST_DESCRIPTION}
            features={CENIK_PODPORNIST_FEATURES}
            disclaimer={CENIK_PODPORNIST_DISCLAIMER}
            hidePriceLabel
          >
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={handlePodpornikCta}
              disabled={podpornikDisabled}
              aria-disabled={podpornikDisabled}
            >
              {podpornikCtaLabel}
            </button>
            {!paymentsEnabled ? (
              <p className="portal-disabled-note">Aktivacija naročnine trenutno še ni na voljo.</p>
            ) : null}
          </PricingPlanCard>
        </div>
      </section>

      <section className="pricing-explainer-grid" aria-label="Pojasnila">
        <TokenUsageExplainer />
        <PricingPurchaseInfo />
      </section>
    </article>
  );
}
