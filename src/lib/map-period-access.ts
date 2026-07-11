export type MapPeriodMode = "range" | "day";

export const MAP_FREE_DAY_OPTIONS = [1, 7] as const;
export const MAP_LOCKED_DAY_OPTIONS = [14, 30, 90] as const;
export const MAP_LOCK_PORTAL_ID = "strelko-map-lock-root";
const MAP_LOCK_STYLE_ID = "strelko-map-lock-styles";

const MAP_LOCK_PORTAL_CSS = `
.strelko-map-lock-root {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: none;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  box-sizing: border-box;
  overflow: auto;
  pointer-events: auto;
}
.strelko-map-lock-root.is-active {
  display: flex;
}
.strelko-map-lock-root .locked-content,
.strelko-map-lock-root .archive-map-locked {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
  padding: 1.25rem 1rem;
  border: none;
  border-radius: 0;
  background: transparent;
  box-sizing: border-box;
}
.strelko-map-lock-root .locked-content__inner {
  max-width: 42rem;
  text-align: center;
}
.strelko-map-lock-root .locked-content__icon {
  display: block;
  font-size: 1.35rem;
  margin-bottom: 0.35rem;
}
.strelko-map-lock-root .locked-content__title {
  margin: 0 0 0.65rem;
  font-size: 1.05rem;
  line-height: 1.35;
  color: #f2f2f2;
  font-weight: 600;
}
.strelko-map-lock-root .locked-content__text {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #999999;
}
.strelko-map-lock-root .locked-content__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.strelko-map-lock-root .locked-content__hint {
  margin: 0.75rem 0 0;
  font-size: 0.85rem;
}
.strelko-map-lock-root .locked-content__hint a {
  color: #fbb006;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.strelko-map-lock-root .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.65rem 1.25rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-family: inherit;
}
.strelko-map-lock-root .btn-primary {
  background: linear-gradient(135deg, #fbb006, #d99a05);
  color: #1a1508;
}
.strelko-map-lock-root .btn-ghost {
  background: rgba(255, 255, 255, 0.08);
  color: #f2f2f2;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.strelko-map-lock-root .btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
`;

export function isMapPeriodLocked(days: number, periodMode: MapPeriodMode): boolean {
  if (periodMode === "day") return true;
  return (MAP_LOCKED_DAY_OPTIONS as readonly number[]).includes(days);
}

export function isMapSelectValueLocked(value: string): boolean {
  if (value === "pick") return true;
  const days = parseInt(value, 10);
  return (MAP_LOCKED_DAY_OPTIONS as readonly number[]).includes(days);
}

export function isMapPeriodLockedInIframe(doc: Document): boolean {
  const sel = doc.getElementById("daysSelect") as HTMLSelectElement | null;
  if (!sel) return false;
  return isMapSelectValueLocked(sel.value);
}

function ensureMapLockStyles(doc: Document): void {
  if (doc.getElementById(MAP_LOCK_STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = MAP_LOCK_STYLE_ID;
  style.textContent = MAP_LOCK_PORTAL_CSS;
  doc.head.appendChild(style);
}

export function ensureMapLockPortal(doc: Document): HTMLElement | null {
  const stage = doc.getElementById("map-stage");
  if (!stage) return null;

  ensureMapLockStyles(doc);

  if (getComputedStyle(stage).position === "static") {
    stage.style.position = "relative";
  }

  let mount = doc.getElementById(MAP_LOCK_PORTAL_ID);
  if (!mount) {
    mount = doc.createElement("div");
    mount.id = MAP_LOCK_PORTAL_ID;
    mount.className = "strelko-map-lock-root";
    mount.setAttribute("aria-hidden", "true");
    stage.appendChild(mount);
  }

  return mount;
}

export function setMapLockPortalActive(mount: HTMLElement | null, active: boolean): void {
  if (!mount) return;
  mount.classList.toggle("is-active", active);
  mount.setAttribute("aria-hidden", active ? "false" : "true");
}

export function attachMapPeriodGate(
  iframe: HTMLIFrameElement,
  onLockedChange: (locked: boolean, mount: HTMLElement | null) => void
): () => void {
  const doc = iframe.contentDocument;
  if (!doc) return () => {};

  const sel = doc.getElementById("daysSelect") as HTMLSelectElement | null;
  const dayPick = doc.getElementById("mapDayPick") as HTMLInputElement | null;

  const sync = (locked: boolean) => {
    const mount = ensureMapLockPortal(doc);
    setMapLockPortalActive(mount, locked);
    onLockedChange(locked, mount);
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
