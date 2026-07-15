import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useStrelko } from "../../context/StrelkoContext";
import type { BillingHistoryItem } from "../../types";

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

function totalPaidLabel(items: BillingHistoryItem[]): string {
  const totalCents = items.reduce((sum, item) => sum + (item.amount_cents || 0), 0);
  if (totalCents <= 0) return "0,00 €";
  return `${(totalCents / 100).toFixed(2).replace(".", ",")} €`;
}

/** Plačila in računi — zavihek Plačila v Moj Strelko. */
export function PortalInvoicesSection() {
  const { openBillingPortal } = useStrelko();
  const [items, setItems] = useState<BillingHistoryItem[]>([]);
  const [billingPortalAvailable, setBillingPortalAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.billingHistory();
        if (cancelled) return;
        setItems(res.items ?? []);
        setBillingPortalAvailable(Boolean(res.billing_portal_available));
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message || "Zgodovine plačil ni mogoče naložiti.");
        setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="portal-section portal-section--invoices" aria-labelledby="portal-invoices-title">
      <div className="portal-section__head">
        <h2 id="portal-invoices-title" className="portal-section__title">
          Plačila in računi
        </h2>
        {billingPortalAvailable ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => void openBillingPortal()}
          >
            Upravljaj naročnino
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="portal-card portal-card--muted">
          <p className="portal-empty-state__text">Nalagam plačila …</p>
        </div>
      ) : error ? (
        <div className="portal-card portal-card--muted">
          <p className="portal-empty-state__text">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="portal-card portal-card--muted">
          <p className="portal-empty-state__text">
            Še nimate evidentiranih plačil. Po prvem nakupu žetonov ali naročnini Podpornik bodo
            tukaj prikazani znesek, datum in povezava do potrdila ali računa.
          </p>
        </div>
      ) : (
        <div className="portal-card portal-card--full">
          <p className="portal-card__hint portal-invoices-summary">
            Skupaj plačano (prikazana plačila): <strong>{totalPaidLabel(items)}</strong>
          </p>
          <div className="portal-invoices-table-wrap">
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
                    <td>
                      {item.description_sl}
                      {item.credits_added != null && item.credits_added > 0 ? (
                        <span className="portal-invoices-table__meta">
                          {" "}
                          (+{item.credits_added} žetonov)
                        </span>
                      ) : null}
                    </td>
                    <td>{item.amount_eur}</td>
                    <td>{item.status_sl}</td>
                    <td>
                      {item.document_url ? (
                        <a href={item.document_url} target="_blank" rel="noopener noreferrer">
                          Odpri
                        </a>
                      ) : (
                        <span className="portal-invoices-table__meta">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="portal-card__hint">
            Za naročnino Podpornik lahko v Stripe portalu prekličete podaljšanje ali posodobite
            plačilno kartico. Potrdila za enkratne nakupe žetonov so na voljo prek povezave
            «Odpri».
          </p>
        </div>
      )}
    </section>
  );
}
