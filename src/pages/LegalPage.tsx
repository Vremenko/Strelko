import { Link } from "react-router-dom";
import { COMPANY, LEGAL_PAGES, type LegalPageId } from "../lib/legal";

export function LegalPage({ pageId }: { pageId: LegalPageId }) {
  const page = LEGAL_PAGES[pageId];

  const nav = Object.entries(LEGAL_PAGES).map(([id, p]) => (
    <Link
      key={id}
      to={p.path}
      className={`legal-nav-link${id === pageId ? " is-active" : ""}`}
    >
      {p.title}
    </Link>
  ));

  return (
    <article className="legal-page page--standard">
      <header className="page-header">
        <h1 className="legal-title">{page.title}</h1>
        <p className="legal-meta">Zadnja posodobitev: {COMPANY.updated}</p>
        <nav className="legal-nav" aria-label="Pravne informacije">
          {nav}
        </nav>
      </header>
      <div className="legal-card">
        {page.sections.map((s) => (
          <section className="legal-section" key={s.title}>
            <h2>{s.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: s.body }} />
          </section>
        ))}
      </div>
    </article>
  );
}
