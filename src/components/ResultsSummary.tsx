import type { ReactNode } from "react";
import { formatPreviewPeriod, formatSlDateRange } from "../lib/dates";

export function formatResultsPeriodLabel(
  radiusKm: number,
  dates?: { date_from?: string; date_to?: string; period_days?: number }
): string {
  if (dates?.date_from && dates?.date_to) {
    return `Obdobje: ${formatSlDateRange(dates.date_from, dates.date_to)} · radij ${radiusKm} km`;
  }
  return `Obdobje: ${formatPreviewPeriod(dates ?? {})} · radij ${radiusKm} km`;
}

export interface ResultsStatItem {
  label: string;
  value: ReactNode;
}

export function ResultsPeriod({ label }: { label: string }) {
  return <p className="results-period">{label}</p>;
}

export function ResultsStats({ items }: { items: ResultsStatItem[] }) {
  return (
    <div className="stats">
      {items.map((item) => (
        <div className="stat" key={item.label}>
          <div className="label">{item.label}</div>
          <div className="value">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
