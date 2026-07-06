import { useEffect, useRef } from "react";
import { destroyHourlyChart, mountHourlyChart } from "../lib/hourlyChart";
import { formatSlDate } from "../lib/dates";
import type { HourlyChartData } from "../types";

interface HourlyChartPanelProps {
  day: string;
  loading: boolean;
  data: HourlyChartData | null;
  onClose: () => void;
}

export function HourlyChartPanel({ day, loading, data, onClose }: HourlyChartPanelProps) {
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
    <div className="hourly-chart-panel embed-hourly-panel" id="hourly-chart-panel">
      <div className="hourly-chart-head">
        <h4>Urni profil – {formatSlDate(day)}</h4>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
          Zapri
        </button>
      </div>
      {loading ? (
        <p className="hourly-chart-loading">Nalagam urni profil …</p>
      ) : (
        <>
          <div className="hourly-chart-stats stats" ref={statsRef} id="hourly-chart-stats" />
          <div className="hourly-chart-wrap chart-wrap" ref={wrapRef} id="hourly-chart-wrap">
            <canvas id="hourly-strike-chart" ref={canvasRef} />
          </div>
        </>
      )}
    </div>
  );
}
