import { Link } from "react-router-dom";
import { useStrelko } from "../context/StrelkoContext";
import { formatSlDecimal } from "../lib/dates";
import { portalTabPath } from "../lib/auth-intent";
import { previewInsufficientTokensNotice } from "../lib/query-billing";
import { formatPlaceName } from "../lib/utils";
import { ResultsPeriod, ResultsStats, formatResultsPeriodLabel } from "./ResultsSummary";

const FAKE_ROWS = Array.from({ length: 6 }, (_, i) => (
  <tr key={i}>
    <td>●●●●-●●-●●</td>
    <td>●●</td>
    <td>●● km</td>
    <td>●●.●●</td>
  </tr>
));

const NO_STRIKES_METEO_ALARM_SUFFIX =
  /\s*Prijavite se za MeteoAlarm SMS ob nevihtah v vaši okolici\.?\s*$/;

function previewNoStrikesLead(message: string): string {
  return message.replace(NO_STRIKES_METEO_ALARM_SUFFIX, "").trim();
}

function PreviewBlurUnlock({
  openAuth,
}: {
  openAuth: (mode: "login" | "register") => void;
}) {
  return (
    <div className="preview-blur-block">
      <div className="preview-blur-content" aria-hidden="true">
        <div className="preview-fake-map">
          <span className="preview-fake-pin" style={{ left: "22%", top: "35%" }} />
          <span className="preview-fake-pin" style={{ left: "58%", top: "48%" }} />
          <span className="preview-fake-pin" style={{ left: "41%", top: "62%" }} />
          <span className="preview-fake-radius" />
        </div>
        <table className="daily-table preview-fake-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Št. strel</th>
              <th>Najbližje</th>
              <th>Čas</th>
            </tr>
          </thead>
          <tbody>{FAKE_ROWS}</tbody>
        </table>
      </div>
      <div className="preview-blur-cta">
        <h4>Odklenite celoten pregled</h4>
        <p>Zemljevid udarov, natančni časi, dnevni pregled in podlaga za zavarovalnico.</p>
        <ul className="preview-blur-perks">
          <li>Interaktivni zemljevid vseh udarcev</li>
          <li>Točen čas in oddaljenost vsake strele</li>
          <li>PDF poročilo za zavarovalnico (paket Ob škodi)</li>
        </ul>
        <div className="preview-blur-actions">
          <button type="button" className="btn btn-primary" onClick={() => openAuth("register")}>
            Registracija — 1 brezplačen pregled
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => openAuth("login")}>
            Prijava
          </button>
          <Link to="/cenik" className="btn btn-ghost">
            Cenik in žetoni
          </Link>
        </div>
      </div>
    </div>
  );
}

