import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client";
import { LockedContent } from "../components/LockedContent";
import { useStrelko } from "../context/StrelkoContext";
import { isPodpornikActive } from "../lib/portal-account";
import { STRELKO_OPEN_ACCESS } from "../lib/season";
import {
  copyTextToClipboard,
  ensureObcinaPreviewAssetPreloads,
  ensureWidgetResizeListener,
  fetchObcinaWidgetPreviewTokenSerialized,
  findMatchingObcinaWidget,
  isObcinaPreviewCachedMessage,
  NATIONAL_WIDGET_SCOPE,
  OBCINA_PREVIEW_UPDATE_TYPE,
  resolveVerifiedEmbedForWidget,
  type ObcinaWidgetPublic,
  widgetEmbedConfigKey,
  widgetPreviewBody,
  widgetPreviewDataKey,
  widgetPreviewTokenKey,
} from "../lib/widget-obcine";

const DEFAULT_OB_MID = 11026516;
const COPY_CONFIRM_MS = 2500;

type VerifiedEmbedState = {
  widget: ObcinaWidgetPublic;
  html: string;
  frameId: string;
  configKey: string;
};

export function WidgetObcinePage() {
  const { widget, setWidget, loadWidgetObcine, loadWidgetSelection, credits } = useStrelko();
  const [copyConfirmed, setCopyConfirmed] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [embedError, setEmbedError] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState("about:blank");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [verifiedEmbed, setVerifiedEmbed] = useState<VerifiedEmbedState | null>(null);
  const [embedPreparing, setEmbedPreparing] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewRequestRef = useRef(0);
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);
  const previewShellReadyRef = useRef(false);
  const previewCachedKeysRef = useRef(new Set<string>());
  const previewDataKeyRef = useRef("");
  const skipNextDisplaySyncRef = useRef(false);
  const widgetRef = useRef(widget);
  const sizeRef = useRef(widget.publicWidgetPreviewSize);
  widgetRef.current = widget;

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

  const size = widget.publicWidgetPreviewSize;
  const isFull = size === "full";
  sizeRef.current = size;

  useEffect(() => {
    if (size !== "full") return;
    return ensureObcinaPreviewAssetPreloads();
  }, [size]);
  const selected =
    widget.publicWidgetScope === NATIONAL_WIDGET_SCOPE
      ? NATIONAL_WIDGET_SCOPE
      : String(widget.publicWidgetObMid || DEFAULT_OB_MID);
  const ready =
    widget.publicWidgetScope === NATIONAL_WIDGET_SCOPE || !!widget.publicWidgetObMid;
  const canEmbed = STRELKO_OPEN_ACCESS || isPodpornikActive(credits);

  const embedConfigKey = widgetEmbedConfigKey(widget, size);
  const previewTheme = widget.publicWidgetTheme || "dark";
  const previewDataKey = useMemo(() => widgetPreviewDataKey(widget), [
    widget.publicWidgetScope,
    widget.publicWidgetObMid,
  ]);
  previewDataKeyRef.current = previewDataKey;

  const postPreviewUpdate = useCallback(
    (message: {
      token?: string;
      dataKey?: string;
      theme?: "dark" | "light";
      size?: "compact" | "full";
    }) => {
      const frame = previewIframeRef.current;
      if (
        !previewShellReadyRef.current ||
        !frame?.contentWindow ||
        !frame.src.includes("obcina-preview.html")
      ) {
        return false;
      }
      frame.contentWindow.postMessage(
        { type: OBCINA_PREVIEW_UPDATE_TYPE, ...message },
        window.location.origin
      );
      return true;
    },
    []
  );

  const embedDisplayedForCurrentConfig =
    !!verifiedEmbed && verifiedEmbed.configKey === embedConfigKey;

  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin) return;
      if (!isObcinaPreviewCachedMessage(ev.data)) return;
      previewCachedKeysRef.current.add(ev.data.dataKey);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!canEmbed) {
      setVerifiedEmbed(null);
      setEmbedError(null);
      setCopyConfirmed(false);
      return;
    }

    setVerifiedEmbed((prev) => (prev && prev.configKey === embedConfigKey ? prev : null));
    setEmbedError(null);
    setCopyError(null);
    setCopyConfirmed(false);
  }, [canEmbed, embedConfigKey]);

  /** Podatki: nova občina / SI — en API klic; ponovna ista → predpomnilnik. */
  useEffect(() => {
    if (!ready) {
      previewShellReadyRef.current = false;
      previewCachedKeysRef.current.clear();
      setPreviewSrc("about:blank");
      setPreviewError(null);
      setPreviewLoading(false);
      return;
    }

    const requestId = ++previewRequestRef.current;
    let cancelled = false;
    const dataKey = previewDataKey;
    const themeNow = (widgetRef.current.publicWidgetTheme || "dark") as "dark" | "light";
    const sizeNow = sizeRef.current;
    const body = widgetPreviewBody(widgetRef.current, sizeNow);
    const tokenKey = widgetPreviewTokenKey(body);

    const run = async () => {
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        if (previewCachedKeysRef.current.has(dataKey)) {
          skipNextDisplaySyncRef.current = true;
          const ok = postPreviewUpdate({
            dataKey,
            theme: themeNow,
            size: sizeNow,
          });
          if (ok) return;
        }

        const tokenOut = await fetchObcinaWidgetPreviewTokenSerialized(
          () => api.obcinaWidgetPreviewToken(body),
          tokenKey
        );
        if (cancelled || previewRequestRef.current !== requestId) return;

        skipNextDisplaySyncRef.current = true;
        const updated = postPreviewUpdate({
          token: tokenOut.token,
          dataKey,
          theme: themeNow,
          size: sizeNow,
        });
        if (!updated) {
          previewShellReadyRef.current = false;
          setPreviewSrc(tokenOut.preview_path);
        }
      } catch {
        if (cancelled || previewRequestRef.current !== requestId) return;
        previewShellReadyRef.current = false;
        setPreviewSrc("about:blank");
        setPreviewError("Predogleda trenutno ni mogoče naložiti. Poskusite znova.");
      } finally {
        if (!cancelled && previewRequestRef.current === requestId) {
          setPreviewLoading(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [ready, previewDataKey, postPreviewUpdate]);

  /** Tema / velikost: samo lokalni prikaz, brez token/data API. */
  useEffect(() => {
    if (!ready || !previewShellReadyRef.current) return;
    if (skipNextDisplaySyncRef.current) {
      skipNextDisplaySyncRef.current = false;
      return;
    }
    if (!previewCachedKeysRef.current.has(previewDataKeyRef.current)) return;
    postPreviewUpdate({ theme: previewTheme, size });
  }, [ready, previewTheme, size, postPreviewUpdate]);

  const handleCopyEmbedCode = useCallback(async () => {
    if (!ready || !canEmbed || embedPreparing) return;
    setEmbedPreparing(true);
    setEmbedError(null);
    setCopyError(null);
    setCopyConfirmed(false);

    try {
      const list = await api.listObcinaWidgets();
      let row = findMatchingObcinaWidget(list.widgets, widget, size);
      const desiredTheme = widget.publicWidgetTheme || "dark";

      if (row) {
        if ((row.theme || "dark") !== desiredTheme) {
          row = await api.patchObcinaWidget(row.public_key, { theme: desiredTheme });
        }
      } else {
        row = await api.createObcinaWidget(widgetPreviewBody(widget, size));
      }

      const resolved = await resolveVerifiedEmbedForWidget(
        row,
        embedConfigKey,
        (publicKey) => api.verifyObcinaWidgetPublic(publicKey)
      );
      if (!resolved) {
        setVerifiedEmbed(null);
        setEmbedError("Embed kode ni bilo mogoče pripraviti. Poskusite znova.");
        return;
      }

      try {
        await copyTextToClipboard(resolved.html);
      } catch {
        setVerifiedEmbed(null);
        setCopyError("Kopiranje ni uspelo. Dovolite dostop do odložišča ali poskusite znova.");
        return;
      }

      setVerifiedEmbed(resolved);
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
      setCopyConfirmed(true);
      copyResetRef.current = setTimeout(() => {
        setCopyConfirmed(false);
        copyResetRef.current = null;
      }, COPY_CONFIRM_MS);
    } catch {
      setVerifiedEmbed(null);
      setEmbedError("Embed kode ni bilo mogoče pripraviti. Poskusite znova.");
    } finally {
      setEmbedPreparing(false);
    }
  }, [ready, canEmbed, embedPreparing, widget, size, embedConfigKey]);

  const textareaValue = useMemo(() => {
    if (!ready) return "Izberite občino …";
    if (embedPreparing) return "Pripravljam …";
    if (embedDisplayedForCurrentConfig && verifiedEmbed) return verifiedEmbed.html;
    return "Kliknite »Kopiraj kodo«.";
  }, [ready, embedPreparing, embedDisplayedForCurrentConfig, verifiedEmbed]);

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
              ref={previewIframeRef}
              id="public-widget-iframe"
              className={`widget-obcine-iframe${isFull ? " widget-obcine-iframe--full" : " widget-obcine-iframe--compact"}`}
              src={previewSrc}
              title="Predogled widgeta"
              aria-busy={previewLoading}
              onLoad={() => {
                const src = previewIframeRef.current?.src || "";
                previewShellReadyRef.current = src.includes("obcina-preview.html");
              }}
            />
          </div>
          {previewError ? (
            <p className="widget-obcine-embed-error" role="alert">
              {previewError}
            </p>
          ) : null}
          <label className="widget-code-label" htmlFor={canEmbed ? "public-widget-embed-code" : undefined}>
            Embed koda
          </label>
          {canEmbed ? (
            <>
              {embedError ? (
                <p className="widget-obcine-embed-error" role="alert">
                  {embedError}
                </p>
              ) : null}
              <textarea
                id="public-widget-embed-code"
                className="widget-embed-code widget-obcine-embed-code"
                readOnly
                spellCheck={false}
                autoComplete="off"
                rows={4}
                value={textareaValue}
              />
              <div className="widget-obcine-embed-actions">
                <button
                  type="button"
                  className={`btn btn-ghost btn-sm widget-copy-btn${copyConfirmed ? " widget-copy-btn--copied" : ""}`}
                  id="public-widget-copy"
                  disabled={!ready || embedPreparing}
                  onClick={() => void handleCopyEmbedCode()}
                >
                  {embedPreparing ? "Pripravljam …" : copyConfirmed ? "Koda kopirana" : "Kopiraj kodo"}
                </button>
              </div>
              {copyError ? (
                <p className="widget-obcine-embed-error" role="alert">
                  {copyError}
                </p>
              ) : null}
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
