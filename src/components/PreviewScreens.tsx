import { useStrelko } from "../context/StrelkoContext";
import { formatPreviewPeriod, formatSlDecimal } from "../lib/dates";
import { SEARCH_PERIOD_DAYS } from "../lib/search-dates";
import { formatPlaceName } from "../lib/utils";
import { IconMap } from "./icons";
import { ResultsPeriod, ResultsStats, formatResultsPeriodLabel } from "./ResultsSummary";

const FAKE_ROWS = Array.from({ length: 6 }, (_, i) => (
  <tr key={i}>
    <td>●●●●-●●-●●</td>
    <td>●●</td>
    <td>●● km</td>
    <td>●●.●●</td>
  </tr>
));

export function PreviewTeaser() {
  const { preview, selected, searchRadiusKm, openAuth, openPremiumUpsell, clearSearch } =
    useStrelko();
  if (!preview) return null;

  const place = preview.location_label || formatPlaceName(selected?.label) || "vaša lokacija";
  const nearest =
    preview.nearest_km != null ? `${formatSlDecimal(preview.nearest_km)} km` : "—";
  const periodLabel = formatResultsPeriodLabel(searchRadiusKm, preview);

  return (
    <section className="results-panel preview-teaser">
      <p className="preview-teaser-badge">Brezplačen predogled</p>
      <h3 className="results-panel-title">⚡ Strele zaznane — {place}</h3>
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
        Datumi, natančen čas in lokacije posameznih udarov so skriti — odklenite jih s prijavo.
      </p>
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
            <button type="button" className="btn btn-ghost" onClick={() => openPremiumUpsell()}>
              Paketi od 4,50 € (vklj. DDV)
            </button>
          </div>
        </div>
      </div>
      <button type="button" className="btn btn-ghost preview-teaser-back" onClick={clearSearch}>
        Nova preiskava
      </button>
    </section>
  );
}

export function PreviewNoStrikes() {
  const { preview, selected, searchRadiusKm, openAuth, openPremiumUpsell, clearSearch } =
    useStrelko();
  if (!preview) return null;

  const place = preview.location_label || formatPlaceName(selected?.label) || "vaša lokacija";
  const periodLabel = formatPreviewPeriod(preview);
  const periodDays = preview.period_days ?? SEARCH_PERIOD_DAYS;

  return (
    <section className="results-panel preview-teaser preview-no-strikes">
      <p className="preview-teaser-badge preview-teaser-badge--ok">Brez udarov v radiju</p>
      <h3 className="results-panel-title">✓ Brez strel — {place}</h3>
      <p className="preview-teaser-lead">{preview.message_sl}</p>
      <p className="preview-teaser-period">
        Obdobje pregleda: <strong>{periodLabel}</strong> · radij{" "}
        <strong>{searchRadiusKm} km</strong>
      </p>
      <div className="stats-grid">
        <div className="stat-box">
          <div className="num">0</div>
          <div className="lbl">Udarov v obdobju</div>
        </div>
        <div className="stat-box">
          <div className="num">{searchRadiusKm} km</div>
          <div className="lbl">Preverjen radij</div>
        </div>
        <div className="stat-box">
          <div className="num">{periodDays}</div>
          <div className="lbl">Dni pregleda</div>
        </div>
      </div>
      <div className="preview-archive-offer">
        <div className="preview-archive-head">
          <IconMap />
        </div>
        <h4>Statistika strel v Sloveniji</h4>
        <p>
          Spremljajte sezonski potek udarov in primerjajte regije. Med sezono odklenite polni
          arhiv s paketom <strong>Podpornik</strong> — pozimi (nov–feb) je statistika brezplačna
          za vse.
        </p>
        <ul className="preview-blur-perks">
          <li>Dnevni in urni profil strel po Sloveniji</li>
          <li>Widget za vašo spletno stran (Podpornik)</li>
          <li>5 podrobnih pregledov lokacije na sezono</li>
        </ul>
        <div className="preview-blur-actions">
          <button type="button" className="btn btn-primary" onClick={() => openAuth("register")}>
            Registracija — 1 brezplačen pregled
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => openAuth("login")}>
            Prijava
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => openPremiumUpsell()}>
            Paket Podpornik 8,50 €
          </button>
        </div>
      </div>
      <button type="button" className="btn btn-ghost preview-teaser-back" onClick={clearSearch}>
        Nova preiskava
      </button>
    </section>
  );
}
