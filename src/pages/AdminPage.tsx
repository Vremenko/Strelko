import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { adminApi } from "../api/client";
import { AdminSmsManualSend } from "../components/admin/AdminSmsManualSend";
import { AdminSmsSubscriberForm, type AdminSmsSubscriberFormData } from "../components/admin/AdminSmsSubscriberForm";
import { RequireAdmin } from "../components/RequireAdmin";
import { useStrelko } from "../context/StrelkoContext";
import type {
  AdminStrelkoInvoice,
  AdminStrelkoReconcileResult,
  AdminStrelkoSmsNotification,
  AdminStrelkoSmsSubscriber,
  AdminStrelkoSmsSummary,
  AdminStrelkoSummary,
  AdminStrelkoUser,
  AdminStrelkoUserDetail,
} from "../types";

const USERS_PAGE_SIZE = 15;

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
  const [items, setItems] = useState<AdminStrelkoInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listInvoices({
        furs_status: statusFilter || undefined,
        email: emailFilter.trim() || undefined,
        limit: 80,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      setError((e as Error).message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, emailFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function openPdf(id: number) {
    setBusyId(id);
    setMessage(null);
    try {
      const blob = await adminApi.downloadInvoicePdf(id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function retryFurs(id: number) {
    setBusyId(id);
    setMessage(null);
    try {
      const res = await adminApi.retryFurs(id);
      setMessage(res.message || "FURS ponovno poslan.");
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function resendEmail(id: number) {
    setBusyId(id);
    setMessage(null);
    try {
      const res = await adminApi.resendEmail(id);
      setMessage(res.message || "E-pošta poslana.");
      await load();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="portal-section admin-panel">
      <h2 className="portal-section__title">Računi ({total})</h2>
      <div className="admin-filters">
        <label>
          FURS status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            placeholder="iskanje …"
          />
        </label>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => void load()}>
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
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Številka</th>
                <th>Datum</th>
                <th>Uporabnik</th>
                <th>Znesek</th>
                <th>FURS</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inv) => (
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
                    <span className={`admin-badge admin-badge--${inv.furs_status}`}>
                      {fursStatusLabel(inv.furs_status)}
                    </span>
                    {inv.furs_error ? (
                      <div className="admin-table__sub admin-table__sub--error">{inv.furs_error}</div>
                    ) : null}
                    {inv.zoi ? <div className="admin-table__sub">ZOI: {inv.zoi.slice(0, 12)}…</div> : null}
                  </td>
                  <td className="admin-table__actions">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={busyId === inv.id}
                      onClick={() => void openPdf(inv.id)}
                    >
                      PDF
                    </button>
                    {inv.furs_status !== "fiscalized" ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={busyId === inv.id}
                        onClick={() => void retryFurs(inv.id)}
                      >
                        FURS
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={busyId === inv.id || !inv.buyer_email}
                      onClick={() => void resendEmail(inv.id)}
                    >
                      Pošlji
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function issueMissing() {
    if (!issueRefId.trim()) return;
    setIssueMessage(null);
    try {
      const res = await adminApi.issueMissing(issueRefType, issueRefId.trim());
      setIssueMessage(res.message || `Račun ${res.invoice_number || ""}`.trim());
    } catch (e) {
      setIssueMessage((e as Error).message);
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
      {result ? (
        <div className="admin-reconcile-result">
          <p>
            Stripe plačil: <strong>{result.stripe_paid_count}</strong> · Lokalnih računov:{" "}
            <strong>{result.invoice_count}</strong> · Manjkajočih:{" "}
            <strong>{result.missing_count}</strong> · FURS napak:{" "}
            <strong>{result.failed_count}</strong>
            {result.issued_count > 0 ? (
              <> · Izdano: <strong>{result.issued_count}</strong></>
            ) : null}
          </p>
          {result.missing.length > 0 ? (
            <>
              <h3>Plačila brez računa</h3>
              <ul className="admin-list">
                {result.missing.map((row) => (
                  <li key={`${row.ref_type}-${row.ref_id}`}>
                    {String(row.description)} — {String(row.amount_eur)} ({String(row.ref_id)})
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {result.failed.length > 0 ? (
            <>
              <h3>FURS napake</h3>
              <ul className="admin-list">
                {result.failed.map((row) => (
                  <li key={String(row.invoice_number)}>
                    {String(row.invoice_number)} — {String(row.furs_error || "")}
                  </li>
                ))}
              </ul>
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
        <button type="button" className="btn btn-ghost" onClick={() => void issueMissing()}>
          Izdaj račun
        </button>
      </div>
      {issueMessage ? <p className="admin-panel__message" role="status">{issueMessage}</p> : null}
    </section>
  );
}

function UsersSection() {
  const { user: currentUser } = useStrelko();
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState<AdminStrelkoUser[]>([]);
  const [selected, setSelected] = useState<AdminStrelkoUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [grantAmount, setGrantAmount] = useState(5);
  const [grantNote, setGrantNote] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [podpornikExpires, setPodpornikExpires] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState("");

  const loadUsers = useCallback(async (nextPage: number, searchEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listUsers({
        email: searchEmail.trim() || undefined,
        page: nextPage,
        page_size: USERS_PAGE_SIZE,
      });
      setUsers(res.items);
      setPage(res.page);
      setTotalPages(res.total_pages);
      setTotalCount(res.total_count ?? res.total);
    } catch (e) {
      setError((e as Error).message);
      setUsers([]);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers(1, "");
  }, [loadUsers]);

  async function searchUsers() {
    setSelected(null);
    setDeleteOpen(false);
    await loadUsers(1, email);
  }

  async function goToPage(nextPage: number) {
    if (nextPage < 1 || (totalPages > 0 && nextPage > totalPages) || nextPage === page) return;
    // Namerno brez scrolla na vrh — samo zamenjaj stran seznama.
    await loadUsers(nextPage, email);
  }

  async function loadUser(id: number) {
    setError(null);
    setActionMessage(null);
    setDeleteOpen(false);
    setDeleteEmailConfirm("");
    try {
      const detail = await adminApi.getUser(id);
      setSelected(detail);
      if (!detail.podpornik_active) {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        setPodpornikExpires(d.toISOString().slice(0, 10));
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function withBusy(fn: () => Promise<void>) {
    if (actionBusy) return;
    setActionBusy(true);
    setActionMessage(null);
    try {
      await fn();
    } catch (e) {
      setActionMessage((e as Error).message);
    } finally {
      setActionBusy(false);
    }
  }

  async function grantCredits() {
    if (!selected) return;
    const amount = Math.floor(Number(grantAmount));
    if (!Number.isFinite(amount) || amount < 1) {
      setActionMessage("Količina mora biti pozitivno celo število.");
      return;
    }
    await withBusy(async () => {
      const res = await adminApi.grantCredits(selected.id, amount, grantNote.trim() || undefined);
      setActionMessage(`Dodano ${res.amount_granted} žetonov. Novo stanje: ${res.credits_balance}.`);
      setGrantNote("");
      await loadUser(selected.id);
      await loadUsers(page, email);
    });
  }

  async function activatePodpornik() {
    if (!selected || !podpornikExpires) return;
    await withBusy(async () => {
      const res = await adminApi.activatePodpornik(selected.id, podpornikExpires);
      setActionMessage(res.message || "Podpornik aktiviran.");
      await loadUser(selected.id);
      await loadUsers(page, email);
    });
  }

  async function cancelPodpornik() {
    if (!selected) return;
    const ok = window.confirm(
      selected.podpornik_manual || !selected.stripe_subscription_id
        ? `Takoj deaktivirati ročni paket Podpornik za ${selected.email}?`
        : `Nastaviti preklic Stripe naročnine ob koncu plačanega obdobja za ${selected.email}? (brez vračila)`
    );
    if (!ok) return;
    await withBusy(async () => {
      const res = await adminApi.cancelPodpornik(selected.id);
      setActionMessage(res.message);
      await loadUser(selected.id);
      await loadUsers(page, email);
    });
  }

  async function deleteUser() {
    if (!selected) return;
    await withBusy(async () => {
      await adminApi.deleteUser(selected.id, deleteEmailConfirm.trim());
      setActionMessage(`Uporabnik ${selected.email} je izbrisan.`);
      setSelected(null);
      setDeleteOpen(false);
      setDeleteEmailConfirm("");
      await loadUsers(page, email);
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

  const isSelf =
    !!selected &&
    !!currentUser?.email &&
    selected.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase();

  return (
    <section className="portal-section admin-panel">
      <h2 className="portal-section__title">Uporabniki</h2>
      <div className="admin-filters">
        <label>
          E-pošta
          <input
            type="search"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="del e-pošte …"
            onKeyDown={(e) => {
              if (e.key === "Enter") void searchUsers();
            }}
          />
        </label>
        <button type="button" className="btn btn-primary" disabled={loading} onClick={() => void searchUsers()}>
          Išči
        </button>
      </div>
      {error ? <p className="admin-panel__error" role="alert">{error}</p> : null}
      {loading ? <p className="admin-panel__muted">Nalagam …</p> : null}
      {!loading && users.length > 0 ? (
        <>
          <p className="admin-panel__muted admin-users-count">
            {totalCount} uporabnikov · stran {page}/{Math.max(totalPages, 1)}
          </p>
          <ul className="admin-user-list">
            {users.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  className={`admin-user-list__btn${selected?.id === u.id ? " is-selected" : ""}`}
                  onClick={() => void loadUser(u.id)}
                >
                  <strong>{u.email}</strong>
                  <span>
                    {u.credits_balance} žetonov · {u.plan_id || "brez paketa"}
                    {u.podpornik_active ? " · Podpornik aktiven" : ""}
                    {u.podpornik_manual ? " (ročno)" : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {totalPages > 1 ? (
            <nav className="admin-pagination" aria-label="Strani uporabnikov">
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
      ) : null}
      {!loading && users.length === 0 && !error ? (
        <p className="admin-panel__muted">Ni uporabnikov za prikaz.</p>
      ) : null}

      {selected ? (
        <div className="admin-user-detail legal-card">
          <h3>{selected.email}</h3>
          <p className="admin-panel__muted">
            ID {selected.id} · vloga {selected.role} · {selected.credits_balance} žetonov · paket{" "}
            {selected.plan_id || "—"}
            {selected.podpornik_active ? " · Podpornik aktiven" : ""}
            {selected.podpornik_manual ? " · ročna admin aktivacija" : ""}
          </p>
          {selected.season_pass_expires_at ? (
            <p className="admin-panel__muted">Veljavnost do: {selected.season_pass_expires_at}</p>
          ) : null}
          {selected.stripe_subscription_id ? (
            <p className="admin-panel__muted">
              Stripe sub: {selected.stripe_subscription_id}
              {selected.subscription_cancel_at_period_end ? " · preklic ob koncu obdobja" : ""}
            </p>
          ) : null}

          <div className="admin-grant">
            <h4>Dodaj žetone</h4>
            <div className="admin-filters">
              <label>
                Količina
                <input
                  type="number"
                  min={1}
                  max={10000}
                  step={1}
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(Number(e.target.value))}
                />
              </label>
              <label>
                Opomba
                <input
                  type="text"
                  value={grantNote}
                  onChange={(e) => setGrantNote(e.target.value)}
                  placeholder="opcijsko"
                  maxLength={200}
                />
              </label>
              <button
                type="button"
                className="btn btn-primary"
                disabled={actionBusy || !(Math.floor(Number(grantAmount)) >= 1)}
                onClick={() => void grantCredits()}
              >
                Dodaj žetone
              </button>
            </div>
          </div>

          {!selected.podpornik_active ? (
            <div className="admin-grant">
              <h4>Aktivacija paketa Podpornik</h4>
              <p className="admin-panel__muted">
                Ročna dodelitev brez Stripe naročnine, bremenitve ali računa.
              </p>
              <div className="admin-filters">
                <label>
                  Veljavnost do
                  <input
                    type="date"
                    required
                    value={podpornikExpires}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setPodpornikExpires(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={actionBusy || !podpornikExpires}
                  onClick={() => void activatePodpornik()}
                >
                  Aktiviraj Podpornika
                </button>
              </div>
            </div>
          ) : (
            <div className="admin-grant">
              <h4>Preklic paketa Podpornik</h4>
              {selected.podpornik_manual || !selected.stripe_subscription_id ? (
                <p className="admin-panel__muted">Ročno dodeljen paket — deaktivacija je takojšnja.</p>
              ) : (
                <p className="admin-panel__muted">
                  Stripe naročnina — preklic ob koncu že plačanega obdobja (brez vračila).
                </p>
              )}
              <button
                type="button"
                className="btn"
                disabled={actionBusy}
                onClick={() => void cancelPodpornik()}
              >
                Prekliči Podpornika
              </button>
            </div>
          )}

          <div className="admin-grant admin-user-delete">
            <h4>Brisanje uporabnika</h4>
            {!selected.can_delete || isSelf ? (
              <p className="admin-panel__error" role="status">
                Brisanje ni dovoljeno
                {(selected.delete_block_reasons || []).length
                  ? `: ${(selected.delete_block_reasons || []).join(" ")}`
                  : isSelf
                    ? ": ne morete izbrisati lastnega računa."
                    : "."}
              </p>
            ) : !deleteOpen ? (
              <button
                type="button"
                className="btn admin-btn-danger-solid"
                disabled={actionBusy}
                onClick={() => setDeleteOpen(true)}
              >
                Izbriši uporabnika
              </button>
            ) : (
              <div className="admin-delete-confirm">
                <p className="admin-panel__muted">
                  Za potrditev vpišite e-pošto uporabnika: <strong>{selected.email}</strong>
                </p>
                <label>
                  E-pošta
                  <input
                    type="email"
                    value={deleteEmailConfirm}
                    onChange={(e) => setDeleteEmailConfirm(e.target.value)}
                    autoComplete="off"
                  />
                </label>
                <div className="admin-filters">
                  <button
                    type="button"
                    className="btn admin-btn-danger-solid"
                    disabled={
                      actionBusy ||
                      deleteEmailConfirm.trim().toLowerCase() !== selected.email.trim().toLowerCase()
                    }
                    onClick={() => void deleteUser()}
                  >
                    Trajno izbriši
                  </button>
                  <button
                    type="button"
                    className="btn"
                    disabled={actionBusy}
                    onClick={() => {
                      setDeleteOpen(false);
                      setDeleteEmailConfirm("");
                    }}
                  >
                    Prekliči
                  </button>
                </div>
              </div>
            )}
          </div>

          {actionMessage ? <p className="admin-panel__message" role="status">{actionMessage}</p> : null}

          <h4>Zadnje transakcije</h4>
          <ul className="admin-list admin-list--compact">
            {selected.transactions.slice(0, 20).map((tx) => (
              <li key={tx.id}>
                {formatDt(tx.created_at)} · {tx.amount > 0 ? "+" : ""}
                {tx.amount} · {tx.reason}
              </li>
            ))}
          </ul>

          <h4>Računi</h4>
          {selected.invoices.length === 0 ? (
            <p className="admin-panel__muted">Ni računov.</p>
          ) : (
            <ul className="admin-list admin-list--compact">
              {selected.invoices.map((inv) => (
                <li key={inv.id}>
                  {inv.invoice_number} · {formatEur(inv.gross_cents)} · {fursStatusLabel(inv.furs_status)}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </section>
  );
}

function SmsSection() {
  const [summary, setSummary] = useState<AdminStrelkoSmsSummary | null>(null);
  const [subscribers, setSubscribers] = useState<AdminStrelkoSmsSubscriber[]>([]);
  const [notifications, setNotifications] = useState<AdminStrelkoSmsNotification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    const [s, subs, notes] = await Promise.all([
      adminApi.smsSummary(),
      adminApi.smsSubscribers({ limit: 50 }),
      adminApi.smsNotifications({ limit: 30 }),
    ]);
    setSummary(s);
    setSubscribers(subs.items);
    setNotifications(notes.items);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadData();
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadData]);

  const onAddSubscriber = async (data: AdminSmsSubscriberFormData) => {
    setError(null);
    setActionMsg(null);
    setBusy(true);
    try {
      const res = await adminApi.upsertSmsSubscriber(data);
      setActionMsg(res.message);
      await loadData();
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
      await loadData();
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
      await loadData();
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
        subscribers={subscribers}
        onSend={onSendManualSms}
      />

      <h3 className="portal-section__subtitle">Dodaj / uredi naročnika</h3>
      <AdminSmsSubscriberForm busy={busy} onSubmit={onAddSubscriber} />
      <p className="admin-panel__muted">
        Admin lahko doda naročnika tudi brez paketa Podpornik (ročna odobritev).
      </p>

      <h3 className="portal-section__subtitle">Naročniki</h3>
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

      <h3 className="portal-section__subtitle">Zadnja obvestila</h3>
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
