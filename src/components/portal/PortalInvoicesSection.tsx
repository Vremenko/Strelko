/** Plačila in računi — skupna sekcija pod karticama paketov. */
export function PortalInvoicesSection() {
  return (
    <section className="portal-section portal-section--invoices" aria-labelledby="portal-invoices-title">
      <h2 id="portal-invoices-title" className="portal-section__title">
        Plačila in računi
      </h2>
      <div className="portal-card portal-card--muted">
        <p className="portal-empty-state__text">
          Ko bo API povezan, boste tukaj videli plačila, status, prenos PDF-računa in možnost
          ponovnega pošiljanja po e-pošti. Formalni računi za slovensko računovodstvo še niso
          potrjeni.
        </p>
      </div>
    </section>
  );
}
