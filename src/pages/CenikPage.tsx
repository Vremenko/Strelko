import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { ObSkodiTokenPurchase } from "../components/pricing/ObSkodiTokenPurchase";
import { PricingPlanCard } from "../components/pricing/PricingPlanCard";
import { PricingPurchaseInfo } from "../components/pricing/PricingPurchaseInfo";
import { TokenUsageExplainer } from "../components/pricing/TokenUsageExplainer";
import { useStrelko } from "../context/StrelkoContext";
import {
  CENIK_RETURN_PATH,
  checkoutPlanForTab,
  clearCheckoutQuantity,
  setAuthReturn,
  setCheckoutPlanId,
  setCheckoutQuantity,
} from "../lib/auth-intent";
import { isObSkodiPurchaseAllowed } from "../lib/ob-skodi-tokens";
import {
  canSubscribePodpornik,
  getPodpornikOverview,
} from "../lib/portal-account";
import {
  CENIK_PODPORNIST_DESCRIPTION,
  CENIK_PODPORNIST_DISCLAIMER,
  CENIK_PODPORNIST_FEATURES,
  CENIK_PODPORNIST_RENEWAL_NOTE,
  CENIK_ZETONI_DESCRIPTION,
  PRICING_PODPORNIST,
} from "../lib/pricing-offers";
import { openStripeCheckoutInNewTab } from "../lib/stripe-billing-portal";
import type { ApiError } from "../types";

type CenikLocationState = { cenikNotice?: string } | null;

export function CenikPage() {
  const { user, credits, openAuth, paymentsEnabled, checkout, openBillingPortal } =
    useStrelko();
  const location = useLocation();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);
  const [tokenCheckoutBusy, setTokenCheckoutBusy] = useState(false);
  const tokenCheckoutInFlightRef = useRef(false);

  useEffect(() => {
    const state = location.state as CenikLocationState;
    const msg = state?.cenikNotice?.trim();
    if (!msg) return;
    setNotice(msg);
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.pathname, location.search, location.state, navigate]);

  const podpornikActive = Boolean(user && canSubscribePodpornik(credits) === false);
  const podpornikOverview = getPodpornikOverview(credits);

  const handlePodpornikCta = () => {
    if (!paymentsEnabled || podpornikActive) return;
    const planId = checkoutPlanForTab("narocnina");
    if (user) {
      void checkout(undefined, planId);
      return;
    }
    setAuthReturn(CENIK_RETURN_PATH);
    setCheckoutPlanId(planId);
    openAuth("login");
  };

  const handleObSkodiPurchase = (quantity: number) => {
    const planId = checkoutPlanForTab("zetoni");
    if (!user) {
      if (!paymentsEnabled) return;
      setAuthReturn(CENIK_RETURN_PATH);
      setCheckoutPlanId(planId);
      setCheckoutQuantity(quantity);
      openAuth("login");
      return;
    }
    if (!isObSkodiPurchaseAllowed(paymentsEnabled)) return;
    if (tokenCheckoutInFlightRef.current) return;
    tokenCheckoutInFlightRef.current = true;
    setTokenCheckoutBusy(true);
    setNotice(null);
    void (async () => {
      try {
        await openStripeCheckoutInNewTab(async () => {
          const { checkout_url } = await api.checkout({
            plan: planId,
            quantity,
          });
          clearCheckoutQuantity();
          return checkout_url;
        });
      } catch (e) {
        const err = e as ApiError;
        setNotice(err.message || "Checkout trenutno ni na voljo.");
      } finally {
        tokenCheckoutInFlightRef.current = false;
        setTokenCheckoutBusy(false);
      }
    })();
  };

  const podpornikCtaLabel = !paymentsEnabled
    ? "Naročnina bo kmalu na voljo"
    : podpornikActive
      ? "Paket Podpornik je aktiven"
      : !user
        ? "Za aktivacijo paketa Podpornik se prijavite."
        : "Postanite podpornik za 4,20 € na mesec";

  const podpornikDisabled = !paymentsEnabled || podpornikActive;

  return (
    <article className="pricing-page page--standard">
      <header className="page-header pricing-page-header">
        <h1>Cenik</h1>
      </header>

      {notice ? (
        <p className="form-error pricing-cenik-notice" role="alert">
          {notice}
        </p>
      ) : null}

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
              purchaseBusy={tokenCheckoutBusy}
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
            {podpornikActive ? (
              <div className="pricing-plan-card__active-block">
                {podpornikOverview.expiryLabel ? (
                  <p className="pricing-plan-card__active-note">{podpornikOverview.expiryLabel}</p>
                ) : null}
                <Link to="/moj-strelko" className="btn btn-moj-strelko btn-block">
                  Odpri Moj Strelko
                </Link>
                {credits?.billing_portal_available ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => void openBillingPortal()}
                  >
                    Upravljaj naročnino
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="pricing-plan-card__cta-block">
                <p className="pricing-plan-card__renewal-note">{CENIK_PODPORNIST_RENEWAL_NOTE}</p>
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={handlePodpornikCta}
                  disabled={podpornikDisabled}
                  aria-disabled={podpornikDisabled}
                >
                  {podpornikCtaLabel}
                </button>
              </div>
            )}
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
