import { useEffect, useRef } from "react";
import { destroyHourlyChart, mountHourlyChart } from "../lib/hourlyChart";
import { formatSlDate } from "../lib/dates";
import type { HourlyChartData } from "../types";

interface HourlyChartPanelProps {
  day: string;
  loading: boolean;
  data: HourlyChartData | null;
}

export function HourlyChartPanel({ day, loading, data }: HourlyChartPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || !data?.hours) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    mountHourlyChart({
      canvas,
      statsEl: statsRef.current,
      wrapEl: wrapRef.current,
      hours: data.hours,
    });
    return () => destroyHourlyChart();
  }, [loading, data, day]);

  return (
    <section className="panel results-hourly-panel" id="hourly-chart-panel">
      <div className="panel-head">
        <h2 className="panel-head-title">Urni profil</h2>
        <p className="panel-period">{formatSlDate(day)}</p>
      </div>
      {loading ? (
        <p className="hourly-chart-loading">Nalagam urni profil …</p>
      ) : (
        <>
          <div className="stats" ref={statsRef} id="hourly-chart-stats" />
          <div className="chart-wrap hourly-chart-wrap" ref={wrapRef} id="hourly-chart-wrap">
            <canvas id="hourly-strike-chart" ref={canvasRef} />
          </div>
        </>
      )}
    </section>
  );
}
