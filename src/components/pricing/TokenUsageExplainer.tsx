import { TOKEN_USAGE_EXAMPLES } from "../../lib/pricing-offers";

const CENIK_TOKEN_EXAMPLES = TOKEN_USAGE_EXAMPLES.slice(0, 3);

export function TokenUsageExplainer() {
  return (
    <section className="pricing-token-explainer legal-card">
      <h2 className="pricing-section-title">Kako delujejo žetoni</h2>
      <p className="pricing-section-lead">
        Poraba je odvisna od dolžine obdobja poizvedbe (največ 30 dni) in morebitne prve izdelave
        PDF-poročila. Pravila so navedena v kartici Ob škodi.
      </p>
      <ul className="pricing-examples-list">
        {CENIK_TOKEN_EXAMPLES.map((ex) => (
          <li key={ex.title}>
            <strong>{ex.title}:</strong> {ex.detail}
          </li>
        ))}
      </ul>
      <p className="pricing-section-note">
        Druga lokacija ali sprememba obdobja oziroma radija pomeni novo poizvedbo in novo porabo
        žetonov.
      </p>
    </section>
  );
}
