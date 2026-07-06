import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { StrikeMap } from "./StrikeMap";
import { HourlyChartPanel } from "./HourlyChartPanel";
import { useStrelko } from "../context/StrelkoContext";
import { formatSlDateRange } from "../lib/dates";
import type { HourlyChartData, StrikePoint } from "../types";

export function ResultsView({ zavarovalnica = false }: { zavarovalnica?: boolean }) {
  const { searchResult, credits, downloadPdf, clearSearch } = useStrelko();
  const [selectedMapDay, setSelectedMapDay] = useState<string | null>(null);
  const [mapStrikes, setMapStrikes] = useState<StrikePoint[]>([]);
  const [hourlyChartDay, setHourlyChartDay] = useState<string | null>(null);
  const [hourlyChartLoading, setHourlyChartLoading] = useState(false);
  const [hourlyChartData, setHourlyChartData] = useState<HourlyChartData | null>(null);
  const cacheRef = useRef<{ period: StrikePoint[] | null; days: Record<string, StrikePoint[]> }>({
    period: null,
    days: {},
  });

  const loadMapStrikes = useCallback(
    async (day: string | null) => {
      const r = searchResult;
      if (!r) return [];
      if (day) {
        if (cacheRef.current.days[day]) return cacheRef.current.days[day];
        const strikes = await api.dayStrikes({
          lat: r.lat,
          lon: r.lon,
          radius_km: r.radius_km,
          datum: day,
        });
        cacheRef.current.days[day] = strikes;
        return strikes;
      }
      if (cacheRef.current.period) return cacheRef.current.period;
      const initial = r.strikes || [];
      if (initial.length >= r.total_strikes) {
        cacheRef.current.period = initial;
        return initial;
      }
      const strikes = await api.periodStrikes({
        lat: r.lat,
        lon: r.lon,
        radius_km: r.radius_km,
        date_from: r.date_from,
        date_to: r.date_to,
      });
      cacheRef.current.period = strikes;
      return strikes;
    },
    [searchResult]
  );

  useEffect(() => {
    if (!searchResult) return;
    cacheRef.current = { period: null, days: {} };
    setSelectedMapDay(null);
    setHourlyChartDay(null);
    setHourlyChartData(null);
    void loadMapStrikes(null).then(setMapStrikes);
  }, [searchResult, loadMapStrikes]);

  useEffect(() => {
    if (!searchResult) return;
    void loadMapStrikes(selectedMapDay).then(setMapStrikes);
  }, [selectedMapDay, searchResult, loadMapStrikes]);

  const toggleHourlyChart = async (day: string) => {
    if (hourlyChartDay === day && !hourlyChartLoading) {
      setHourlyChartDay(null);
      setHourlyChartData(null);
      return;
    }
    if (!searchResult) return;
    setHourlyChartDay(day);
    setHourlyChartLoading(true);
    setHourlyChartData(null);
    try {
      const data = await api.dayHourly({
        lat: searchResult.lat,
        lon: searchResult.lon,
        radius_km: searchResult.radius_km,
        datum: day,
      });
      setHourlyChartData(data);
    } catch (e) {
      setHourlyChartDay(null);
      alert((e as Error).message || "Urni profil ni na voljo.");
    } finally {
      setHourlyChartLoading(false);
    }
  };

  if (!searchResult) return null;

  const r = searchResult;
  const panelClass = zavarovalnica ? " results-panel--zavarovalnica" : "";
  const backTo = zavarovalnica ? "/pomoc-pri-zavarovalnici" : "/";

  return (
    <section className={`results-panel${panelClass}`}>
      <h3 className="results-panel-title">
        ⚡ Pregled strel – {r.location_label || "vaša lokacija"}
      </h3>
      <div className="stats-grid">
        <div className="stat-box">
          <div className="num">{r.total_strikes}</div>
          <div className="lbl">Skupaj udarov</div>
        </div>
        <div className="stat-box">
          <div className="num">{r.daily.length}</div>
          <div className="lbl">Dni z udari</div>
        </div>
        <div className="stat-box">
          <div className="num">{r.credits_remaining}</div>
          <div className="lbl">Preostali krediti</div>
        </div>
      </div>
      <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
        Obdobje: {formatSlDateRange(r.date_from, r.date_to)} · radij {r.radius_km} km
      </p>
      <StrikeMap lat={r.lat} lon={r.lon} radiusKm={r.radius_km} strikes={mapStrikes} />
      <div id="hourly-chart-slot">
        {hourlyChartDay && (
          <HourlyChartPanel
            day={hourlyChartDay}
            loading={hourlyChartLoading}
            data={hourlyChartData}
            onClose={() => {
              setHourlyChartDay(null);
              setHourlyChartData(null);
            }}
          />
        )}
      </div>
      <div className="daily-table-scroll">
        <table className="daily-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Št. strel</th>
              <th>Najbližje</th>
              <th>Čas najbližje</th>
              <th>Urni graf</th>
            </tr>
          </thead>
          <tbody>
            {r.daily.length ? (
              r.daily.map((d) => {
                const selected = selectedMapDay === d.datum;
                const hourlyActive = hourlyChartDay === d.datum;
                const showHourly = d.stevilo_strel > 0;
                return (
                  <tr
                    key={d.datum}
                    data-day={d.datum}
                    className={selected ? "daily-row--selected" : ""}
                    aria-pressed={selected}
                    onClick={() =>
                      setSelectedMapDay((prev) => (prev === d.datum ? null : d.datum))
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <td>{d.datum}</td>
                    <td>{d.stevilo_strel}</td>
                    <td>
                      {d.oddaljenost_najblizje_km != null
                        ? `${d.oddaljenost_najblizje_km.toFixed(1)} km`
                        : "—"}
                    </td>
                    <td>
                      {d.cas_najblizje_strele
                        ? new Date(d.cas_najblizje_strele).toLocaleString("sl-SI")
                        : "—"}
                    </td>
                    <td className="daily-row-hourly" onClick={(e) => e.stopPropagation()}>
                      {showHourly ? (
                        <button
                          type="button"
                          className={`btn btn-ghost btn-sm btn-hourly-chart${hourlyActive ? " btn-hourly-chart--active" : ""}`}
                          data-day={d.datum}
                          onClick={() => void toggleHourlyChart(d.datum)}
                        >
                          graf
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5}>Ni dnevnih zapisov</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="results-actions">
        {credits?.pdf_reports_available ? (
          <button type="button" className="btn btn-primary" onClick={() => void downloadPdf()}>
            Prenesi PDF poročilo
          </button>
        ) : (
          <p className="pdf-upsell">
            PDF poročilo za zavarovalnico je na voljo v paketu <strong>Poslovni</strong>.
          </p>
        )}
        <Link to={backTo} className="btn btn-ghost" onClick={clearSearch}>
          Nova preiskava
        </Link>
      </div>
    </section>
  );
}
