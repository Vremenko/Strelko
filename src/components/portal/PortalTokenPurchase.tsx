import { useStrelko } from "../../context/StrelkoContext";
import { isObSkodiPurchaseAllowed } from "../../lib/ob-skodi-tokens";
import { tokenBalanceLabel } from "../../lib/portal-account";
import { ObSkodiTokenPurchase } from "../pricing/ObSkodiTokenPurchase";

/** Nakup žetonov Ob škodi — neodvisna storitev, ne naročnina. */
export function PortalTokenPurchase() {
  const { credits, paymentsEnabled, setSelectedPlan, checkout } = useStrelko();
  const tokenBalance = tokenBalanceLabel(credits);

  const handlePurchase = (_quantity: number) => {
    if (!isObSkodiPurchaseAllowed(paymentsEnabled)) return;
    setSelectedPlan("ob_skodi");
    void checkout();
  };

  return (
    <article className="portal-card portal-card--offer">
      <div className="portal-card__head">
        <h2 className="portal-card__title">Ob škodi – žetoni</h2>
        <span className="portal-card__tag">Enkratno</span>
      </div>
      <ObSkodiTokenPurchase
        paymentsEnabled={paymentsEnabled}
        showBalance
        showAddToBalanceNote
        tokenBalance={tokenBalance}
        onPurchase={handlePurchase}
      />
    </article>
  );
}
