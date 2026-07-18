import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { adminApi } from "../api/client";
import { AdminPager } from "../components/admin/AdminPager";
import { AdminSmsManualSend } from "../components/admin/AdminSmsManualSend";
import { AdminUsersSection } from "../components/admin/AdminUsersSection";
import { AdminSmsSubscriberForm, type AdminSmsSubscriberFormData } from "../components/admin/AdminSmsSubscriberForm";
import { RequireAdmin } from "../components/RequireAdmin";
import {
  buildInvoicePipeline,
  INVOICE_BUSY_LABELS,
  invoiceActionAvailability,
  type InvoiceActionId,
  type InvoicePipelineStep,
} from "../lib/adminInvoicePipeline";
import type {
  AdminStrelkoInvoice,
  AdminStrelkoReconcileResult,
  AdminStrelkoSmsNotification,
  AdminStrelkoSmsSubscriber,
  AdminStrelkoSmsSummary,
  AdminStrelkoSummary,
} from "../types";

const INVOICES_PAGE_SIZE = 10;
const SMS_SUBS_PAGE_SIZE = 25;
const SMS_NOTES_PAGE_SIZE = 25;
const RECONCILE_LIST_PAGE_SIZE = 20;

type AdminTabId = "pregled" | "racuni" | "usklajevanje" | "uporabniki" | "sms";

const ADMIN_TABS: { id: AdminTabId; label: string }[] = [
  { id: "pregled", label: "Pregled" },
  { id: "racuni", label: "Računi" },
  { id: "sms", label: "SMS opozorila" },
  { id: "usklajevanje", label: "Usklajevanje" },
  { id: "uporabniki", label: "Uporabniki" },
];

function parseAdminTab(raw: string | null): AdminTabId {
  if (raw && ADMIN_TABS.some((t) => t.id === raw)) return raw as AdminTabId;
  return "pregled";
}

function formatEur(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

function formatDt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("sl-SI");
}

function fursStatusLabel(status: string): string {
  switch (status) {
    case "fiscalized":
      return "Fiskalizirano";
    case "failed":
      return "Napaka";
    case "pending":
      return "V obdelavi";
    case "skipped":
      return "Preskočeno";
    default:
      return status;
  }
}

