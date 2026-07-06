import { useEffect, useMemo, useRef, useState } from "react";
import { useStrelko } from "../context/StrelkoContext";
import {
  copyWidgetEmbedCode,
  ensureWidgetResizeListener,
  newWidgetEmbedFrameId,
  widgetEmbedConfigKey,
  widgetEmbedHtml,
  widgetPreviewIframeStyle,
  widgetPreviewPath,
  widgetSizeHintText,
} from "../lib/widget-obcine";

const DEFAULT_OB_MID = 11027849;

function useMobilePreview(): boolean {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width:899px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width:899px)");
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return mobile;
}

export function WidgetObcinePage() {
  const {
    widget,
    setWidget,
    loadWidgetObcine,
    loadWidgetObMid,
    resetWidget,
  } = useStrelko();
  const mobile = useMobilePreview();

  useEffect(() => {
    void loadWidgetObcine();
    void loadWidgetObMid(DEFAULT_OB_MID);
  }, [loadWidgetObcine, loadWidgetObMid]);

  useEffect(() => {
    ensureWidgetResizeListener();
  }, []);

  const size = widget.publicWidgetPreviewSize;
  const isFull = size === "full";
  const selected = widget.publicWidgetObMid || DEFAULT_OB_MID;
  const ready = !!widget.publicWidgetObMid;
  const previewSrc = ready ? widgetPreviewPath(widget, size) : "about:blank";
  const embedConfigKey = widgetEmbedConfigKey(widget, size);
  const frameIdRef = useRef({ key: "", id: newWidgetEmbedFrameId(size) });

  if (frameIdRef.current.key !== embedConfigKey) {
    frameIdRef.current = {
      key: embedConfigKey,
      id: newWidgetEmbedFrameId(size),
    };
  }

  const embedCode = useMemo(
    () => (ready ? widgetEmbedHtml(widget, size, frameIdRef.current.id) : "Izberite občino …"),
    [ready, embedConfigKey, size, widget]
  );

  const iframeStyle = widgetPreviewIframeStyle(isFull, mobile);

  return (
    <section className="widget-obcine-page">
      <div className="widget-obcine-head">
        <h2>Widget udarov strel za spletne strani</h2>
        <p className="widget-obcine-lead">
          Brezplačen informativni widget za vdelavo na vašo spletno stran. Prikazuje udare strel v
          izbrani občini — zadnjih 24 ur, čas zadnje strele in skupno število v zadnjih 30 dneh.
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
                  Tema widgeta
                </label>
                <select
                  id="public-widget-theme"
                  className="widget-obcina-select"
                  value={widget.publicWidgetTheme}
                  onChange={(e) =>
                    setWidget({ publicWidgetTheme: e.target.value as "dark" | "light" })
                  }
                >
                  <option value="dark">Temna (privzeto)</option>
                  <option value="light">Svetla</option>
                </select>
              </div>
              <div className="widget-obcine-field widget-obcine-field--action">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  id="public-widget-defaults"
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
            <div className="widget-mode-toggle" role="tablist" aria-label="Velikost widgeta">
              <button
                type="button"
                id="public-widget-mode-compact"
                className={`widget-mode-btn${!isFull ? " widget-mode-btn--active" : ""}`}
                role="tab"
                aria-selected={!isFull}
                onClick={() => setWidget({ publicWidgetPreviewSize: "compact" })}
              >
                Osnovni
              </button>
              <button
                type="button"
                id="public-widget-mode-full"
                className={`widget-mode-btn${isFull ? " widget-mode-btn--active" : ""}`}
                role="tab"
                aria-selected={isFull}
                onClick={() => setWidget({ publicWidgetPreviewSize: "full" })}
              >
                Razširjeni
              </button>
            </div>
            <p id="public-widget-size-hint" className="widget-field-hint widget-obcine-size-hint">
              {widgetSizeHintText(isFull)}
            </p>
          </div>
          <div
            id="public-widget-preview-frame"
            className={`widget-preview-frame${isFull ? " widget-preview-frame--full" : " widget-preview-frame--compact"}`}
          >
            <iframe
              key={previewSrc}
              id="public-widget-iframe"
              className={`widget-obcine-iframe${isFull ? " widget-obcine-iframe--full" : " widget-obcine-iframe--compact"}`}
              src={previewSrc}
              title="Predogled widgeta"
              style={iframeStyle}
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
            value={embedCode}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm widget-copy-btn"
            id="public-widget-copy"
            onClick={() => void copyWidgetEmbedCode(embedCode)}
          >
            Kopiraj kodo
          </button>
        </div>
      </div>
    </section>
  );
}
