import { useEffect } from "react";
import { useStrelko } from "../context/StrelkoContext";

export function ResultsWidgetPanel() {
  const { user, credits, userWidget, loadUserWidget, openWidgetSetup } = useStrelko();

  const showPanel =
    !!user && (!!credits?.widget_active || credits?.plan_id === "podpornik");

  useEffect(() => {
    if (!showPanel) return;
    void loadUserWidget();
  }, [showPanel, loadUserWidget]);

  if (!showPanel) return null;

  const configured = !!credits?.widget_configured || !!userWidget?.configured;
  const embedHtml = userWidget?.embed_html;

  return (
    <aside className="widget-panel">
      <h4>Widget za spletno stran</h4>
      {configured && embedHtml ? (
        <>
          <p className="widget-panel-lead">
            Vdelajte spodnjo kodo na svojo stran (1 domena).
          </p>
          <label className="widget-code-label">Koda za vdelavo</label>
          <textarea className="widget-embed-code" readOnly rows={3} value={embedHtml} />
        </>
      ) : (
        <p className="widget-panel-lead">
          Nastavite lokacijo in domeno za prikaz zadnjih strel na vaši strani.
        </p>
      )}
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => void openWidgetSetup()}
      >
        {configured ? "Uredi widget" : "Nastavi widget"}
      </button>
    </aside>
  );
}
