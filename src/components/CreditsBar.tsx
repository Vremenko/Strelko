import { useStrelko } from "../context/StrelkoContext";

export function CreditsBar() {
  const { user, credits, openCredits } = useStrelko();
  if (!user) return null;

  const planLabel = credits?.plan_name_sl ? ` · ${credits.plan_name_sl}` : "";

  return (
    <div className="credits-bar">
      <span>
        👋 {user.email}
        {planLabel} · Krediti: <strong>{credits?.credits_balance ?? 0}</strong>
      </span>
      <button type="button" className="btn btn-primary btn-sm" onClick={() => openCredits()}>
        Paketi
      </button>
    </div>
  );
}
