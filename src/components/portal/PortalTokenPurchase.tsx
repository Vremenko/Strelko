import { useStrelko } from "../../context/StrelkoContext";
import { isObSkodiPurchaseAllowed } from "../../lib/ob-skodi-tokens";
import { tokenBalanceLabel } from "../../lib/portal-account";
import { ObSkodiTokenPurchase } from "../pricing/ObSkodiTokenPurchase";

/** Nakup žetonov Ob škodi — neodvisna storitev, ne naročnina. */
export function PortalTokenPurchase() {
  const { credits, paymentsEnabled, paymentsResolved, plansError, loadPlans, checkout } = useStrelko();
  const tokenBalance = tokenBalanceLabel(credits);

  const handlePurchase = (quantity: number) => {
    if (!isObSkodiPurchaseAllowed(paymentsEnabled)) return;
    void checkout(quantity, "ob_skodi");
  };

  return (
    <article className="portal-card portal-card--offer">
      <div className="portal-card__head">
        <h2 className="portal-card__title">Ob škodi – žetoni</h2>
        <span className="portal-card__tag">Enkratno</span>
      </div>
      <ObSkodiTokenPurchase
        paymentsEnabled={paymentsEnabled}
        paymentsResolved={paymentsResolved}
        plansError={plansError}
        showBalance
        showAddToBalanceNote
        tokenBalance={tokenBalance}
        onRetryPlans={() => void loadPlans()}
        onPurchase={handlePurchase}
      />
    </article>
  );
}
