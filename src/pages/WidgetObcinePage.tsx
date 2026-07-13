import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStrelko } from "../context/StrelkoContext";
import { LockedContent } from "../components/LockedContent";
import { isPodpornikActive } from "../lib/portal-account";
import { STRELKO_OPEN_ACCESS } from "../lib/season";
import {
  copyWidgetEmbedCode,
  ensureWidgetResizeListener,
  NATIONAL_WIDGET_SCOPE,
  newWidgetEmbedFrameId,
  widgetEmbedConfigKey,
  widgetEmbedHtml,
  widgetPreviewPath,
} from "../lib/widget-obcine";

const DEFAULT_OB_MID = 11026516;
const COPY_CONFIRM_MS = 2000;

export function WidgetObcinePage() {
  const { widget, setWidget, loadWidgetObcine, loadWidgetSelection, credits } = useStrelko();
  const [copyConfirmed, setCopyConfirmed] = useState(false);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void loadWidgetObcine();
    void loadWidgetSelection(DEFAULT_OB_MID);
  }, [loadWidgetObcine, loadWidgetSelection]);

  useEffect(() => {
    ensureWidgetResizeListener();
  }, []);

  useEffect(() => {
    return () => {
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
    };
  }, []);

  const handleCopyEmbedCode = useCallback(async (code: string) => {
    const copied = await copyWidgetEmbedCode(code);
    if (!copied) return;

    if (copyResetRef.current) clearTimeout(copyResetRef.current);
    setCopyConfirmed(true);
    copyResetRef.current = setTimeout(() => {
      setCopyConfirmed(false);
      copyResetRef.current = null;
    }, COPY_CONFIRM_MS);
  }, []);

  const size = widget.publicWidgetPreviewSize;
  const isFull = size === "full";
  const selected =
    widget.publicWidgetScope === NATIONAL_WIDGET_SCOPE
      ? NATIONAL_WIDGET_SCOPE
      : String(widget.publicWidgetObMid || DEFAULT_OB_MID);
  const ready =
    widget.publicWidgetScope === NATIONAL_WIDGET_SCOPE || !!widget.publicWidgetObMid;
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
  const canEmbed = STRELKO_OPEN_ACCESS || isPodpornikActive(credits);

  return (
    <section className="widget-obcine-page page--standard">
      <div className="widget-obcine-head page-header">
        <h1>Widget udarov strel za spletne strani</h1>
        <p className="widget-obcine-lead">
          Informativni widget za vdelavo na spletno stran. Za izbrano občino ali celotno Slovenijo
          prikazuje število udarov strel v zadnjih 24 urah in zadnjih 30 dneh ter čas zadnje
          zaznane strele.
        </p>
      </div>
      <div className="widget-obcine-panel">
        <div className="widget-obcine-settings-bar search-card search-card--inline">
          <div className="search-card-body">
            <div className="widget-obcine-settings-row">
              <label className="widget-obcine-field search-option field-labeled" htmlFor="public-widget-obcina">
                <span>Občina</span>
                <select
                  id="public-widget-obcina"
                  value={selected}
                  disabled={!widget.publicWidgetObcine.length}
                  onChange={(e) => {
                    const value = e.target.value;
                    void loadWidgetSelection(
                      value === NATIONAL_WIDGET_SCOPE ? NATIONAL_WIDGET_SCOPE : Number(value)
                    );
                  }}
                >
                  <option value={NATIONAL_WIDGET_SCOPE}>SLOVENIJA</option>
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
              </label>
              <label className="widget-obcine-field search-option field-labeled" htmlFor="public-widget-theme">
                <span>Tema widgeta</span>
                <select
                  id="public-widget-theme"
                  value={widget.publicWidgetTheme}
                  onChange={(e) =>
                    setWidget({ publicWidgetTheme: e.target.value as "dark" | "light" })
                  }
                >
                  <option value="dark">Temna</option>
                  <option value="light">Svetla</option>
                </select>
              </label>
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
            />
          </div>
          <label className="widget-code-label" htmlFor={canEmbed ? "public-widget-embed-code" : undefined}>
            Embed koda
          </label>
          {canEmbed ? (
            <>
              <textarea
                id="public-widget-embed-code"
                className="widget-embed-code widget-obcine-embed-code"
                readOnly
                rows={4}
                value={embedCode}
              />
              <button
                type="button"
                className={`btn btn-ghost btn-sm widget-copy-btn${copyConfirmed ? " widget-copy-btn--copied" : ""}`}
                id="public-widget-copy"
                onClick={() => void handleCopyEmbedCode(embedCode)}
              >
                {copyConfirmed ? "Kopirano" : "Kopiraj kodo"}
              </button>
            </>
          ) : (
            <div className="locked-content-surface locked-content-surface--widget-embed">
              <LockedContent mode="supporter" inset />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
