export function isLightningSeason(d = new Date()): boolean {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (m < 3) return false;
  if (m > 10) return false;
  if (m === 3 && day < 1) return false;
  return true;
}

export function isArchiveFreeForAll(d = new Date()): boolean {
  return !isLightningSeason(d);
}

export function seasonLabelSl(d = new Date()): string {
  const y = d.getFullYear();
  const endYear = d.getMonth() + 1 > 10 ? y + 1 : y;
  const startYear = endYear - 1;
  return `1. 3. ${startYear} – 31. 10. ${endYear}`;
}

export const STRELKO_OPEN_ACCESS =
  import.meta.env.VITE_STRELKO_OPEN_ACCESS === "1" ||
  import.meta.env.VITE_STRELKO_OPEN_ACCESS === "true";

export function hasArchiveFullAccess(): boolean {
  return true;
}
