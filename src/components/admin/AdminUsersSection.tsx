import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/client";
import { useStrelko } from "../../context/StrelkoContext";
import { InvoiceEnvironmentBadges } from "./InvoiceEnvironmentBadges";
import {
  buildInvoicePipeline,
  type InvoicePipelineStep,
} from "../../lib/adminInvoicePipeline";
import {
  ADMIN_USER_FILTERS,
  ADMIN_USER_SORT_OPTIONS,
  authMethodLabel,
  creditReasonLabel,
  podpornikSourceLabel,
  type AdminUserFilterId,
  type AdminUserSortBy,
  type AdminUserSortDir,
} from "../../lib/adminUserLabels";
import type {
  AdminStrelkoInvoice,
  AdminStrelkoUser,
  AdminStrelkoUserDetail,
} from "../../types";

const PAGE_SIZE = 15;

function formatEur(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

function formatDt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("sl-SI");
}

function formatDateOnly(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("sl-SI");
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

function PipelineMini({ steps }: { steps: InvoicePipelineStep[] }) {
  return (
    <ol className="admin-pipeline admin-pipeline--compact" aria-label="Status računa">
      {steps.map((step) => (
        <li key={step.id} className={`admin-pipeline__step admin-pipeline__step--${step.state}`}>
          <span className="admin-pipeline__label">{step.label}</span>
          <span className="admin-pipeline__state">
            {step.state === "ok" ? "uspešno" : step.state === "error" ? "napaka" : "čaka"}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "ok" | "warn" | "danger" | "manual" | "stripe";
}) {
  return <span className={`admin-chip admin-chip--${tone}`}>{children}</span>;
}

function UserCardBadges({ u }: { u: AdminStrelkoUser }) {
  const source = podpornikSourceLabel(u);
  return (
    <div className="admin-chip-row">
      <Badge tone={u.is_active ? "ok" : "danger"}>{u.is_active ? "Aktiven" : "Neaktiven"}</Badge>
      <Badge tone={u.email_verified ? "ok" : "warn"}>
        {u.email_verified ? "Potrjena" : "Nepotrjena"}
      </Badge>
      <Badge
        tone={source === "Ročno" ? "manual" : source === "Stripe" ? "stripe" : "neutral"}
      >
        Podpornik: {source}
      </Badge>
      {u.subscription_cancel_at_period_end ? (
        <Badge tone="warn">Preklic ob koncu obdobja</Badge>
      ) : null}
    </div>
  );
}

export function AdminUsersSection() {
  const { user: currentUser } = useStrelko();
  const [emailDraft, setEmailDraft] = useState("");
  const [appliedEmail, setAppliedEmail] = useState("");
  const [filter, setFilter] = useState<AdminUserFilterId>("all");
  const [sortBy, setSortBy] = useState<AdminUserSortBy>("created_at");
  const [sortDir, setSortDir] = useState<AdminUserSortDir>("desc");
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

  const loadUsers = useCallback(
    async (nextPage: number, searchEmail: string, nextFilter: AdminUserFilterId) => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminApi.listUsers({
          email: searchEmail.trim() || undefined,
          filter: nextFilter === "all" ? undefined : nextFilter,
          sort_by: sortBy,
          sort_dir: sortDir,
          page: nextPage,
          page_size: PAGE_SIZE,
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
    },
    [sortBy, sortDir]
  );

  useEffect(() => {
    void loadUsers(1, appliedEmail, filter);
  }, [loadUsers, appliedEmail, filter]);

  async function searchUsers() {
    const trimmed = emailDraft.trim();
    if (trimmed && trimmed.length < 2) {
      setError("Za iskanje po e-pošti vnesite vsaj 2 znaka.");
      return;
    }
    setSelected(null);
    setDeleteOpen(false);
    setAppliedEmail(trimmed);
    setPage(1);
  }

  function resetFilters() {
    setEmailDraft("");
    setAppliedEmail("");
    setFilter("all");
    setSortBy("created_at");
    setSortDir("desc");
    setPage(1);
    setSelected(null);
  }

  async function goToPage(nextPage: number) {
    if (nextPage < 1 || (totalPages > 0 && nextPage > totalPages) || nextPage === page) return;
    await loadUsers(nextPage, appliedEmail, filter);
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

  async function refreshAfterAction(userId: number) {
    await loadUser(userId);
    await loadUsers(page, appliedEmail, filter);
  }

  async function grantCredits() {
    if (!selected) return;
    const amount = Math.floor(Number(grantAmount));
    if (!Number.isFinite(amount) || amount < 1) {
      setActionMessage("Količina mora biti pozitivno celo število.");
      return;
    }
    const ok = window.confirm(
      `Uporabniku ${selected.email} boste dodali ${amount} žetonov. Želite nadaljevati?`
    );
    if (!ok) return;
    await withBusy(async () => {
      const res = await adminApi.grantCredits(selected.id, amount, grantNote.trim() || undefined);
      setActionMessage(`Dodano ${res.amount_granted} žetonov. Novo stanje: ${res.credits_balance}.`);
      setGrantNote("");
      await refreshAfterAction(selected.id);
    });
  }

  async function activatePodpornik() {
    if (!selected || !podpornikExpires) return;
    const ok = window.confirm(
      `Uporabniku ${selected.email} boste ročno aktivirali paket Podpornik. Želite nadaljevati?`
    );
    if (!ok) return;
    await withBusy(async () => {
      const res = await adminApi.activatePodpornik(selected.id, podpornikExpires);
      setActionMessage(res.message || "Podpornik aktiviran.");
      await refreshAfterAction(selected.id);
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
      await refreshAfterAction(selected.id);
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
      await loadUsers(page, appliedEmail, filter);
    });
  }

  async function openInvoicePdf(inv: AdminStrelkoInvoice) {
    try {
      const blob = await adminApi.downloadInvoicePdf(inv.id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
    } catch (e) {
      setActionMessage((e as Error).message);
    }
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

  const authHint = selected ? authMethodLabel(selected) : null;
  const queries = selected?.queries || [];

  return (
    <section className="portal-section admin-panel">
      <h2 className="portal-section__title">Uporabniki</h2>
      <div className="admin-filters admin-filters--users">
        <label>
          E-pošta
          <input
            type="search"
            value={emailDraft}
            onChange={(e) => setEmailDraft(e.target.value)}
            placeholder="del e-pošte …"
            onKeyDown={(e) => {
              if (e.key === "Enter") void searchUsers();
            }}
          />
        </label>
        <label>
          Filter
          <select
            value={filter}
            onChange={(e) => {
              setSelected(null);
              setFilter(e.target.value as AdminUserFilterId);
              setPage(1);
            }}
          >
            {ADMIN_USER_FILTERS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Razvrsti
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as AdminUserSortBy)}
          >
            {ADMIN_USER_SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Smer
          <select value={sortDir} onChange={(e) => setSortDir(e.target.value as AdminUserSortDir)}>
            <option value="desc">Padajoče</option>
            <option value="asc">Naraščajoče</option>
          </select>
        </label>
        <button type="button" className="btn btn-primary" disabled={loading} onClick={() => void searchUsers()}>
          Išči
        </button>
        <button type="button" className="btn btn-ghost" disabled={loading} onClick={() => resetFilters()}>
          Ponastavi filtre
        </button>
      </div>

      {error ? <p className="admin-panel__error" role="alert">{error}</p> : null}
      {loading ? <p className="admin-panel__muted">Nalagam …</p> : null}
      {!loading ? (
        <p className="admin-panel__muted admin-users-count">
          {totalCount} zadetkov · stran {page}/{Math.max(totalPages, 1)}
        </p>
      ) : null}

      <div className={`admin-users-layout${selected ? " has-profile" : ""}`}>
        <div className="admin-users-list-pane">
          {!loading && users.length > 0 ? (
            <>
              <ul className="admin-user-cards">
                {users.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      className={`admin-user-card${selected?.id === u.id ? " is-selected" : ""}`}
                      onClick={() => void loadUser(u.id)}
                    >
                      <strong className="admin-user-card__email">{u.email}</strong>
                      <span className="admin-user-card__meta">
                        Reg. {formatDateOnly(u.created_at)} · {u.credits_balance} žetonov
                        {u.season_pass_expires_at || u.subscription_period_end
                          ? ` · do ${formatDateOnly(u.season_pass_expires_at || u.subscription_period_end)}`
                          : ""}
                      </span>
                      <UserCardBadges u={u} />
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
        </div>

        {selected ? (
          <aside className="admin-user-profile" aria-label={`Profil ${selected.email}`}>
            <div className="admin-user-profile__head">
              <div>
                <h3>{selected.email}</h3>
                <UserCardBadges u={selected} />
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSelected(null)}
              >
                Zapri
              </button>
            </div>

            {actionMessage ? <p className="admin-panel__message" role="status">{actionMessage}</p> : null}

            <section className="admin-profile-block">
              <h4>Račun</h4>
              <ul className="admin-profile-dl">
                <li>
                  <span>E-pošta</span>
                  <strong>{selected.email}</strong>
                </li>
                <li>
                  <span>Registracija</span>
                  <strong>{formatDt(selected.created_at || "")}</strong>
                </li>
                <li>
                  <span>E-pošta potrjena</span>
                  <strong>{selected.email_verified ? "Da" : "Ne"}</strong>
                </li>
                <li>
                  <span>Račun</span>
                  <strong>{selected.is_active ? "Aktiven" : "Neaktiven"}</strong>
                </li>
                <li>
                  <span>Vloga</span>
                  <strong>{selected.role}</strong>
                </li>
                {authHint ? (
                  <li>
                    <span>Prijava</span>
                    <strong>{authHint}</strong>
                  </li>
                ) : null}
              </ul>
            </section>

            <section className="admin-profile-block">
              <h4>Žetoni</h4>
              <p>
                Trenutno stanje: <strong>{selected.credits_balance}</strong>
              </p>
              <div className="admin-grant">
                <div className="admin-filters">
                  <label>
                    Količina
                    <input
                      type="number"
                      min={1}
                      max={10000}
                      step={1}
                      value={grantAmount}
                      disabled={actionBusy}
                      onChange={(e) => setGrantAmount(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    Opomba
                    <input
                      type="text"
                      value={grantNote}
                      disabled={actionBusy}
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
                    {actionBusy ? "Delam …" : "Dodaj žetone"}
                  </button>
                </div>
              </div>
              <h5>Zadnjih 10 transakcij</h5>
              {(selected.transactions_total ?? selected.transactions.length) > 10 ? (
                <p className="admin-panel__muted">
                  Skupaj {selected.transactions_total ?? selected.transactions.length} transakcij —
                  prikazanih je zadnjih 10 (celoten seznam žetonov v adminu še ni na ločenem zavihku).
                </p>
              ) : null}
              {selected.transactions.length === 0 ? (
                <p className="admin-panel__muted">Ni transakcij.</p>
              ) : (
                <ul className="admin-list admin-list--compact">
                  {selected.transactions.map((tx) => (
                    <li key={tx.id}>
                      {formatDt(tx.created_at)} · {tx.amount > 0 ? "+" : ""}
                      {tx.amount} · {creditReasonLabel(tx.reason)}
                      <details className="admin-pipeline__tech">
                        <summary>Tehnične podrobnosti</summary>
                        <pre>
                          reason={tx.reason}
                          {tx.stripe_session_id ? `\nsession=${tx.stripe_session_id}` : ""}
                          {tx.stripe_invoice_id ? `\ninvoice=${tx.stripe_invoice_id}` : ""}
                        </pre>
                      </details>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="admin-profile-block">
              <h4>Podpornik</h4>
              <ul className="admin-profile-dl">
                <li>
                  <span>Stanje</span>
                  <strong>{selected.podpornik_active ? "Aktiven" : "Neaktiven"}</strong>
                </li>
                <li>
                  <span>Vir</span>
                  <strong>{podpornikSourceLabel(selected)}</strong>
                </li>
                {selected.subscription_period_start ? (
                  <li>
                    <span>Začetek obdobja</span>
                    <strong>{formatDateOnly(selected.subscription_period_start)}</strong>
                  </li>
                ) : null}
                <li>
                  <span>Veljavnost / konec</span>
                  <strong>
                    {formatDateOnly(
                      selected.season_pass_expires_at || selected.subscription_period_end
                    )}
                  </strong>
                </li>
                {selected.subscription_cancel_at_period_end ? (
                  <li>
                    <span>Preklic</span>
                    <strong>Ob koncu obdobja</strong>
                  </li>
                ) : null}
                {selected.podpornik_active &&
                !selected.podpornik_manual &&
                selected.stripe_subscription_id ? (
                  <li>
                    <span>Stripe naročnina</span>
                    <strong>
                      {selected.subscription_cancel_at_period_end
                        ? "Preklic ob koncu obdobja"
                        : "Aktivna"}
                    </strong>
                  </li>
                ) : null}
              </ul>
              {selected.podpornik_active && selected.stripe_subscription_id && !selected.podpornik_manual ? (
                <details className="admin-pipeline__tech">
                  <summary>Tehnične podrobnosti (Stripe)</summary>
                  <pre>
                    subscription={selected.stripe_subscription_id}
                    {selected.stripe_customer_id ? `\ncustomer=${selected.stripe_customer_id}` : ""}
                  </pre>
                </details>
              ) : null}

              {!selected.podpornik_active ? (
                <div className="admin-grant">
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
                        disabled={actionBusy}
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
            </section>

            <section className="admin-profile-block">
              <h4>Zadnjih 10 računov</h4>
              {(selected.invoices_total ?? selected.invoices.length) > 10 ? (
                <p className="admin-panel__muted">
                  Skupaj {selected.invoices_total} računov.{" "}
                  <Link
                    to={`/admin?tab=racuni&email=${encodeURIComponent(selected.email)}`}
                    className="admin-profile-link"
                  >
                    Prikaži vse račune
                  </Link>
                </p>
              ) : null}
              {selected.invoices.length === 0 ? (
                <p className="admin-panel__muted">Ni računov.</p>
              ) : (
                <ul className="admin-list">
                  {selected.invoices.map((inv) => {
                    const pipeline = buildInvoicePipeline({
                      id: inv.id,
                      invoice_number: inv.invoice_number,
                      furs_status: inv.furs_status,
                      furs_error: inv.furs_error,
                      has_pdf: inv.has_pdf,
                      email_sent_at: inv.email_sent_at,
                      buyer_email: inv.buyer_email,
                    });
                    return (
                      <li key={inv.id} className="admin-list__card">
                        <div>
                          <strong>{inv.invoice_number}</strong> · {formatDateOnly(inv.issued_at)} ·{" "}
                          {inv.description_sl} · {formatEur(inv.gross_cents)} ·{" "}
                          {fursStatusLabel(inv.furs_status)}
                          {inv.email_sent_at ? " · E-pošta poslana" : " · E-pošta ni poslana"}
                        </div>
                        <InvoiceEnvironmentBadges invoice={inv} />
                        <PipelineMini steps={pipeline} />
                        {inv.has_pdf ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={actionBusy}
                            onClick={() => void openInvoicePdf(inv)}
                          >
                            Odpri PDF
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="admin-profile-block">
              <h4>Zadnjih 10 poizvedb</h4>
              {(selected.queries_total ?? queries.length) > 10 ? (
                <p className="admin-panel__muted">
                  Skupaj {selected.queries_total ?? queries.length} poizvedb — prikazanih je zadnjih
                  10 (celoten seznam poizvedb v adminu še ni na ločenem zavihku).
                </p>
              ) : null}
              {queries.length === 0 ? (
                <p className="admin-panel__muted">Ni poizvedb.</p>
              ) : (
                <ul className="admin-list admin-list--compact">
                  {queries.map((q) => (
                    <li key={q.id}>
                      {q.label || `${q.lat.toFixed(4)}, ${q.lon.toFixed(4)}`} · {q.date_from}–
                      {q.date_to} · {q.radius_km} km · {q.tokens_spent} žetonov ·{" "}
                      {formatDt(q.created_at)}
                      {q.total_strikes != null ? ` · ${q.total_strikes} strel` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="admin-profile-block admin-profile-block--danger">
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
                      disabled={actionBusy}
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
            </section>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
