/**
 * Preveri zaokroževanje ocenjenega časa udara (Europe/Ljubljana, 5 min).
 * Zagon: npx tsx scripts/check-estimated-strike-time.ts
 */
import {
  ESTIMATED_STRIKE_TIME_LABEL,
  ESTIMATED_STRIKE_TIME_NOTE,
  formatEstimatedStrikeDateTime,
  formatEstimatedStrikeTime,
  getLjubljanaParts,
  roundEstimatedStrikeInstant,
} from "../src/lib/estimated-strike-time.ts";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

function eq(actual: string, expected: string, label: string) {
  assert(actual === expected, `${label}: expected ${expected}, got ${actual}`);
}

// User examples (local wall clock as if already Ljubljana wall → use UTC offset)
// July CEST = UTC+2: local 12.16 = UTC 10:16
eq(formatEstimatedStrikeTime("2026-07-19T10:16:00Z"), "12.15", "12.16→12.15");
eq(formatEstimatedStrikeTime("2026-07-19T10:21:00Z"), "12.20", "12.21→12.20");
eq(formatEstimatedStrikeTime("2026-07-19T10:24:00Z"), "12.25", "12.24→12.25");
eq(formatEstimatedStrikeTime("2026-07-19T10:58:00Z"), "13.00", "12.58→13.00");

// Already on boundary
eq(formatEstimatedStrikeTime("2026-07-19T10:15:00Z"), "12.15", "boundary 12.15");
eq(formatEstimatedStrikeTime("2026-07-19T10:20:00Z"), "12.20", "boundary 12.20");

// Hour rollover
eq(formatEstimatedStrikeTime("2026-07-19T10:58:00Z"), "13.00", "hour rollover");

// Winter CET UTC+1: local 12.16 = UTC 11:16
eq(formatEstimatedStrikeTime("2026-01-15T11:16:00Z"), "12.15", "winter CET");

// Day rollover CEST: local 00.58 next day from UTC 21:58?
// 21:58 UTC July = 23:58 CEST → rounds to 00.00 next day
eq(formatEstimatedStrikeTime("2026-07-19T21:58:00Z"), "00.00", "day rollover time");
eq(
  formatEstimatedStrikeDateTime("2026-07-19T21:58:00Z"),
  "20. julij 2026, 00.00",
  "day rollover date"
);

// Year/month rollover: 2025-12-31 22:58 UTC = 23:58 CET → 1. januar 2026, 00.00
eq(
  formatEstimatedStrikeDateTime("2025-12-31T22:58:00Z"),
  "1. januar 2026, 00.00",
  "year rollover"
);

// Labels
assert(ESTIMATED_STRIKE_TIME_LABEL === "Ocenjeni čas udara", "label");
assert(ESTIMATED_STRIKE_TIME_NOTE.includes("zaokroženi na 5 minut"), "note");

// No unrounded minutes in formatter output for sample grid
for (const iso of [
  "2026-07-19T10:16:00Z",
  "2026-07-19T10:21:00Z",
  "2026-07-19T10:06:00Z",
]) {
  const t = formatEstimatedStrikeTime(iso);
  const min = Number(t.split(".")[1]);
  assert(min % 5 === 0, `minute must be multiple of 5: ${t}`);
}

// Instant timezone stays consistent
const r = roundEstimatedStrikeInstant("2026-07-19T10:16:00Z");
assert(r, "round returns date");
const p = getLjubljanaParts(r!);
assert(p.hour === 12 && p.minute === 15 && p.second === 0, "parts after round");

console.log("check-estimated-strike-time: OK");
