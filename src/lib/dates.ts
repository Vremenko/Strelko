function parseIsoDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(String(iso).includes("T") ? iso : `${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatSlDate(iso: string | null | undefined): string {
  const d = parseIsoDate(iso);
  if (!d) return iso ? String(iso) : "—";
  return d.toLocaleDateString("sl-SI", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatSlDayMonth(iso: string): string {
  const d = parseIsoDate(iso);
  if (!d) return iso ? String(iso) : "—";
  return d.toLocaleDateString("sl-SI", { day: "numeric", month: "long" });
}

function formatSlDay(iso: string): string {
  const d = parseIsoDate(iso);
  if (!d) return iso ? String(iso) : "—";
  return d.toLocaleDateString("sl-SI", { day: "numeric" });
}

function formatSlMonthYear(iso: string): string {
  const d = parseIsoDate(iso);
  if (!d) return iso ? String(iso) : "—";
  const month = d.toLocaleDateString("sl-SI", { month: "long" });
  return `${month} ${d.getFullYear()}`;
}

export function formatSlDateRange(fromIso: string, toIso: string): string {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIso);
  if (!from && !to) return "—";
  if (!from) return formatSlDate(toIso);
  if (!to) return formatSlDate(fromIso);
  if (from.getFullYear() === to.getFullYear()) {
    if (from.getMonth() === to.getMonth()) {
      return `${formatSlDay(fromIso)} – ${formatSlDay(toIso)} ${formatSlMonthYear(toIso)}`;
    }
    return `${formatSlDayMonth(fromIso)} – ${formatSlDayMonth(toIso)} ${to.getFullYear()}`;
  }
  return `${formatSlDate(fromIso)} – ${formatSlDate(toIso)}`;
}

export function formatSlDecimal(value: number | null | undefined, decimals = 1): string {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return Number(value).toFixed(decimals).replace(".", ",");
}
