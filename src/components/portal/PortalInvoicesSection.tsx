import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { api } from "../../api/client";
import { openStripeBillingPortalInNewTab } from "../../lib/stripe-billing-portal";
import type { BillingHistoryItem } from "../../types";
import { PortalQueriesPagination } from "./PortalQueriesPagination";

const PAGE_SIZE = 8;

function formatOccurredAt(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString("sl-SI", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Bearer token — prazen zavihek mora nastati sinhrono v click handlerju.
 * Naslov zavihka: „Račun STRELKO-WEB1-25“ (ne „(anonymous)“).
 * PDF prikažemo prek <embed> v istem dokumentu, da vgrajeni pregledovalnik
 * ne prepiše title z blob: URL-jem.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tabTitleFromPdfFilename(filename: string): string {
  const base = filename.replace(/^.*[/\\]/, "").replace(/\.pdf$/i, "");
  const number = base.replace(/^racun-/i, "").trim();
  return number ? `Račun ${number}` : "Račun";
}

async function openFiscalInvoicePdfInTab(
  invoiceId: number,
  newTab: Window
): Promise<void> {
  try {
    newTab.document.title = "Račun";
  } catch {
    /* ignore */
  }

  const file = await api.downloadInvoicePdf(invoiceId);
  const title = tabTitleFromPdfFilename(file.name);
  const pdfUrl = URL.createObjectURL(file);

  const html = `<!DOCTYPE html><html lang="sl"><head><meta charset="utf-8"><title>${escapeHtml(
    title
  )}</title><style>html,body{margin:0;height:100%;overflow:hidden;background:#525659}embed{border:0;width:100%;height:100%}</style></head><body><embed src="${pdfUrl}" type="application/pdf" title="${escapeHtml(
    title
  )}" /></body></html>`;

  try {
    newTab.document.open();
    newTab.document.write(html);
    newTab.document.close();
  } catch {
    const htmlUrl = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    newTab.location.href = htmlUrl;
    window.setTimeout(() => URL.revokeObjectURL(htmlUrl), 10 * 60_000);
  }

  window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 10 * 60_000);
}

/** Plačila in računi — zavihek Plačila v Moj Strelko. */
export function PortalInvoicesSection() {
  const [items, setItems] = useState<BillingHistoryItem[]>([]);
  const [billingPortalAvailable, setBillingPortalAvailable] = useState(false);
  const [totalPaidEur, setTotalPaidEur] = useState("0,00 €");
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openingInvoiceId, setOpeningInvoiceId] = useState<number | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);
  const [page, setPage] = useState(0);
  const pendingScrollRef = useRef<{ x: number; y: number } | null>(null);
  const requestIdRef = useRef(0);

  const loadPage = useCallback(async (nextPage: number, isInitial: boolean) => {
    const reqId = ++requestIdRef.current;
    if (isInitial) {
      setInitialLoading(true);
    } else {
      setListLoading(true);
    }
    setError(null);
    try {
      const res = await api.billingHistory({ page: nextPage, page_size: PAGE_SIZE });
      if (reqId !== requestIdRef.current) return;
      setItems(res.items ?? []);
      setBillingPortalAvailable(Boolean(res.billing_portal_available));
      setTotalPaidEur(res.total_paid_eur || "0,00 €");
      setTotalPages(Math.max(1, res.total_pages ?? 1));
      setTotalCount(res.total_count ?? 0);
      setPage(res.page ?? nextPage);
    } catch (e) {
      if (reqId !== requestIdRef.current) return;
      setError((e as Error).message || "Zgodovine plačil ni mogoče naložiti.");
      if (isInitial) {
        setItems([]);
        setTotalCount(0);
        setTotalPages(1);
        setTotalPaidEur("0,00 €");
      }
    } finally {
      if (reqId === requestIdRef.current) {
        setInitialLoading(false);
        setListLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadPage(0, true);
  }, [loadPage]);

  const goToPage = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(totalPages - 1, next));
      if (clamped === page && !listLoading) return;
      pendingScrollRef.current = { x: window.scrollX, y: window.scrollY };
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      void loadPage(clamped, false);
    },
    [loadPage, listLoading, page, totalPages]
  );

  useLayoutEffect(() => {
    const saved = pendingScrollRef.current;
    if (!saved || listLoading) return;
    pendingScrollRef.current = null;
    window.scrollTo(saved.x, saved.y);
  }, [listLoading, page, items]);

  const openManageSubscription = useCallback(async () => {
    if (portalBusy) return;
    setPortalBusy(true);
    try {
      await openStripeBillingPortalInNewTab(async () => {
        const { portal_url } = await api.billingPortal();
        return portal_url;
      });
    } catch (e) {
      window.alert(
        (e as Error).message || "Portal za upravljanje naročnine trenutno ni na voljo."
      );
    } finally {
      setPortalBusy(false);
    }
  }, [portalBusy]);

  return (
    <section className="portal-section portal-section--invoices" aria-labelledby="portal-invoices-title">
      <div className="portal-section__head">
        <h2 id="portal-invoices-title" className="portal-section__title">
          Plačila in računi
        </h2>
        {billingPortalAvailable ? (
          <button
            type="button"
            className="btn btn-primary portal-invoices-manage-btn"
            disabled={portalBusy}
            aria-busy={portalBusy}
            onClick={() => void openManageSubscription()}
          >
            Upravljaj naročnino
          </button>
        ) : null}
      </div>

      {initialLoading ? (
        <div className="portal-card portal-card--muted">
          <p className="portal-empty-state__text">Nalagam plačila …</p>
        </div>
      ) : error && totalCount === 0 && items.length === 0 ? (
        <div className="portal-card portal-card--muted">
          <p className="portal-empty-state__text">{error}</p>
        </div>
      ) : totalCount === 0 ? (
        <div className="portal-card portal-card--muted">
          <p className="portal-empty-state__text">
            Še nimate evidentiranih plačil. Po prvem nakupu žetonov ali naročnini Podpornik bodo
            tukaj prikazani znesek, datum in povezava do potrdila ali računa.
          </p>
        </div>
      ) : (
        <div className="portal-card portal-card--full">
          <p className="portal-card__hint portal-invoices-summary">
            Skupaj plačano: <strong>{totalPaidEur}</strong>
          </p>
          {error ? <p className="form-error">{error}</p> : null}
          <div
            className="portal-invoices-table-wrap"
            aria-busy={listLoading || undefined}
          >
            {listLoading ? (
              <p className="portal-empty-state__text">Nalagam plačila …</p>
            ) : (
              <table className="portal-invoices-table">
                <thead>
                  <tr>
                    <th>Datum</th>
                    <th>Opis</th>
                    <th>Znesek</th>
                    <th>Status</th>
                    <th>Dokument</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{formatOccurredAt(item.occurred_at)}</td>
                      <td>{item.description_sl.replace(/\s*\(Ob škodi\)\s*/g, "").trim()}</td>
                      <td>{item.amount_eur}</td>
                      <td>{item.fiscal_status_sl || item.status_sl}</td>
                      <td>
                        {item.document_url ? (
                          item.fiscal_invoice_id ? (
                            <button
                              type="button"
                              className="btn-link portal-invoices-table__doc-btn"
                              disabled={openingInvoiceId === item.fiscal_invoice_id}
                              onClick={() => {
                                const invoiceId = item.fiscal_invoice_id;
                                if (!invoiceId) return;
                                // Bearer auth: prazen zavihek mora nastati v istem clicku.
                                const newTab = window.open("about:blank", "_blank");
                                if (!newTab) {
                                  setError(
                                    "Brskalnik je blokiral novo okno. Dovolite pojavna okna za to stran in poskusite znova."
                                  );
                                  return;
                                }
                                setOpeningInvoiceId(invoiceId);
                                void openFiscalInvoicePdfInTab(invoiceId, newTab)
                                  .catch((e) => {
                                    try {
                                      newTab.close();
                                    } catch {
                                      /* ignore */
                                    }
                                    setError(
                                      (e as Error).message || "Računa ni mogoče odpreti."
                                    );
                                  })
                                  .finally(() => setOpeningInvoiceId(null));
                              }}
                            >
                              {openingInvoiceId === item.fiscal_invoice_id
                                ? "Odpiram …"
                                : "Račun (PDF)"}
                            </button>
                          ) : (
                            <a href={item.document_url} target="_blank" rel="noopener noreferrer">
                              Odpri
                            </a>
                          )
                        ) : (
                          <span className="portal-invoices-table__meta">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <PortalQueriesPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            ariaLabel="Strani plačil"
          />
          <p className="portal-card__hint">
            Podaljšanje naročnine Podpornik lahko prekličete ali posodobite plačilno kartico s
            klikom na gumb Upravljaj naročnino.
          </p>
        </div>
      )}
    </section>
  );
}
