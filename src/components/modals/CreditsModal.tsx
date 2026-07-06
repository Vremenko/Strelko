import { useStrelko } from "../../context/StrelkoContext";

export function CreditsModal() {
  const { modals, closeCredits, plans, selectedPlan, setSelectedPlan, paymentsEnabled, checkout } =
    useStrelko();
  if (!modals.credits) return null;

  const list = plans.length
    ? plans
    : [
        {
          id: "ob_skodi",
          name_sl: "Ob škodi",
          price_eur: "4,50",
          monthly_credits: 5,
          features_sl: ["5 pregledov / mesec", "PDF"],
        },
      ];

  return (
    <div className="modal-overlay" id="credits-modal">
      <div className="modal modal-wide">
        <h3>Paketi Strelko</h3>
        {modals.creditsOptions.checkoutError && (
          <p className="form-error">{modals.creditsOptions.checkoutError}</p>
        )}
        {modals.creditsOptions.meteoalarmUpsell && (
          <p className="premium-upsell-402-lead">
            <strong>MeteoAlarm SMS opozorila</strong> so vključena v paketu Premium.
          </p>
        )}
        {modals.creditsOptions.insufficientCredits && (
          <p className="premium-upsell-402-lead">
            <strong>Potrebujete vsaj 1 pregled</strong> za podroben zemljevid in tabelo.
          </p>
        )}
        <div className="plans-grid">
          {list.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`plan-card${selectedPlan === p.id ? " plan-card--selected" : ""}`}
              onClick={() => setSelectedPlan(p.id)}
            >
              <h4>{p.name_sl}</h4>
              {p.price_eur && <p className="plan-price">{p.price_eur} €</p>}
              <ul>
                {(p.features_sl || []).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn btn-primary btn-block"
          id="btn-checkout"
          disabled={!paymentsEnabled}
          onClick={() => void checkout()}
        >
          {paymentsEnabled ? "Nadaljuj na plačilo" : "Plačila trenutno niso aktivna"}
        </button>
        <button type="button" className="btn btn-ghost btn-block" onClick={closeCredits}>
          Zapri
        </button>
      </div>
    </div>
  );
}

export function CheckoutSuccessModal() {
  const { modals, closeCheckoutSuccess } = useStrelko();
  const s = modals.checkoutSuccess;
  if (!s) return null;

  return (
    <div className="modal-overlay" id="checkout-success-modal">
      <div className="modal">
        <h3>Naročnina uspešna</h3>
        <p>
          Stanje kreditov: <strong>{s.balance}</strong>
          {s.creditsAdded > 0 && ` (+${s.creditsAdded})`}
        </p>
        <button type="button" className="btn btn-primary" onClick={closeCheckoutSuccess}>
          Nadaljuj
        </button>
      </div>
    </div>
  );
}
