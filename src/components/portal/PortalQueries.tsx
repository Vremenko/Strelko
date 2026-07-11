import { TOKEN_USAGE_RULES } from "../../lib/pricing-offers";
import { PortalEmptyState } from "./PortalEmptyState";

/** Shranjene poizvedbe — en glavni panel. */
export function PortalQueries() {
  return (
    <div className="portal-panel">
      <article className="portal-card portal-card--full">
        <PortalEmptyState
          title="Še nimate shranjenih poizvedb"
          description="Ko bo backend povezan, boste tukaj videli kupljene preglede: lokacija, radij, obdobje, datum izvedbe, porabljeni žetoni, rezultat, status PDF-ja ter gumbe Odpri, Izdelaj PDF in Prenesi PDF."
        />
      </article>

      <article className="portal-card portal-card--rules">
        <h2 className="portal-card__title">Kratka pravila porabe žetonov</h2>
        <ul className="plan-features">
          {TOKEN_USAGE_RULES.map((r) => (
            <li key={r.daysLabel}>
              {r.daysLabel}: <strong>{r.tokens}</strong> {r.tokens === 1 ? "žeton" : "žetona"}
            </li>
          ))}
          <li>Prva izdelava PDF-ja: <strong>+1 žeton</strong></li>
          <li>Ponovni ogled iste poizvedbe in ponovni prenos PDF-ja: brezplačno</li>
        </ul>
      </article>
    </div>
  );
}
