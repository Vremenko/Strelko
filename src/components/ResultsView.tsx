import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { ErrorBoundary } from "./ErrorBoundary";
import { HourlyChartPanel } from "./HourlyChartPanel";
import { ResultsWidgetPanel } from "./ResultsWidgetPanel";
import { StrikeMap } from "./StrikeMap";
import { PdfDownloadPanel } from "./PdfDownloadPanel";
import { useStrelko } from "../context/StrelkoContext";
import { ResultsPeriod, ResultsStats, formatResultsPeriodLabel } from "./ResultsSummary";
import { formatSlDate, formatSlDecimal, formatSlTime } from "../lib/dates";
import { HOURLY_PROFILE_MIN_STRIKES } from "../lib/search-dates";
import type { DailyStrike, HourlyChartData, StrikePoint } from "../types";

function nearestStrikeKm(daily: DailyStrike[]): number | null {
  return daily.reduce<number | null>((min, row) => {
    const km = row.oddaljenost_najblizje_km;
    if (km == null) return min;
    if (min == null || km < min) return km;
    return min;
  }, null);
}

function dayKey(datum: string): string {
  return String(datum).slice(0, 10);
}

export function ResultsView({ zavarovalnica = false }: { zavarovalnica?: boolean }) {
  const {
    searchResult,
    savedQueryId,
    activeQueryPdf,
    credits,
    downloadPdf,
    clearSearch,
    pdfDownloading,
    pdfDownloadError,
  } = useStrelko();
  const [selectedMapDay, setSelectedMapDay] = useState<string | null>(null);
  const [mapStrikes, setMapStrikes] = useState<StrikePoint[]>([]);
  const [hourlyChartDay, setHourlyChartDay] = useState<string | null>(null);
  const [hourlyChartLoading, setHourlyChartLoading] = useState(false);
  const [hourlyChartData, setHourlyChartData] = useState<HourlyChartData | null>(null);
  const hourlyPanelRef = useRef<HTMLDivElement>(null);
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
      requestAnimationFrame(() => {
        hourlyPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    } catch (e) {
      setHourlyChartDay(null);
      alert((e as Error).message || "Urni profil ni na voljo.");
    } finally {
      setHourlyChartLoading(false);
    }
  };

  const toggleMapDay = (datum: string) => {
    const key = dayKey(datum);
    setSelectedMapDay((prev) => (prev === key ? null : key));
  };

  if (!searchResult) return null;

  const r = searchResult;
  const panelClass = zavarovalnica ? " results-panel--zavarovalnica" : "";
  const backTo = zavarovalnica ? "/pomoc-pri-zavarovalnici" : "/";
  const daily = Array.isArray(r.daily) ? r.daily : [];
  const nearestKm = nearestStrikeKm(daily);
  const periodLabel = formatResultsPeriodLabel(r.radius_km, {
    date_from: r.date_from,
    date_to: r.date_to,
  });
  const showPdf =
    Boolean(savedQueryId) &&
    activeQueryPdf != null &&
    activeQueryPdf.queryId === savedQueryId;

  return (
    <section className={`results-panel${panelClass}`}>
      <h3 className="results-panel-title">
        ⚡ Pregled strel – {r.location_label || "vaša lokacija"}
      </h3>
      <ResultsPeriod label={periodLabel} />
      <ResultsStats
        items={[
          { label: "Št. strel", value: r.total_strikes },
          { label: "Št. dni s strelami", value: daily.length },
          {
            label: "Najbližja strela",
            value: nearestKm != null ? `${formatSlDecimal(nearestKm)} km` : "—",
          },
        ]}
      />
      {!daily.length && (
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Za izbrano obdobje ni bilo najdenih podatkov o udarih strel.
        </p>
      )}
      {!zavarovalnica && <ResultsWidgetPanel />}
      <div className="strike-map-block">
        <ErrorBoundary>
          <StrikeMap
            lat={r.lat}
            lon={r.lon}
            radiusKm={r.radius_km}
            strikes={mapStrikes}
            refit={selectedMapDay != null}
          />
        </ErrorBoundary>
      </div>
      <p className="daily-table-hint">
        Kliknite na vrstico dneva za prikaz udarov na zemljevidu. Ponovni klik prikaže vse dni. Pri
        več kot {HOURLY_PROFILE_MIN_STRIKES} udarih na dan je na voljo urni profil.
      </p>
      <div className="daily-table-scroll">
        <table className="daily-table">
          <thead>
            <tr>
              <th>Datum</th>
              <th>Št. strel</th>
              <th>Najbližje</th>
              <th>Čas najbližje</th>
              <th>Profil</th>
            </tr>
          </thead>
          <tbody>
            {daily.length ? (
              daily.map((d) => {
                const key = dayKey(d.datum);
                const selected = selectedMapDay === key;
                const hourlyActive = hourlyChartDay === key;
                const showHourly = d.stevilo_strel > HOURLY_PROFILE_MIN_STRIKES;
                return (
                  <tr
                    key={key}
                    className={`daily-row${selected ? " daily-row--selected" : ""}`}
                    data-day={key}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selected}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest(".btn-hourly-chart")) return;
                      toggleMapDay(d.datum);
                    }}
                    onKeyDown={(e) => {
                      if ((e.target as HTMLElement).closest(".btn-hourly-chart")) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleMapDay(d.datum);
                      }
                    }}
                  >
                    <td>{formatSlDate(d.datum)}</td>
                    <td>{d.stevilo_strel}</td>
                    <td>
                      {d.oddaljenost_najblizje_km != null
                        ? `${formatSlDecimal(d.oddaljenost_najblizje_km)} km`
                        : "—"}
                    </td>
                    <td>
                      {d.cas_najblizje_strele ? formatSlTime(d.cas_najblizje_strele) : "—"}
                    </td>
                    <td className="daily-row-hourly" onClick={(e) => e.stopPropagation()}>
                      {showHourly ? (
                        <button
                          type="button"
                          className={`btn btn-ghost btn-sm btn-hourly-chart${hourlyActive ? " btn-hourly-chart--active" : ""}`}
                          data-day={key}
                          onClick={() => void toggleHourlyChart(key)}
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
                <td colSpan={5}>
                  Za izbrano obdobje ni bilo najdenih podatkov o udarih strel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div id="hourly-chart-slot" ref={hourlyPanelRef}>
        {hourlyChartDay && (
          <HourlyChartPanel
            day={hourlyChartDay}
            loading={hourlyChartLoading}
            data={hourlyChartData}
          />
        )}
      </div>
      <div className="results-actions">
        {showPdf && activeQueryPdf && (
          <PdfDownloadPanel
            pdfTokensCost={activeQueryPdf.pdf_tokens_cost}
            pdfButtonLabel={activeQueryPdf.pdf_button_label}
            pdfCostHint={activeQueryPdf.pdf_cost_hint}
            creditsBalance={credits?.credits_balance ?? null}
            downloading={pdfDownloading}
            onDownload={() => void downloadPdf()}
            errorMessage={pdfDownloadError}
          />
        )}
        <Link to={backTo} className="btn btn-ghost" onClick={clearSearch}>
          Nova poizvedba
        </Link>
      </div>
    </section>
  );
}
