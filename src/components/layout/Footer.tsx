import { Link } from "react-router-dom";
import { COMPANY, DISCLAIMER_TEXT, LEGAL_PAGES, type LegalPageId } from "../../lib/legal";

const FOOTER_LEGAL_LABELS: Partial<Record<LegalPageId, string>> = {
  terms: "Pogoji uporabe",
  privacy: "Zasebnost",
  cookies: "Piškotki",
};

export function Footer() {
  const year = new Date().getFullYear();
  const legalLinks = Object.entries(LEGAL_PAGES).map(([id, page]) => (
    <Link key={id} to={page.path}>
      {FOOTER_LEGAL_LABELS[id as LegalPageId] ?? page.title}
    </Link>
  ));

  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <p className="site-footer-copy">
          &copy; {year} <strong>{COMPANY.shortName}</strong> · Strelko
        </p>
        <p className="site-footer-contact">
          <a href={COMPANY.website} target="_blank" rel="noopener noreferrer">
            meteoinfo.si
          </a>{" "}
          · <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        </p>
        <a
          href={COMPANY.website}
          className="site-footer-meteoinfo-brand"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Meteoinfo"
        >
          <img
            src="/assets/meteoinfo-logo.png?v=3"
            alt="Meteoinfo"
            className="site-footer-meteoinfo-logo"
            width={180}
            height={33}
            loading="lazy"
            decoding="async"
          />
        </a>
        <nav className="legal-footer-nav" aria-label="Pravne informacije">
          {legalLinks}
          <a href={COMPANY.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
            Zasebnost Meteoinfo
          </a>
        </nav>
      </div>
    </footer>
  );
}

export function Disclaimer() {
  return (
    <aside className="disclaimer" role="note" aria-label="Opozorilo">
      <strong>Opozorilo:</strong> {DISCLAIMER_TEXT}
    </aside>
  );
}
