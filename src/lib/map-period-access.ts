export type MapPeriodMode = "range" | "day";

export const MAP_FREE_DAY_OPTIONS = [1, 7] as const;
export const MAP_LOCKED_DAY_OPTIONS = [14, 30, 90] as const;

export function isMapPeriodLocked(days: number, periodMode: MapPeriodMode): boolean {
  if (periodMode === "day") return true;
  return (MAP_LOCKED_DAY_OPTIONS as readonly number[]).includes(days);
}

export function isMapSelectValueLocked(value: string): boolean {
  if (value === "pick") return true;
  const days = parseInt(value, 10);
  return (MAP_LOCKED_DAY_OPTIONS as readonly number[]).includes(days);
}

export function setMapBodyVisible(doc: Document, visible: boolean): void {
  for (const id of ["map-stage", "chart-section"]) {
    const el = doc.getElementById(id);
    if (!el) continue;
    el.style.visibility = visible ? "" : "hidden";
  }
}

export function isMapPeriodLockedInIframe(doc: Document): boolean {
  const sel = doc.getElementById("daysSelect") as HTMLSelectElement | null;
  if (!sel) return false;
  return isMapSelectValueLocked(sel.value);
}

export function attachMapPeriodGate(
  iframe: HTMLIFrameElement,
  callbacks: {
    onLockedChange: (locked: boolean) => void;
    onLayoutChange: () => void;
  }
): () => void {
  const doc = iframe.contentDocument;
  if (!doc) return () => {};

  const sel = doc.getElementById("daysSelect") as HTMLSelectElement | null;
  const dayPick = doc.getElementById("mapDayPick") as HTMLInputElement | null;

  const sync = (locked: boolean) => {
    setMapBodyVisible(doc, !locked);
    callbacks.onLockedChange(locked);
    callbacks.onLayoutChange();
  };

  const onSelectChange = (e: Event) => {
    const locked = isMapPeriodLockedInIframe(doc);
    if (locked) {
      e.stopImmediatePropagation();
      e.preventDefault();
      sync(true);
      return;
    }
    sync(false);
  };

  const onDayPickChange = () => {
    if (sel?.value === "pick") sync(true);
  };

  sel?.addEventListener("change", onSelectChange, true);
  dayPick?.addEventListener("change", onDayPickChange, true);

  sync(isMapPeriodLockedInIframe(doc));

  return () => {
    sel?.removeEventListener("change", onSelectChange, true);
    dayPick?.removeEventListener("change", onDayPickChange, true);
  };
}

export function getMapStageOverlayBox(
  iframe: HTMLIFrameElement,
  wrap: HTMLElement
): { top: number; left: number; width: number; height: number } | null {
  const stage = iframe.contentDocument?.getElementById("map-stage");
  if (!stage) return null;
  const stageRect = stage.getBoundingClientRect();
  const wrapRect = wrap.getBoundingClientRect();
  return {
    top: stageRect.top - wrapRect.top,
    left: stageRect.left - wrapRect.left,
    width: stageRect.width,
    height: stageRect.height,
  };
}