function InvoicePipelineView({ steps }: { steps: InvoicePipelineStep[] }) {
  return (
    <ol className="admin-pipeline" aria-label="Status računa">
      {steps.map((step) => (
        <li key={step.id} className={`admin-pipeline__step admin-pipeline__step--${step.state}`}>
          <span className="admin-pipeline__label">{step.label}</span>
          <span className="admin-pipeline__state">
            {step.state === "ok" ? "uspešno" : step.state === "error" ? "napaka" : "čaka"}
          </span>
          {step.summary ? <span className="admin-pipeline__summary">{step.summary}</span> : null}
          {step.technical ? (
            <details className="admin-pipeline__tech">
              <summary>Tehnične podrobnosti</summary>
              <pre>{step.technical}</pre>
            </details>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function AdminTabs({ active, onChange }: { active: AdminTabId; onChange: (t: AdminTabId) => void }) {
  return (
    <nav className="portal-tabs admin-tabs" aria-label="Strelko admin">
      <div className="portal-tabs__scroll">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`portal-tab${active === tab.id ? " is-active" : ""}`}
            aria-current={active === tab.id ? "page" : undefined}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function SummarySection() {
  const [summary, setSummary] = useState<AdminStrelkoSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminApi.summary();
        if (!cancelled) setSummary(data);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="admin-panel__error" role="alert">{error}</p>;
  if (!summary) return <p className="admin-panel__muted">Nalagam …</p>;

  return (
    <section className="portal-section admin-panel">
      <h2 className="portal-section__title">Pregled</h2>
      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat__label">Skupaj računov</span>
          <strong className="admin-stat__value">{summary.invoice_total}</strong>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__label">Fiskalizirano</span>
          <strong className="admin-stat__value">{summary.invoice_fiscalized}</strong>
        </div>
        <div className="admin-stat admin-stat--warn">
          <span className="admin-stat__label">FURS napake</span>
          <strong className="admin-stat__value">{summary.invoice_failed}</strong>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__label">V obdelavi</span>
          <strong className="admin-stat__value">{summary.invoice_pending}</strong>
        </div>
      </div>
      <p className="admin-panel__muted">
        FURS: {summary.furs_enabled ? "omogočen" : "onemogočen (test/dev)"}
      </p>
    </section>
  );
}

function InvoicesSection() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = (searchParams.get("email") || "").trim();
  const [items, setItems] = useState<AdminStrelkoInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [emailDraft, setEmailDraft] = useState(emailFromUrl);
  const [appliedEmail, setAppliedEmail] = useState(emailFromUrl);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [busyAction, setBusyAction] = useState<InvoiceActionId | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const next = (searchParams.get("email") || "").trim();
    setEmailDraft(next);
    setAppliedEmail(next);
    setPage(1);
  }, [searchParams]);

  const totalPages = total > 0 ? Math.ceil(total / INVOICES_PAGE_SIZE) : 0;

  const loadInvoices = useCallback(
    async (nextPage: number) => {
      setLoading(true);
      setError(null);
      try {
        const requested = Math.max(1, nextPage);
        const res = await adminApi.listInvoices({
          furs_status: statusFilter || undefined,
          email: appliedEmail.trim() || undefined,
          limit: INVOICES_PAGE_SIZE,
          offset: (requested - 1) * INVOICES_PAGE_SIZE,
        });
        const pages = res.total > 0 ? Math.ceil(res.total / INVOICES_PAGE_SIZE) : 0;
        if (res.items.length === 0 && requested > 1 && pages >= 1) {
          const fallbackPage = Math.min(requested - 1, pages);
          const retry = await adminApi.listInvoices({
            furs_status: statusFilter || undefined,
            email: appliedEmail.trim() || undefined,
            limit: INVOICES_PAGE_SIZE,
            offset: (fallbackPage - 1) * INVOICES_PAGE_SIZE,
          });
          setItems(retry.items);
          setTotal(retry.total);
          setPage(fallbackPage);
          return;
        }
        setItems(res.items);
        setTotal(res.total);
        setPage(requested);
      } catch (e) {
        setError((e as Error).message);
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, appliedEmail]
  );

  useEffect(() => {
    void loadInvoices(1);
  }, [loadInvoices]);

  function searchByEmail() {
    setPage(1);
    setAppliedEmail(emailDraft.trim());
  }

  function resetEmailFilter() {
    setEmailDraft("");
    setPage(1);
    setAppliedEmail("");
  }

  async function goToPage(nextPage: number) {
    if (nextPage < 1 || (totalPages > 0 && nextPage > totalPages) || nextPage === page) return;
    await loadInvoices(nextPage);
  }

  async function runRowAction(
    id: number,
    action: InvoiceActionId,
    fn: () => Promise<void>,
    refresh = true
  ) {
    setBusyId(id);
    setBusyAction(action);
    setMessage(null);
    try {
      await fn();
      if (refresh) await loadInvoices(page);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  }

  async function openPdf(id: number) {
    await runRowAction(
      id,
      "open_pdf",
      async () => {
        const blob = await adminApi.downloadInvoicePdf(id);
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank", "noopener,noreferrer");
        window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
      },
      false
    );
  }

  async function retryFurs(id: number) {
    await runRowAction(id, "retry_furs", async () => {
      const res = await adminApi.retryFurs(id);
      setMessage(res.message || "FURS ponovno poslan.");
    });
  }

  async function regeneratePdf(id: number) {
    await runRowAction(id, "regenerate_pdf", async () => {
      const res = await adminApi.regeneratePdf(id);
      setMessage(res.message || "PDF ponovno izdelan.");
    });
  }

  async function resendEmail(id: number) {
    await runRowAction(id, "resend_email", async () => {
      const res = await adminApi.resendEmail(id);
      setMessage(res.message || "E-pošta poslana.");
    });
  }

  const pageNumbers = (() => {
    if (totalPages <= 0) return [] as number[];
    const windowSize = 5;
    let start = Math.max(1, page - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    const nums: number[] = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  })();

  return (
    <section className="portal-section admin-panel">
      <h2 className="portal-section__title">Računi ({total})</h2>
      <div className="admin-filters">
        <label>
          FURS status
          <select
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="">Vsi</option>
            <option value="fiscalized">Fiskalizirano</option>
            <option value="failed">Napaka</option>
            <option value="pending">V obdelavi</option>
            <option value="skipped">Preskočeno</option>
          </select>
        </label>
        <label>
          E-pošta
          <input
            type="search"
            value={emailDraft}
            onChange={(e) => setEmailDraft(e.target.value)}
            placeholder="del e-pošte …"
            onKeyDown={(e) => {
              if (e.key === "Enter") searchByEmail();
            }}
          />
        </label>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => searchByEmail()}>
          Išči
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => resetEmailFilter()}
          disabled={!emailDraft && !appliedEmail}
        >
          Ponastavi filter
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => void loadInvoices(page)}
        >
          Osveži
        </button>
      </div>
      {message ? <p className="admin-panel__message" role="status">{message}</p> : null}
      {error ? <p className="admin-panel__error" role="alert">{error}</p> : null}
      {loading ? (
        <p className="admin-panel__muted">Nalagam …</p>
      ) : items.length === 0 ? (
        <p className="admin-panel__muted">Ni zadetkov.</p>
      ) : (
        <>
          {totalPages > 1 ? (
            <p className="admin-panel__muted admin-users-count">
              Stran {page}/{totalPages}
            </p>
          ) : null}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Številka</th>
                  <th>Datum</th>
                  <th>Uporabnik</th>
                  <th>Znesek</th>
                  <th>Status</th>
                  <th>Akcije</th>
                </tr>
              </thead>
              <tbody>
                {items.map((inv) => {
                  const pipeline = buildInvoicePipeline({
                    id: inv.id,
                    invoice_number: inv.invoice_number,
                    furs_status: inv.furs_status,
                    furs_error: inv.furs_error,
                    has_pdf: inv.has_pdf,
                    email_sent_at: inv.email_sent_at,
                    buyer_email: inv.buyer_email,
                  });
                  const actions = invoiceActionAvailability({
                    id: inv.id,
                    furs_status: inv.furs_status,
                    has_pdf: inv.has_pdf,
                    email_sent_at: inv.email_sent_at,
                    buyer_email: inv.buyer_email,
                  });
                  const rowBusy = busyId === inv.id;
                  return (
                    <tr key={inv.id}>
                      <td>
                        <strong>{inv.invoice_number}</strong>
                        <div className="admin-table__sub">{inv.description_sl}</div>
                      </td>
                      <td>{formatDt(inv.issued_at)}</td>
                      <td>
                        {inv.user_email || `#${inv.user_id}`}
                        {inv.buyer_email && inv.buyer_email !== inv.user_email ? (
                          <div className="admin-table__sub">{inv.buyer_email}</div>
                        ) : null}
                      </td>
                      <td>{formatEur(inv.gross_cents)}</td>
                      <td>
                        <InvoicePipelineView steps={pipeline} />
                        <span className={`admin-badge admin-badge--${inv.furs_status}`}>
                          {fursStatusLabel(inv.furs_status)}
                        </span>
                      </td>
                      <td className="admin-table__actions">
                        {rowBusy && busyAction ? (
                          <span className="admin-panel__muted">{INVOICE_BUSY_LABELS[busyAction]}</span>
                        ) : null}
                        {actions.open_pdf ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={rowBusy}
                            onClick={() => void openPdf(inv.id)}
                          >
                            Odpri PDF
                          </button>
                        ) : null}
                        {actions.retry_furs ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={rowBusy}
                            onClick={() => void retryFurs(inv.id)}
                          >
                            Ponovi FURS potrditev
                          </button>
                        ) : null}
                        {actions.regenerate_pdf ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={rowBusy}
                            onClick={() => void regeneratePdf(inv.id)}
                          >
                            Ponovno izdelaj PDF
                          </button>
                        ) : null}
                        {actions.resend_email ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={rowBusy}
                            onClick={() => void resendEmail(inv.id)}
                          >
                            Ponovno pošlji račun
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 ? (
            <nav className="admin-pagination" aria-label="Strani računov">
              <button
                type="button"
                className="btn"
                disabled={loading || page <= 1}
                onClick={() => void goToPage(page - 1)}
              >
                Nazaj
              </button>
              <div className="admin-pagination__pages">
                {pageNumbers.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`btn admin-pagination__num${n === page ? " is-active" : ""}`}
                    disabled={loading || n === page}
                    onClick={() => void goToPage(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn"
                disabled={loading || page >= totalPages}
                onClick={() => void goToPage(page + 1)}
              >
                Naprej
              </button>
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}

function ReconcileSection() {
  const [lookbackDays, setLookbackDays] = useState(2);
  const [autoIssue, setAutoIssue] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [result, setResult] = useState<AdminStrelkoReconcileResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issueRefType, setIssueRefType] = useState("checkout_session");
  const [issueRefId, setIssueRefId] = useState("");
  const [issueMessage, setIssueMessage] = useState<string | null>(null);
  const [issueBusy, setIssueBusy] = useState(false);
  const [rowBusyKey, setRowBusyKey] = useState<string | null>(null);
  const [missingPage, setMissingPage] = useState(1);
  const [failedPage, setFailedPage] = useState(1);

  async function refreshReconcile() {
    setLoading(true);
    setError(null);
    try {
      // Osvežitev seznama brez samodejne izdaje / e-pošte.
      const data = await adminApi.reconcile({
        lookback_days: lookbackDays,
        auto_issue: false,
        send_email: false,
      });
      setResult(data);
      setMissingPage(1);
      setFailedPage(1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function runReconcile() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.reconcile({
        lookback_days: lookbackDays,
        auto_issue: autoIssue,
        send_email: sendEmail,
      });
      setResult(data);
      setMissingPage(1);
      setFailedPage(1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function issueMissing(refType: string, refId: string, confirmLabel?: string) {
    if (!refId.trim()) return;
    const ok = window.confirm(
      confirmLabel ||
        `Izdali boste manjkajoči račun za ${refType === "stripe_invoice" ? "Stripe invoice" : "checkout"} ${refId.trim()}. Želite nadaljevati?`
    );
    if (!ok) return;
    setIssueBusy(true);
    setRowBusyKey(`${refType}:${refId}`);
    setIssueMessage(null);
    try {
      const res = await adminApi.issueMissing(refType, refId.trim());
      setIssueMessage(res.message || `Račun ${res.invoice_number || ""}`.trim());
      await refreshReconcile();
    } catch (e) {
      setIssueMessage((e as Error).message);
    } finally {
      setIssueBusy(false);
      setRowBusyKey(null);
    }
  }

  async function retryFailedFurs(invoiceId: number, invoiceNumber: string) {
    setRowBusyKey(`furs:${invoiceId}`);
    setIssueMessage(null);
    try {
      const res = await adminApi.retryFurs(invoiceId);
      setIssueMessage(res.message || `FURS za ${invoiceNumber} posodobljen.`);
      await refreshReconcile();
    } catch (e) {
      setIssueMessage((e as Error).message);
    } finally {
      setRowBusyKey(null);
    }
  }

  return (
    <section className="portal-section admin-panel">
      <h2 className="portal-section__title">Usklajevanje Stripe ↔ računi</h2>
      <div className="admin-filters admin-filters--stack">
        <label>
          Lookback (dni)
          <input
            type="number"
            min={1}
            max={30}
            value={lookbackDays}
            onChange={(e) => setLookbackDays(Number(e.target.value) || 2)}
          />
        </label>
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={autoIssue}
            onChange={(e) => setAutoIssue(e.target.checked)}
          />
          Samodejno izdaj manjkajoče račune
        </label>
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
          />
          Pošlji dnevno poročilo (e-pošta)
        </label>
        <button
          type="button"
          className="btn btn-primary"
          disabled={loading}
          onClick={() => void runReconcile()}
        >
          {loading ? "Teče …" : "Zaženi usklajevanje"}
        </button>
      </div>
      {error ? <p className="admin-panel__error" role="alert">{error}</p> : null}
      {issueMessage ? <p className="admin-panel__message" role="status">{issueMessage}</p> : null}
      {result ? (
        <div className="admin-reconcile-result">
          <p>
            Stripe plačil: <strong>{result.stripe_paid_count}</strong> · Lokalnih računov:{" "}
            <strong>{result.invoice_count}</strong> · Manjkajočih:{" "}
            <strong>{result.missing_count}</strong> · FURS napak:{" "}
            <strong>{result.failed_count}</strong>
            {result.issued_count > 0 ? (
              <>
                {" "}
                · Izdano: <strong>{result.issued_count}</strong>
              </>
            ) : null}
          </p>
          {result.missing.length > 0 ? (
            <>
              <h3>
                Plačila brez računa ({result.missing_count ?? result.missing.length})
              </h3>
              <ul className="admin-list">
                {result.missing
                  .slice(
                    (missingPage - 1) * RECONCILE_LIST_PAGE_SIZE,
                    missingPage * RECONCILE_LIST_PAGE_SIZE
                  )
                  .map((row) => {
                  const refType = String(row.ref_type || "");
                  const refId = String(row.ref_id || "");
                  const key = `${refType}:${refId}`;
                  const pipeline = buildInvoicePipeline({ missing_invoice: true });
                  const busy = rowBusyKey === key;
                  return (
                    <li key={key} className="admin-list__card">
                      <div>
                        {String(row.description)} — {String(row.amount_eur)} ({refId})
                      </div>
                      <InvoicePipelineView steps={pipeline} />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={busy || issueBusy}
                        onClick={() => void issueMissing(refType, refId)}
                      >
                        {busy ? INVOICE_BUSY_LABELS.issue_missing : "Izdaj manjkajoči račun"}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <AdminPager
                page={missingPage}
                totalPages={Math.max(
                  1,
                  Math.ceil(result.missing.length / RECONCILE_LIST_PAGE_SIZE)
                )}
                total={result.missing.length}
                pageSize={RECONCILE_LIST_PAGE_SIZE}
                loading={loading}
                label="Strani manjkajočih plačil"
                onPage={setMissingPage}
              />
            </>
          ) : null}
          {result.failed.length > 0 ? (
            <>
              <h3>FURS napake ({result.failed_count ?? result.failed.length})</h3>
              <ul className="admin-list">
                {result.failed
                  .slice(
                    (failedPage - 1) * RECONCILE_LIST_PAGE_SIZE,
                    failedPage * RECONCILE_LIST_PAGE_SIZE
                  )
                  .map((row) => {
                  const invoiceNumber = String(row.invoice_number || "");
                  const invoiceId = Number(row.invoice_id || 0);
                  const pipeline = buildInvoicePipeline({
                    id: invoiceId || 1,
                    invoice_number: invoiceNumber,
                    furs_status: "failed",
                    furs_error: String(row.furs_error || ""),
                    has_pdf: Boolean(row.has_pdf),
                    email_sent_at: row.email_sent_at ? String(row.email_sent_at) : null,
                    buyer_email: row.buyer_email ? String(row.buyer_email) : null,
                  });
                  const busy = rowBusyKey === `furs:${invoiceId}`;
                  return (
                    <li key={invoiceNumber} className="admin-list__card">
                      <div>
                        {invoiceNumber} — {String(row.furs_error || "")}
                      </div>
                      <InvoicePipelineView steps={pipeline} />
                      {invoiceId > 0 ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={busy}
                          onClick={() => void retryFailedFurs(invoiceId, invoiceNumber)}
                        >
                          {busy ? INVOICE_BUSY_LABELS.retry_furs : "Ponovi FURS potrditev"}
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              <AdminPager
                page={failedPage}
                totalPages={Math.max(
                  1,
                  Math.ceil(result.failed.length / RECONCILE_LIST_PAGE_SIZE)
                )}
                total={result.failed.length}
                pageSize={RECONCILE_LIST_PAGE_SIZE}
                loading={loading}
                label="Strani FURS napak"
                onPage={setFailedPage}
              />
            </>
          ) : null}
        </div>
      ) : null}

      <hr className="admin-divider" />
      <h3>Ročna izdaja računa</h3>
      <div className="admin-filters">
        <label>
          Tip
          <select value={issueRefType} onChange={(e) => setIssueRefType(e.target.value)}>
            <option value="checkout_session">Checkout session</option>
            <option value="stripe_invoice">Stripe invoice</option>
          </select>
        </label>
        <label>
          ID
          <input
            type="text"
            value={issueRefId}
            onChange={(e) => setIssueRefId(e.target.value)}
            placeholder="cs_… ali in_…"
          />
        </label>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={issueBusy || !issueRefId.trim()}
          onClick={() => void issueMissing(issueRefType, issueRefId)}
        >
          {issueBusy ? INVOICE_BUSY_LABELS.issue_missing : "Izdaj manjkajoči račun"}
        </button>
      </div>
    </section>
  );
}

function UsersSection() {
  return <AdminUsersSection />;
}

function SmsSection() {
  const [summary, setSummary] = useState<AdminStrelkoSmsSummary | null>(null);
  const [subscribers, setSubscribers] = useState<AdminStrelkoSmsSubscriber[]>([]);
  const [subsTotal, setSubsTotal] = useState(0);
  const [subsPage, setSubsPage] = useState(1);
  const [sendSubscribers, setSendSubscribers] = useState<AdminStrelkoSmsSubscriber[]>([]);
  const [notifications, setNotifications] = useState<AdminStrelkoSmsNotification[]>([]);
  const [notesTotal, setNotesTotal] = useState(0);
  const [notesPage, setNotesPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const subsTotalPages = subsTotal > 0 ? Math.ceil(subsTotal / SMS_SUBS_PAGE_SIZE) : 0;
  const notesTotalPages = notesTotal > 0 ? Math.ceil(notesTotal / SMS_NOTES_PAGE_SIZE) : 0;

  const loadSummaryAndSendList = useCallback(async () => {
    const [s, sendList] = await Promise.all([
      adminApi.smsSummary(),
      adminApi.smsSubscribers({ limit: 200, offset: 0 }),
    ]);
    setSummary(s);
    setSendSubscribers(sendList.items);
  }, []);

  const loadSubscribersPage = useCallback(async (page: number) => {
    setListLoading(true);
    try {
      const res = await adminApi.smsSubscribers({
        limit: SMS_SUBS_PAGE_SIZE,
        offset: (page - 1) * SMS_SUBS_PAGE_SIZE,
      });
      setSubscribers(res.items);
      setSubsTotal(res.total);
      setSubsPage(page);
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadNotificationsPage = useCallback(async (page: number) => {
    setListLoading(true);
    try {
      const res = await adminApi.smsNotifications({
        limit: SMS_NOTES_PAGE_SIZE,
        offset: (page - 1) * SMS_NOTES_PAGE_SIZE,
      });
      setNotifications(res.items);
      setNotesTotal(res.total);
      setNotesPage(page);
    } finally {
      setListLoading(false);
    }
  }, []);

  const reloadAll = useCallback(async () => {
    await loadSummaryAndSendList();
    await Promise.all([loadSubscribersPage(subsPage), loadNotificationsPage(notesPage)]);
  }, [loadSummaryAndSendList, loadSubscribersPage, loadNotificationsPage, subsPage, notesPage]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadSummaryAndSendList();
        if (cancelled) return;
        await Promise.all([loadSubscribersPage(1), loadNotificationsPage(1)]);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadSummaryAndSendList, loadSubscribersPage, loadNotificationsPage]);

  const onAddSubscriber = async (data: AdminSmsSubscriberFormData) => {
    setError(null);
    setActionMsg(null);
    setBusy(true);
    try {
      const res = await adminApi.upsertSmsSubscriber(data);
      setActionMsg(res.message);
      await reloadAll();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const onSendManualSms = async (userId: number, scenarioId: string) => {
    setError(null);
    setActionMsg(null);
    setBusy(true);
    try {
      const res = await adminApi.sendSms({ user_id: userId, scenario_id: scenarioId });
      if (!res.ok) {
        setError(res.error_message || "Pošiljanje ni uspelo.");
        return;
      }
      setActionMsg(
        `${res.message} (${res.gsm_length} znakov, ${res.sms_credits_estimate} kredit, ročno)`
      );
      await reloadAll();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const onRemoveSubscriber = async (userId: number, email: string) => {
    if (!window.confirm(`Odstranim SMS naročnika ${email}?`)) return;
    setError(null);
    setActionMsg(null);
    setBusy(true);
    try {
      const res = await adminApi.removeSmsSubscriber(userId);
      setActionMsg(res.message);
      await reloadAll();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (error && !summary) return <p className="admin-panel__error" role="alert">{error}</p>;
  if (!summary) return <p className="admin-panel__muted">Nalagam …</p>;

  return (
    <section className="portal-section admin-panel">
      <h2 className="portal-section__title">SMS opozorila (strele v bližini)</h2>
      {error ? <p className="admin-panel__error" role="alert">{error}</p> : null}
      {actionMsg ? <p className="admin-panel__success">{actionMsg}</p> : null}
      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat__label">Ponudnik</span>
          <strong className="admin-stat__value">
            {summary.sms_provider_configured
              ? (summary.sms_provider || "SMS").toUpperCase()
              : "Dry-run"}
          </strong>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__label">Krediti</span>
          <strong className="admin-stat__value">
            {summary.sms_credits_available != null
              ? summary.sms_credits_available
              : summary.sms_credits_has_balance === true
                ? "Na voljo"
                : summary.sms_credits_has_balance === false
                  ? "Ni"
                  : "—"}
          </strong>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__label">Aktivni naročniki</span>
          <strong className="admin-stat__value">{summary.subscribers_active}</strong>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__label">SMS ta mesec</span>
          <strong className="admin-stat__value">{summary.sent_this_month}</strong>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__label">Skupaj poslanih</span>
          <strong className="admin-stat__value">{summary.sent_total ?? 0}</strong>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__label">Avtomatsko (strele)</span>
          <strong className="admin-stat__value">
            {summary.sent_strike_this_month} / {summary.sent_strike_auto_total ?? 0}
          </strong>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__label">Ročno (admin)</span>
          <strong className="admin-stat__value">
            {summary.sent_manual_this_month ?? 0} / {summary.sent_manual_total ?? 0}
          </strong>
        </div>
        <div className="admin-stat">
          <span className="admin-stat__label">MeteoAlarm</span>
          <strong className="admin-stat__value">{summary.sent_meteoalarm_this_month}</strong>
        </div>
      </div>
      {summary.sms_credits_note ? (
        <p className="admin-panel__muted">{summary.sms_credits_note}</p>
      ) : null}
      <p className="admin-panel__muted">
        Anti-spam: največ {summary.max_per_day ?? 1} SMS na lokacijo na dan (pregled zadnjih{" "}
        {summary.lookback_minutes} min).
      </p>

      <h3 className="portal-section__subtitle">Ročno testno pošiljanje</h3>
      <AdminSmsManualSend
        busy={busy}
        subscribers={sendSubscribers}
        onSend={onSendManualSms}
      />

      <h3 className="portal-section__subtitle">Dodaj / uredi naročnika</h3>
      <AdminSmsSubscriberForm busy={busy} onSubmit={onAddSubscriber} />
      <p className="admin-panel__muted">
        Admin lahko doda naročnika tudi brez paketa Podpornik (ročna odobritev).
      </p>

      <h3 className="portal-section__subtitle">Naročniki ({subsTotal})</h3>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>E-pošta</th>
              <th>Paket</th>
              <th>Vklop</th>
              <th>Admin</th>
              <th>Lokacija</th>
              <th>Radij</th>
              <th>Avto (mes/skupaj)</th>
              <th>Ročno (mes/skupaj)</th>
              <th>Meteo</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={10} className="admin-panel__muted">
                  Ni aktivnih naročnikov.
                </td>
              </tr>
            ) : (
              subscribers.map((s) => (
                <tr key={s.user_id}>
                  <td>{s.email}</td>
                  <td>{s.plan_id || "—"}</td>
                  <td>{s.alert_enabled ? "Da" : "Ne"}</td>
                  <td>{s.sms_alerts_admin_granted ? "Ročno" : "—"}</td>
                  <td>{s.saved_label || (s.saved_lat != null ? `${s.saved_lat?.toFixed(3)}, ${s.saved_lon?.toFixed(3)}` : "—")}</td>
                  <td>{s.alert_radius_km} km</td>
                  <td>
                    {s.sms_sent_auto_this_month ?? 0} / {s.sms_sent_strike_total ?? 0}
                  </td>
                  <td>
                    {s.sms_sent_manual_this_month ?? 0} / {s.sms_sent_manual_total ?? 0}
                  </td>
                  <td>{s.sms_sent_meteo_total ?? 0}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm admin-btn-danger"
                      disabled={busy}
                      onClick={() => void onRemoveSubscriber(s.user_id, s.email)}
                    >
                      Odstrani
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AdminPager
        page={subsPage}
        totalPages={subsTotalPages}
        total={subsTotal}
        pageSize={SMS_SUBS_PAGE_SIZE}
        loading={listLoading}
        label="Strani SMS naročnikov"
        onPage={(p) => void loadSubscribersPage(p)}
      />

      <h3 className="portal-section__subtitle">Obvestila ({notesTotal})</h3>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Čas</th>
              <th>Vrsta</th>
              <th>Uporabnik</th>
              <th>Telefon</th>
              <th>Podrobnosti</th>
            </tr>
          </thead>
          <tbody>
            {notifications.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-panel__muted">
                  Še ni poslanih SMS.
                </td>
              </tr>
            ) : (
              notifications.map((n) => (
                <tr key={`${n.kind}-${n.id}`}>
                  <td>{formatDt(n.created_at)}</td>
                  <td>
                    {n.kind === "manual"
                      ? "Ročno"
                      : n.kind === "auto_strike" || n.kind === "strike"
                        ? "Avtomatsko"
                        : "MeteoAlarm"}
                  </td>
                  <td>{n.user_email || `#${n.user_id}`}</td>
                  <td>{n.phone}</td>
                  <td>
                    {n.kind === "manual"
                      ? n.sms_body || "—"
                      : n.kind === "auto_strike" || n.kind === "strike"
                        ? `${n.strike_count ?? 1}× strela, najblizja ${n.nearest_km ?? "?"} km`
                        : n.warning_identifier || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <AdminPager
        page={notesPage}
        totalPages={notesTotalPages}
        total={notesTotal}
        pageSize={SMS_NOTES_PAGE_SIZE}
        loading={listLoading}
        label="Strani SMS obvestil"
        onPage={(p) => void loadNotificationsPage(p)}
      />
    </section>
  );
}

function AdminContent({ tab }: { tab: AdminTabId }) {
  switch (tab) {
    case "racuni":
      return <InvoicesSection />;
    case "usklajevanje":
      return <ReconcileSection />;
    case "uporabniki":
      return <UsersSection />;
    case "sms":
      return <SmsSection />;
    default:
      return <SummarySection />;
  }
}

function AdminPageInner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseAdminTab(searchParams.get("tab"));

  const onTabChange = useCallback(
    (next: AdminTabId) => {
      setSearchParams({ tab: next });
    },
    [setSearchParams]
  );

  return (
    <section className="portal-page page--standard admin-page">
      <header className="page-header portal-page-header">
        <h1>Strelko admin</h1>
        <p className="pricing-lead portal-page-header__lead">
          Računi, FURS, SMS opozorila, usklajevanje Stripe in uporabniki.
        </p>
      </header>
      <AdminTabs active={tab} onChange={onTabChange} />
      <AdminContent tab={tab} />
    </section>
  );
}

export function AdminPage() {
  return (
    <RequireAdmin>
      <AdminPageInner />
    </RequireAdmin>
  );
}
