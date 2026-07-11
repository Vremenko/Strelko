import { Link } from "react-router-dom";
import { portalTabPath } from "../lib/auth-intent";
import { pdfDownloadDisabled } from "../lib/query-billing";

interface PdfDownloadPanelProps {
  pdfTokensCost: number;
  pdfButtonLabel: string;
  pdfCostHint?: string | null;
  creditsBalance: number | null;
  downloading: boolean;
  onDownload: () => void;
  compact?: boolean;
  errorMessage?: string | null;
}

export function PdfDownloadPanel({
  pdfTokensCost,
  pdfButtonLabel,
  pdfCostHint = null,
  creditsBalance,
  downloading,
  onDownload,
  compact = false,
  errorMessage = null,
}: PdfDownloadPanelProps) {
  const available = creditsBalance ?? 0;
  const disabled = downloading || pdfDownloadDisabled(pdfTokensCost, available);
  const showTokenLink = pdfTokensCost > 0 && available < pdfTokensCost;

  return (
    <div className={`pdf-download-panel${compact ? " pdf-download-panel--compact" : ""}`}>
      {pdfCostHint && (
        <p className="pdf-download-panel__hint" role="status">
          {pdfCostHint}
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