function PreviewTokensUnlock() {
  return (
    <div className="preview-blur-block">
      <div className="preview-blur-content" aria-hidden="true">
        <div className="preview-fake-map">
          <span className="preview-fake-pin" style={{ left: "22%", top: "35%" }} />
          <span className="preview-fake-pin" style={{ left: "58%", top: "48%" }} />
          <span className="preview-fake-pin" style={{ left: "41%", top: "62%" }} />
          <span className="preview-fake-radius" />
        </div>
        <table className="daily-table preview-fake-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Št. strel</th>
              <th>Najbližje</th>
              <th>Čas</th>
            </tr>
          </thead>
          <tbody>{FAKE_ROWS}</tbody>
        </table>
      </div>
      <div className="preview-blur-cta">
        <h4>Odklenite celoten pregled</h4>
        <p>Zemljevid udarov, natančni časi, dnevni pregled in podlaga za zavarovalnico.</p>
        <div className="preview-blur-actions">
          <Link to={portalTabPath("narocnina")} className="btn btn-primary">
            Pridobite žetone
          </Link>
          <Link to="/cenik" className="btn btn-ghost">
            Cenik in žetoni
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PreviewTeaser() {
  const { preview, previewTokenNotice, selected, searchRadiusKm, openAuth, clearSearch } =
    useStrelko();
  if (!preview) return null;

  const limitedPreview = Boolean(previewTokenNotice);
  const place = preview.location_label || formatPlaceName(selected?.label) || "vaša lokacija";
  const nearest =
    preview.nearest_km != null ? `${formatSlDecimal(preview.nearest_km)} km` : "—";
  const periodLabel = formatResultsPeriodLabel(searchRadiusKm, preview);

  return (
    <section className="results-panel preview-teaser">
      <p className="preview-teaser-badge">
        {limitedPreview ? "Osnovni predogled" : "Brezplačen predogled"}
      </p>
      <h3 className="results-panel-title">⚡ Strele zaznane — {place}</h3>
      {limitedPreview && previewTokenNotice && (
        <p className="preview-token-notice" role="status">
          {previewInsufficientTokensNotice(
            previewTokenNotice.required_tokens,
            previewTokenNotice.available_tokens
          )}
        </p>
      )}
      <p className="preview-teaser-lead">{preview.message_sl}</p>
      <ResultsPeriod label={periodLabel} />
      <ResultsStats
        items={[
          { label: "Št. strel", value: preview.total_strikes ?? 0 },
          { label: "Št. dni s strelami", value: preview.days_with_strikes ?? 0 },
          { label: "Najbližja strela", value: nearest },
        ]}
      />
      <p className="preview-teaser-hint">
        {limitedPreview
          ? "Datumi, natančen čas in lokacije posameznih udarov niso prikazani v osnovnem predogledu."
          : "Datumi, natančen čas in lokacije posameznih udarov so skriti — odklenite jih s prijavo."}
      </p>
      {limitedPreview ? (
        <PreviewTokensUnlock />
      ) : (
        <PreviewBlurUnlock openAuth={openAuth} />
      )}
      <button type="button" className="btn btn-ghost preview-teaser-back" onClick={clearSearch}>
        Nova preiskava
      </button>
    </section>
  );
}

export function PreviewNoStrikes() {
  const { preview, previewTokenNotice, selected, searchRadiusKm, openAuth, clearSearch } =
    useStrelko();
  if (!preview) return null;

  const limitedPreview = Boolean(previewTokenNotice);
  const place = preview.location_label || formatPlaceName(selected?.label) || "vaša lokacija";
  const periodLabel = formatResultsPeriodLabel(searchRadiusKm, preview);

  return (
    <section className="results-panel preview-teaser preview-no-strikes">
      <p className="preview-teaser-badge preview-teaser-badge--ok">
        {limitedPreview ? "Osnovni predogled" : "Brez udarov v radiju"}
      </p>
      <h3 className="results-panel-title">✓ Brez strel — {place}</h3>
      {limitedPreview && previewTokenNotice && (
        <p className="preview-token-notice" role="status">
          {previewInsufficientTokensNotice(
            previewTokenNotice.required_tokens,
            previewTokenNotice.available_tokens
          )}
        </p>
      )}
      <p className="preview-teaser-lead">{previewNoStrikesLead(preview.message_sl)}</p>
      <ResultsPeriod label={periodLabel} />
      <ResultsStats
        items={[
          { label: "Št. strel", value: 0 },
          { label: "Št. dni s strelami", value: 0 },
          { label: "Najbližja strela", value: "—" },
        ]}
      />
      <p className="preview-teaser-hint">
        {limitedPreview
          ? "Datumi, natančen čas in lokacije posameznih udarov niso prikazani v osnovnem predogledu."
          : "Datumi, natančen čas in lokacije posameznih udarov so skriti — odklenite jih s prijavo."}
      </p>
      {limitedPreview ? (
        <PreviewTokensUnlock />
      ) : (
        <PreviewBlurUnlock openAuth={openAuth} />
      )}
      <button type="button" className="btn btn-ghost preview-teaser-back" onClick={clearSearch}>
        Nova preiskava
      </button>
    </section>
  );
}
