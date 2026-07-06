import { useStrelko } from "../context/StrelkoContext";
import { formatPlaceName } from "../lib/utils";
import { IconShield } from "./icons";

export function PreviewTeaser() {
  const { preview, selected, openAuth, openPremiumUpsell, clearSearch } = useStrelko();
  if (!preview) return null;

  const place = preview.location_label || formatPlaceName(selected?.label) || "vaša lokacija";
  const nearest = preview.nearest_km != null ? `${preview.nearest_km.toFixed(1)} km` : "—";
  const nearestDate = preview.nearest_date || "—";

  const fakeRows = Array.from({ length: 6 }, (_, i) => {
    const day = 12 - i;
    return (
      <tr key={day}>
        <td>{`2025-06-${String(day).padStart(2, "0")}`}</td>
        <td>●●</td>
        <td>●● km</td>
        <td>●●:●●</td>
      </tr>
    );
  });

  return (
    <section className="results-panel preview-teaser">
      <p className="preview-teaser-badge">Brezplačen predogled</p>
      <h3 className="results-panel-title">⚡ Strele zaznane — {place}</h3>
      <p className="preview-teaser-lead">{preview.message_sl}</p>
      <div className="stats-grid">
        <div className="stat-box">
          <div className="num">{preview.total_strikes ?? 0}</div>
          <div className="lbl">Skupaj udarov</div>
        </div>
        <div className="stat-box">
          <div className="num">{preview.days_with_strikes ?? 0}</div>
          <div className="lbl">Dni z udari</div>
        </div>
        <div className="stat-box">
          <div className="num">{nearest}</div>
          <div className="lbl">Najbližji udar</div>
        </div>
      </div>
      {preview.teaser_daily && preview.teaser_daily.length > 0 && (
        <ul className="preview-teaser-visible">
          {preview.teaser_daily.map((d) => (
            <li key={d.datum}>
              <strong>{d.datum}</strong> · {d.stevilo_strel}{" "}
              {d.stevilo_strel === 1 ? "udar" : "udarov"}
            </li>
          ))}
        </ul>
      )}
      <p className="preview-teaser-hint">
        Najbližji udarec: <strong>{nearestDate}</strong> · natančen čas in lokacije so skriti.
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
            <tbody>{fakeRows}</tbody>
          </table>
        </div>
        <div className="preview-blur-cta">
          <h4>Odklenite celoten pregled</h4>
          <p>Zemljevid udarov, natančni časi, dnevni pregled in podlaga za zavarovalnico.</p>
          <ul className="preview-blur-perks">
            <li>Interaktivni zemljevid vseh udarcev</li>
            <li>Točen čas in oddaljenost vsake strele</li>
            <li>SMS opozorila ob nevihti (Premium)</li>
          </ul>
          <div className="preview-blur-actions">
            <button type="button" className="btn btn-primary" onClick={() => openAuth("register")}>
              Registracija — 1 brezplačen pregled
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => openAuth("login")}>
              Prijava
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => openPremiumUpsell()}>
              Paketi od 4,99 €
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

  return (
    <section className="results-panel preview-teaser preview-no-strikes">
      <p className="preview-teaser-badge preview-teaser-badge--ok">Brez udarov v radiju</p>
      <h3 className="results-panel-title">✓ Brez strel — {place}</h3>
      <p className="preview-teaser-lead">{preview.message_sl}</p>
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
          <div className="num">14</div>
          <div className="lbl">Dni pregleda</div>
        </div>
      </div>
      <div className="preview-meteoalarm-offer">
        <div className="preview-meteoalarm-head">
          <IconShield />
        </div>
        <h4>Bodite pripravljeni na naslednjo nevihto</h4>
        <p>
          Trenutno ni zabeleženih udarov, a nevihte se lahko hitro približajo. Z{" "}
          <strong>MeteoAlarm</strong> SMS prejmete opozorilo ARSO, ko je v vaši okolici izdano
          vremensko opozorilo — še preden strela udari.
        </p>
        <ul className="preview-blur-perks">
          <li>SMS ob rdečem ali oranžnem MeteoAlarm opozorilu</li>
          <li>Lokacija po vaši izbiri (dom, vikend, objekt)</li>
          <li>Vključeno v paketu Premium (9,99 €/mesec)</li>
        </ul>
        <div className="preview-blur-actions">
          <button type="button" className="btn btn-primary" onClick={() => openAuth("register")}>
            Registracija — vključi opozorila
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => openAuth("login")}>
            Prijava
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => openPremiumUpsell()}>
            Paket Premium od 9,99 €
          </button>
        </div>
      </div>
      <button type="button" className="btn btn-ghost preview-teaser-back" onClick={clearSearch}>
        Nova preiskava
      </button>
    </section>
  );
}
