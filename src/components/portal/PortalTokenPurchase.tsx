import { useStrelko } from "../../context/StrelkoContext";
import { PRICING_OB_SKODI } from "../../lib/pricing-offers";
import { tokenBalanceLabel } from "../../lib/portal-account";

/** Nakup žetonov Ob škodi — neodvisna storitev, ne naročnina. */
export function PortalTokenPurchase() {
  const { credits, paymentsEnabled, setSelectedPlan, checkout } = useStrelko();
  const purchaseDisabled = !paymentsEnabled;
  const tokenBalance = tokenBalanceLabel(credits);

  const handleBuy = () => {
    setSelectedPlan("ob_skodi");
    void checkout();
  };

  return (
    <article className="portal-card portal-card--offer">
      <div className="portal-card__head">
        <h2 className="portal-card__title">Ob škodi – žetoni</h2>
        <span className="portal-card__tag">Enkratno</span>
      </div>
      <p className="pricing-plan-card__price">
        <span className="pricing-plan-card__amount">{PRICING_OB_SKODI.priceEur}</span>
      </p>
      <p className="pricing-plan-card__label">enkratno</p>
      <p className="pricing-plan-card__ex-vat">{PRICING_OB_SKODI.priceExVat}</p>
      <ul className="plan-features">
        <li>4 žetoni</li>
        <li>Žetoni ne potečejo</li>
      </ul>
      <div className="portal-stat portal-stat--inline">
        <span className="portal-stat__label">Vaše stanje žetonov</span>
        <span className="portal-stat__value">{tokenBalance}</span>
      </div>
      <button
        type="button"
        className="btn btn-primary btn-block"
        onClick={handleBuy}
        disabled={purchaseDisabled}
        aria-disabled={purchaseDisabled}
      >
        {purchaseDisabled ? "Nakup bo kmalu na voljo" : "Kupite 4 žetone"}
      </button>
      {purchaseDisabled ? (
        <p className="portal-disabled-note">
          Nakup žetonov trenutno ni na voljo (plačila niso vklopljena).
        </p>
      ) : null}
    </article>
  );
}
