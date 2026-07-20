/** Ocenjeni čas udara: pretvorba v Europe/Ljubljana, nato zaokrožitev na 5 min (samo prikaz). */

export const LJUBLJANA_TZ = "Europe/Ljubljana";

export const ESTIMATED_STRIKE_TIME_LABEL = "Ocenjeni čas udara";

export const ESTIMATED_STRIKE_TIME_NOTE =
  "Časi posameznih udarov so ocenjeni na podlagi razpoložljivih podatkov in zaokroženi na 5 minut.";

export type LjubljanaParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function parseIsoDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(String(iso).includes("T") ? iso : `${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function getLjubljanaParts(instant: Date): LjubljanaParts {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: LJUBLJANA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);

  const n = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);

  return {
    year: n("year"),
    month: n("month"),
    day: n("day"),
    hour: n("hour"),
    minute: n("minute"),
    second: n("second"),
  };
}

/** UTC instant, ki se v Europe/Ljubljana prikaže kot y-m-d h:m:00. */
export function ljubljanaWallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): Date {
  let utc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  for (let i = 0; i < 4; i++) {
    const p = getLjubljanaParts(utc);
    const wanted = Date.UTC(year, month - 1, day, hour, minute);
    const actual = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    const diffMs = wanted - actual;
    if (diffMs === 0) break;
    utc = new Date(utc.getTime() + diffMs);
  }
  return utc;
}

/**
 * Zaokroži ocenjeni čas udara na najbližjih 5 minut v Europe/Ljubljana.
 * Vrne UTC instant zaokroženega lokalnega časa (sekunde = 0).
 */
export function roundEstimatedStrikeInstant(iso: string | null | undefined): Date | null {
  const d = parseIsoDate(iso);
  if (!d) return null;
  const p = getLjubljanaParts(d);
  const totalMin = p.hour * 60 + p.minute + p.second / 60;
  let rounded = Math.round(totalMin / 5) * 5;
  let day = p.day;
  let month = p.month;
  let year = p.year;

  if (rounded >= 24 * 60) {
    rounded -= 24 * 60;
    const next = new Date(Date.UTC(year, month - 1, day + 1));
    year = next.getUTCFullYear();
    month = next.getUTCMonth() + 1;
    day = next.getUTCDate();
  } else if (rounded < 0) {
    rounded += 24 * 60;
    const prev = new Date(Date.UTC(year, month - 1, day - 1));
    year = prev.getUTCFullYear();
    month = prev.getUTCMonth() + 1;
    day = prev.getUTCDate();
  }

  const hour = Math.floor(rounded / 60);
  const minute = rounded % 60;
  return ljubljanaWallTimeToUtc(year, month, day, hour, minute);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatEstimatedStrikeTime(iso: string | null | undefined): string {
  const rounded = roundEstimatedStrikeInstant(iso);
  if (!rounded) return "—";
  const p = getLjubljanaParts(rounded);
  return `${pad2(p.hour)}.${pad2(p.minute)}`;
}

export function formatEstimatedStrikeDate(iso: string | null | undefined): string {
  const rounded = roundEstimatedStrikeInstant(iso);
  if (!rounded) return iso ? String(iso) : "—";
  return rounded.toLocaleDateString("sl-SI", {
    timeZone: LJUBLJANA_TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatEstimatedStrikeDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const rounded = roundEstimatedStrikeInstant(iso);
  if (!rounded) return String(iso);
  return `${formatEstimatedStrikeDate(iso)}, ${formatEstimatedStrikeTime(iso)}`;
}
