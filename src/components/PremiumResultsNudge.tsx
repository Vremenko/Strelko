import { useStrelko } from "../context/StrelkoContext";

function shouldShowPremiumUpsell(
  user: ReturnType<typeof useStrelko>["user"],
  planId: string | undefined
): boolean {
  if (!user) return false;
  if (planId === "premium" || planId === "business" || planId === "enterprise") return false;
  return true;
}

export function PremiumResultsNudge({ totalStrikes }: { totalStrikes: number }) {
  const { user, credits, openPremiumUpsell } = useStrelko();

  if (!shouldShowPremiumUpsell(user, credits?.plan_id)) return null;

  const text =
    totalStrikes > 0
      ? "V bližini so bile strele. Premium vam pošlje SMS, ko ARSO izda novo opozorilo v vaši okolici."
      : "Premium vključuje SMS ob MeteoAlarm opozorilih — bodite obveščeni, preden se nevihta približa.";

  return (
    <aside className="premium-results-nudge">
      <div className="premium-results-nudge-copy">
        <strong>Opozorila v realnem času (Premium)</strong>
        <p>{text}</p>
      </div>
      <button type="button" className="btn btn-primary btn-sm" onClick={openPremiumUpsell}>
        Izberi Premium
      </button>
    </aside>
  );
}
