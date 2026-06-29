function parseIsoDate(iso) {
  if (!iso) return null;
  const d = new Date(String(iso).includes("T") ? iso : `${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatSlDate(iso) {
  const d = parseIsoDate(iso);
  if (!d) return iso ? String(iso) : "—";
  return d.toLocaleDateString("sl-SI", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatSlDayMonth(iso) {
  const d = parseIsoDate(iso);
  if (!d) return iso ? String(iso) : "—";
  return d.toLocaleDateString("sl-SI", {
    day: "numeric",
    month: "long",
  });
}

function formatSlDay(iso) {
  const d = parseIsoDate(iso);
  if (!d) return iso ? String(iso) : "—";
  return d.toLocaleDateString("sl-SI", { day: "numeric" });
}

function formatSlMonthYear(iso) {
  const d = parseIsoDate(iso);
  if (!d) return iso ? String(iso) : "—";
  const month = d.toLocaleDateString("sl-SI", { month: "long" });
  return `${month} ${d.getFullYear()}`;
}

/** Dva datuma: leto samo pri končnem; isti mesec brez ponavljanja meseca. */
export function formatSlDateRange(fromIso, toIso) {
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

export function toLocalIsoDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatSlDecimal(value, decimals = 1) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return Number(value).toFixed(decimals).replace(".", ",");
}

export function formatSlKm(value, decimals = 1) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `${formatSlDecimal(value, decimals)} km`;
}

function formatSlTime(d) {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}.${m}`;
}

export function formatSlDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return `${formatSlDate(iso)}, ${formatSlTime(d)}`;
}
