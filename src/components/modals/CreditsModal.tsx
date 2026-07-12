import { PlanPrice, PlanPriceVatNote } from "../PlanPrice";
import { useStrelko } from "../../context/StrelkoContext";
import {
  checkoutButtonLabel,
  defaultPlansFallback,
  resolvePlansList,
} from "../../lib/plans-modal";
import { OB_SKODI_PER_TOKEN_GROSS_LABEL } from "../../lib/ob-skodi-tokens";
import { formatPlanGrossLabel } from "../../lib/pricing";
import { seasonLabelSl } from "../../lib/season";
import type { Plan } from "../../types";

function InsufficientCreditsUpsell({ plans }: { plans: Plan[] }) {
  const skoda = plans.find((p) => p.id === "ob_skodi") || defaultPlansFallback()[0];
  const pod = plans.find((p) => p.id === "podpornik") || defaultPlansFallback()[1];

  return (
    <div className="premium-upsell-402">
      <p className="premium-upsell-402-lead">
        <strong>Potrebujete vsaj 1 pregled</strong> za podroben zemljevid in tabelo.
      </p>
      <div className="plan-compare-mini">
        <div className="plan-compare-col">
          <span className="plan-compare-name">{skoda.name_sl}</span>
          <span className="plan-compare-price">
            {formatPlanGrossLabel(skoda, OB_SKODI_PER_TOKEN_GROSS_LABEL)}
            {" / žeton"}
          </span>
          <span>
            {skoda.monthly_credits} pregledov · PDF
          </span>
        </div>
        <div className="plan-compare-col plan-compare-col--rec">
          <span className="plan-compare-badge">Sezona</span>
          <span className="plan-compare-name">{pod.name_sl}</span>
          <span className="plan-compare-price">
            {formatPlanGrossLabel(pod, "8,50 €")}
            {pod.price_suffix_sl || ""}
          </span>
          <span>Arhiv + widget</span>
        </div>
      </div>
    </div>
  );
}

export function CreditsModal() {
  const {
    modals,
    closeCredits,
    plans,
    plansMeta,
    selectedPlan,
    setSelectedPlan,
    paymentsEnabled,
    checkout,
  } = useStrelko();
  if (!modals.credits) return null;

  const list = resolvePlansList(plans);
  const insufficientCredits = !!modals.creditsOptions.insufficientCredits;
  const checkoutError = modals.creditsOptions.checkoutError;
  const seasonNote = plansMeta.season_label_sl || seasonLabelSl();
  const archiveFree = !!plansMeta.archive_free_now;
  const selected = list.find((p) => p.id === selectedPlan);
  const contactOnly = !!selected?.contact_only;

  const intro = archiveFree ? (
    <p className="credits-modal-lead">
      Pozimi je <strong>statistika strel brezplačna za vse</strong>. Med sezono (
      {seasonNote}) odklenite polni arhiv s paketom Podpornik.
    </p>
  ) : (
    <p className="credits-modal-lead">
      Sezona strel: <strong>{seasonNote}</strong>. Izberite paket za podrobne preglede ali
      polni arhiv.
    </p>
  );

  return (
    <div className="modal-overlay" id="credits-modal">
      <div className="modal modal-plans modal-plans--dual">
        <h3>{insufficientCredits ? "Ni dovolj pregledov" : "Izberite paket"}</h3>
        {intro}
        {modals.creditsOptions.meteoalarmUpsell && (
          <p className="premium-upsell-402-lead">
            <strong>MeteoAlarm SMS opozorila</strong> so vključena v paketu Premium.
          </p>
        )}
        {insufficientCredits && <InsufficientCreditsUpsell plans={list} />}
        {checkoutError && <p className="form-error" id="checkout-error">{checkoutError}</p>}
        <div className="plan-grid plan-grid--2">
          {list.map((p) => {
            const isSelected = selectedPlan === p.id;
            const cls = [
              "plan-card",
              isSelected ? "is-selected" : "",
              p.recommended ? "is-recommended" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={p.id}
                type="button"
                className={cls}
                data-plan={p.id}
                aria-pressed={isSelected}
                onClick={() => setSelectedPlan(p.id)}
              >
                {p.recommended && <span className="plan-ribbon">Priporočeno</span>}
                <h4>{p.name_sl}</h4>
                {p.tagline_sl && <p className="plan-tagline">{p.tagline_sl}</p>}
                <PlanPrice plan={p} variant="modal" />
                <PlanPriceVatNote plan={p} />
                <ul className="plan-features">
                  {(p.features_sl || []).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
        <p className="plans-footnote">
          1 pregled = podroben zemljevid in tabela za eno lokacijo (14 dni). Vse cene vključujejo
          22&nbsp;% DDV.
        </p>
        <div className="payment-methods" id="payment-methods">
          <span className="pay-badge recommended">Kartica</span>
          <span className="pay-badge recommended">Apple Pay</span>
          <span className="pay-badge recommended">Google Pay</span>
        </div>
        {!paymentsEnabled && (
          <p className="form-error">Plačila trenutno niso na voljo. Poskusite pozneje.</p>
        )}
        <button
          type="button"
          className="btn btn-primary"
          id="btn-checkout"
          style={{ width: "100%", marginTop: "1rem" }}
          disabled={!paymentsEnabled || contactOnly}
          onClick={() => void checkout()}
        >
          {contactOnly
            ? "Po dogovoru"
            : paymentsEnabled
              ? checkoutButtonLabel(selectedPlan, list)
              : "Plačila trenutno niso aktivna"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          data-action="close-modal"
          style={{ width: "100%", marginTop: "0.5rem" }}
          onClick={closeCredits}
        >
          Prekliči
        </button>
      </div>
    </div>
  );
}

export function CheckoutSuccessModal() {
  const { modals, closeCheckoutSuccess } = useStrelko();
  const s = modals.checkoutSuccess;
  if (!s) return null;

  const isSeason = s.planId === "podpornik";
  const message = isSeason ? (
    <>
      Paket <strong>{s.planName || "Podpornik"}</strong> je aktiven do konca sezone. Na voljo
      imate <strong>{s.balance}</strong> pregledov in widget.
    </>
  ) : s.creditsAdded > 0 ? (
    <>
      Dodanih <strong>{s.creditsAdded}</strong> pregledov. Stanje: <strong>{s.balance}</strong>.
    </>
  ) : s.planName ? (
    <>
      Paket <strong>{s.planName}</strong> je aktiven. Stanje: <strong>{s.balance}</strong>{" "}
      pregledov.
    </>
  ) : (
    <>
      Paket je aktiven. Stanje: <strong>{s.balance}</strong> pregledov.
    </>
  );

  return (
    <div className="modal-overlay" id="checkout-success-modal">
      <div className="modal">
        <h3>{isSeason ? "Hvala za podporo!" : "Plačilo uspešno"}</h3>
        <p>{message}</p>
        <button
          type="button"
          className="btn btn-primary"
          data-action="close-checkout-success"
          style={{ width: "100%", marginTop: "1rem" }}
          onClick={closeCheckoutSuccess}
        >
          Nadaljuj
        </button>
      </div>
    </div>
  );
}
