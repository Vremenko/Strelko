import { Link } from "react-router-dom";
import { COMPANY, LEGAL_PAGES } from "../../lib/legal";

export function Footer() {
  const year = new Date().getFullYear();
  const legalLinks = Object.entries(LEGAL_PAGES).map(([id, page]) => (
    <Link key={id} to={page.path}>
      {page.title}
    </Link>
  ));

  return (
    <footer className="site-footer">
      <div className="site-footer-row site-footer-row--top">
        <p className="site-footer-copy">
          &copy; {year} <strong>{COMPANY.shortName}</strong> · Strelko
        </p>
        <p className="site-footer-contact">
          <a href={COMPANY.website} target="_blank" rel="noopener noreferrer">
            meteoinfo.si
          </a>{" "}
          · <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        </p>
      </div>
      <nav className="legal-footer-nav" aria-label="Pravne informacije">
        {legalLinks}
        <a href={COMPANY.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
          Politika zasebnosti Meteoinfo
        </a>
      </nav>
    </footer>
  );
}

export function Disclaimer() {
  return (
    <aside className="disclaimer" role="note" aria-label="Opozorilo">
      <strong>Opozorilo:</strong> Podatki so informativne narave in se lahko razlikujejo od uradnih
      evidenc. Meteoinfo d.o.o. ne prevzema odgovornosti za odločitve zavarovalnic ali morebitna
      odstopanja v podatkih. Za uradne postopke se obrnite na svojo zavarovalnico oziroma druge
      pristojne institucije.
    </aside>
  );
}
