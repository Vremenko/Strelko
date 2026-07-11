import { Link } from "react-router-dom";
import { portalTabPath } from "../lib/auth-intent";
import { pdfCostHintMessage, pdfDownloadDisabled } from "../lib/query-billing";

interface PdfDownloadPanelProps {
  pdfTokensCost: number;
  pdfButtonLabel: string;
  creditsBalance: number | null;
  downloading: boolean;
  onDownload: () => void;
  compact?: boolean;
  errorMessage?: string | null;
}

export function PdfDownloadPanel({
  pdfTokensCost,
  pdfButtonLabel,
  creditsBalance,
  downloading,
  onDownload,
  compact = false,
  errorMessage = null,
}: PdfDownloadPanelProps) {
  const available = creditsBalance ?? 0;
  const hint = pdfCostHintMessage(pdfTokensCost, available);
  const disabled = downloading || pdfDownloadDisabled(pdfTokensCost, available);
  const showTokenLink = pdfTokensCost > 0 && available < pdfTokensCost;

  return (
    <div className={`pdf-download-panel${compact ? " pdf-download-panel--compact" : ""}`}>
      {hint && (
        <p className="pdf-download-panel__hint" role="status">
          {hint}
          {showTokenLink && (
            <>
              {" "}
              <Link to={portalTabPath("narocnina")} className="pdf-download-panel__link">
                Pridobite žetone
              </Link>
            </>
          )}
        </p>
      )}
      {errorMessage && (
        <p className="pdf-download-panel__error" role="alert">
          {errorMessage}{" "}
          <Link to={portalTabPath("narocnina")} className="pdf-download-panel__link">
            Pridobite žetone
          </Link>
        </p>
      )}
      <button
        type="button"
        className={`btn ${compact ? "btn-ghost btn-sm" : "btn-primary"}${downloading ? " btn-primary--loading" : ""}`}
        onClick={onDownload}
        disabled={disabled}
        aria-busy={downloading}
      >
        {downloading ? "Pripravljam PDF …" : pdfButtonLabel}
      </button>
    </div>
  );

}
