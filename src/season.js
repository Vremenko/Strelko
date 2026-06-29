/** Sezonski koledar Strelko (1. 3. – 31. 10.) — usklajeno z backendom. */
export function isLightningSeason(d = new Date()) {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (m < 3) return false;
  if (m > 10) return false;
  if (m === 3 && day < 1) return false;
  return true;
}

export function isArchiveFreeForAll(d = new Date()) {
  return !isLightningSeason(d);
}

export function seasonLabelSl(d = new Date()) {
  const y = d.getFullYear();
  const endYear = d.getMonth() + 1 > 10 ? y + 1 : y;
  const startYear = endYear - 1;
  return `1. 3. ${startYear} – 31. 10. ${endYear}`;
}

/** Začasno: celoten dostop brez prijave (VITE_STRELKO_OPEN_ACCESS=1 ob buildu). */
export const STRELKO_OPEN_ACCESS =
  import.meta.env.VITE_STRELKO_OPEN_ACCESS === "1" ||
  import.meta.env.VITE_STRELKO_OPEN_ACCESS === "true";

export function hasArchiveFullAccess(credits, plansMeta) {
  if (STRELKO_OPEN_ACCESS) return true;
  if (plansMeta?.archive_free_now || isArchiveFreeForAll()) return true;
  if (credits?.archive_full_access) return true;
  return false;
}
