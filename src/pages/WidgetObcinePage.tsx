import { useEffect } from "react";
import { useStrelko } from "../context/StrelkoContext";

const DEFAULT_OB_MID = 11027849;

function buildWidgetPreviewPath(
  widget: ReturnType<typeof useStrelko>["widget"],
  size: "compact" | "full"
): string {
  const params = new URLSearchParams();
  const mid = widget.publicWidgetObMid || DEFAULT_OB_MID;
  params.set("ob_mid", String(mid));
  if (widget.publicWidgetLat != null && widget.publicWidgetLon != null) {
    params.set("lat", String(widget.publicWidgetLat));
    params.set("lon", String(widget.publicWidgetLon));
    if (widget.publicWidgetLabel) params.set("label", widget.publicWidgetLabel.slice(0, 80));
  }
  params.set("theme", widget.publicWidgetTheme);
  params.set("size", size === "full" ? "full" : "compact");
  params.set("api", `${location.origin}/widget/api`);
  return `/widget/obcina.html?${params}`;
}

export function WidgetObcinePage() {
  const {
    widget,
    setWidget,
    loadWidgetObcine,
    loadWidgetObMid,
    resetWidget,
  } = useStrelko();

  useEffect(() => {
    void loadWidgetObcine();
    void loadWidgetObMid(DEFAULT_OB_MID);
  }, [loadWidgetObcine, loadWidgetObMid]);

  const size = widget.publicWidgetPreviewSize;
  const isFull = size === "full";
  const selected = widget.publicWidgetObMid || DEFAULT_OB_MID;
  const previewSrc = buildWidgetPreviewPath(widget, size);

  return (
    <section className="widget-obcine-page">
      <div className="widget-obcine-head">
        <h2>Widget udarov strel za spletne strani</h2>
        <p className="widget-obcine-lead">
          Brezplačen informativni widget za vdelavo na vašo spletno stran.
        </p>
      </div>
      <div className="widget-obcine-panel">
        <div className="widget-obcine-settings-bar search-card search-card--inline">
          <div className="search-card-body">
            <div className="widget-obcine-settings-row">
              <div className="widget-obcine-field">
                <label className="widget-code-label" htmlFor="public-widget-obcina">
                  Občina
                </label>
                <select
                  id="public-widget-obcina"
                  className="widget-obcina-select"
                  value={selected}
                  disabled={!widget.publicWidgetObcine.length}
                  onChange={(e) => void loadWidgetObMid(Number(e.target.value))}
                >
                  {widget.publicWidgetObcine.length ? (
                    widget.publicWidgetObcine.map((o) => (
                      <option key={o.ob_mid} value={o.ob_mid}>
                        {o.name}
                      </option>
                    ))
                  ) : (
                    <option value={DEFAULT_OB_MID}>Nalagam seznam občin …</option>
                  )}
                </select>
              </div>
              <div className="widget-obcine-field">
                <label className="widget-code-label" htmlFor="public-widget-theme">
                  Tema
                </label>
                <select
                  id="public-widget-theme"
                  className="widget-obcina-select"
                  value={widget.publicWidgetTheme}
                  onChange={(e) =>
                    setWidget({ publicWidgetTheme: e.target.value as "dark" | "light" })
                  }
                >
                  <option value="dark">Temna</option>
                  <option value="light">Svetla</option>
                </select>
              </div>
              <div className="widget-obcine-field widget-obcine-field--action">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    resetWidget();
                    void loadWidgetObMid(DEFAULT_OB_MID);
                  }}
                >
                  Privzete nastavitve
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="widget-obcine-preview-card">
          <div className="widget-obcine-preview-toolbar">
            <div className="widget-mode-toggle" role="tablist">
              <button
                type="button"
                className={`widget-mode-btn${!isFull ? " widget-mode-btn--active" : ""}`}
                onClick={() => setWidget({ publicWidgetPreviewSize: "compact" })}
              >
                Osnovni
              </button>
              <button
                type="button"
                className={`widget-mode-btn${isFull ? " widget-mode-btn--active" : ""}`}
                onClick={() => setWidget({ publicWidgetPreviewSize: "full" })}
              >
                Razširjeni
              </button>
            </div>
          </div>
          <div
            className={`widget-preview-frame${isFull ? " widget-preview-frame--full" : " widget-preview-frame--compact"}`}
          >
            <iframe
              key={previewSrc}
              id="public-widget-iframe"
              className={`widget-obcine-iframe${isFull ? " widget-obcine-iframe--full" : " widget-obcine-iframe--compact"}`}
              src={previewSrc}
              title="Predogled widgeta"
            />
          </div>
          <label className="widget-code-label" htmlFor="public-widget-embed-code">
            Embed koda
          </label>
          <textarea
            id="public-widget-embed-code"
            className="widget-embed-code widget-obcine-embed-code"
            readOnly
            rows={4}
            value={`<iframe src="${location.origin}${previewSrc}" ...></iframe>`}
          />
        </div>
      </div>
    </section>
  );
}
