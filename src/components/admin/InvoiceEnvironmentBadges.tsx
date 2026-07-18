import {
  fursEnvLabel,
  invoiceSourceLabel,
  stripeEnvLabel,
  type InvoiceEnvTone,
} from "../../lib/adminInvoiceEnvironment";

type InvoiceEnvFields = {
  stripe_livemode?: boolean | null;
  stripe_session_id?: string | null;
  stripe_invoice_id?: string | null;
  furs_environment?: string | null;
  invoice_source?: string | null;
};

function toneClass(tone: InvoiceEnvTone): string {
  return `admin-env-badge admin-env-badge--${tone}`;
}

/** Majhne značke okolja za seznam računov in profil. */
export function InvoiceEnvironmentBadges({ invoice }: { invoice: InvoiceEnvFields }) {
  const stripe = stripeEnvLabel(invoice);
  const furs = fursEnvLabel(invoice);
  const source = invoiceSourceLabel(invoice.invoice_source);

  return (
    <div className="admin-env-badges" aria-label="Okolje računa">
      <span className={toneClass(stripe.tone)} title="Stripe okolje">
        Stripe: {stripe.label}
      </span>
      <span className={toneClass(furs.tone)} title="FURS okolje ob pošiljanju">
        FURS: {furs.label}
      </span>
      <span className="admin-env-badge admin-env-badge--neutral" title="Vir računa">
        Vir: {source}
      </span>
    </div>
  );
}
