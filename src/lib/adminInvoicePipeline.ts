/** Statusni koraki in obnovitvene akcije za admin račune. */

export type PipelineStepState = "ok" | "waiting" | "error";

export type InvoicePipelineStepId =
  | "payment"
  | "invoice"
  | "furs"
  | "pdf"
  | "email";

export interface InvoicePipelineStep {
  id: InvoicePipelineStepId;
  label: string;
  state: PipelineStepState;
  /** Kratek opis za uporabnika (brez tehničnih podrobnosti). */
  summary?: string;
  /** Tehnične podrobnosti (skrite v <details>). */
  technical?: string;
}

export interface InvoicePipelineSource {
  id?: number | null;
  invoice_number?: string | null;
  furs_status?: string | null;
  furs_error?: string | null;
  has_pdf?: boolean | null;
  email_sent_at?: string | null;
  buyer_email?: string | null;
  /** Za manjkajoča plačila v usklajevanju. */
  missing_invoice?: boolean;
}

export type InvoiceActionId =
  | "issue_missing"
  | "retry_furs"
  | "regenerate_pdf"
  | "resend_email"
  | "open_pdf";

export interface InvoiceActionAvailability {
  issue_missing: boolean;
  retry_furs: boolean;
  regenerate_pdf: boolean;
  resend_email: boolean;
  open_pdf: boolean;
}

const FURS_OK = new Set(["fiscalized"]);
const FURS_WAIT = new Set(["pending", "skipped"]);

function friendlyFursError(raw: string | null | undefined): string {
  if (!raw) return "Davčna potrditev ni uspela.";
  const lower = raw.toLowerCase();
  if (lower.includes("not configured") || lower.includes("disabled")) {
    return "FURS ni na voljo v tem okolju.";
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "FURS se ni odzval pravočasno.";
  }
  return "Davčna potrditev ni uspela.";
}

/** Zgradi zaporedje korakov za prikaz v admin tabeli / usklajevanju. */
export function buildInvoicePipeline(src: InvoicePipelineSource): InvoicePipelineStep[] {
  const missing = Boolean(src.missing_invoice) || !src.id;

  const payment: InvoicePipelineStep = {
    id: "payment",
    label: "Plačilo prejeto",
    state: "ok",
  };

  const invoice: InvoicePipelineStep = missing
    ? {
        id: "invoice",
        label: "Račun ustvarjen",
        state: "waiting",
        summary: "Lokalni račun še ne obstaja.",
      }
    : {
        id: "invoice",
        label: "Račun ustvarjen",
        state: "ok",
        summary: src.invoice_number || undefined,
      };

  let furs: InvoicePipelineStep;
  if (missing) {
    furs = { id: "furs", label: "FURS potrjen", state: "waiting" };
  } else if (FURS_OK.has(src.furs_status || "")) {
    furs = { id: "furs", label: "FURS potrjen", state: "ok" };
  } else if ((src.furs_status || "") === "failed") {
    furs = {
      id: "furs",
      label: "FURS potrjen",
      state: "error",
      summary: friendlyFursError(src.furs_error),
      technical: src.furs_error || undefined,
    };
  } else if (FURS_WAIT.has(src.furs_status || "")) {
    furs = {
      id: "furs",
      label: "FURS potrjen",
      state: "waiting",
      summary:
        src.furs_status === "skipped"
          ? "Davčna potrditev je bila preskočena."
          : "Čaka na davčno potrditev.",
    };
  } else {
    furs = {
      id: "furs",
      label: "FURS potrjen",
      state: "waiting",
      summary: "Stanje davčne potrditve ni znano.",
    };
  }

  let pdf: InvoicePipelineStep;
  if (missing) {
    pdf = { id: "pdf", label: "PDF izdelan", state: "waiting" };
  } else if (src.has_pdf) {
    pdf = { id: "pdf", label: "PDF izdelan", state: "ok" };
  } else {
    pdf = {
      id: "pdf",
      label: "PDF izdelan",
      state: "error",
      summary: "PDF manjka ali izdelava ni uspela.",
    };
  }

  let email: InvoicePipelineStep;
  if (missing) {
    email = { id: "email", label: "E-pošta poslana", state: "waiting" };
  } else if (src.email_sent_at) {
    email = { id: "email", label: "E-pošta poslana", state: "ok" };
  } else if (!src.buyer_email) {
    email = {
      id: "email",
      label: "E-pošta poslana",
      state: "error",
      summary: "Manjka e-pošta kupca.",
    };
  } else {
    email = {
      id: "email",
      label: "E-pošta poslana",
      state: "waiting",
      summary: "E-pošta še ni bila poslana.",
    };
  }

  return [payment, invoice, furs, pdf, email];
}

export function invoiceActionAvailability(src: InvoicePipelineSource): InvoiceActionAvailability {
  const missing = Boolean(src.missing_invoice) || !src.id;
  const hasInvoice = !missing && Boolean(src.id);
  const fursOk = FURS_OK.has(src.furs_status || "");
  const fursNeedsRetry =
    hasInvoice && !fursOk && (src.furs_status === "failed" || src.furs_status === "pending");

  return {
    issue_missing: missing,
    retry_furs: fursNeedsRetry,
    regenerate_pdf: hasInvoice && !src.has_pdf,
    // Ponovno pošlji, ko račun + PDF obstajata (tudi če je e-pošta že bila).
    resend_email: hasInvoice && Boolean(src.has_pdf) && Boolean(src.buyer_email),
    open_pdf: hasInvoice && Boolean(src.has_pdf),
  };
}

/** Ali naj sprememba e-poštnega osnutka sproži API (ne sme). */
export function invoiceEmailSearchShouldFetch(applied: string, draft: string): boolean {
  return applied === draft;
}

export const INVOICE_BUSY_LABELS: Record<InvoiceActionId, string> = {
  issue_missing: "Izdajam račun …",
  retry_furs: "Potrjujem pri FURS …",
  regenerate_pdf: "Izdelujem PDF …",
  resend_email: "Pošiljam račun …",
  open_pdf: "Odpiram PDF …",
};
