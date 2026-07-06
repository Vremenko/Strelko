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
      <p>
        &copy; {year} <strong>{COMPANY.shortName}</strong> · Strelko
      </p>
      <p>
        <a href={COMPANY.website} target="_blank" rel="noopener noreferrer">
          meteoinfo.si
        </a>{" "}
        · <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>
      <nav className="legal-footer-nav" aria-label="Pravne informacije">
        {legalLinks}
        <a href={COMPANY.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
          Politika zasebnosti Meteoinfo
        </a>
      </nav>
      <p className="site-footer-source">
        Vir podatkov o udarih strel:{" "}
        <a href="https://meteo.hr/" target="_blank" rel="noopener noreferrer">
          DHMZ (meteo.hr)
        </a>
      </p>
    </footer>
  );
}

export function Disclaimer() {
  return (
    <aside className="disclaimer">
      <strong>Opozorilo:</strong> Prikazani podatki so izključno informativne narave in se lahko
      razlikujejo od uradnih evidenc. Meteoinfo d.o.o. ne prevzema odgovornosti za odločitve
      zavarovalnic ali točnost podatkov v posameznem primeru. Za uradne postopke se obrnite na
      pristojne institucije in zavarovalnico.
    </aside>
  );
}
