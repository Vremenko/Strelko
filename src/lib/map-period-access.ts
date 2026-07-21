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

/** Aktivni zavihek Mreža — React period gate ne sme prestreči dogodkov (native grid lock). */
export function isGridViewActiveInIframe(doc: Document): boolean {
  return Boolean(
    doc.querySelector('#mapViewTabs .map-mode-btn--active[data-view="grid"]')
  );
}

/** Koledarski »danes« v Europe/Ljubljana (ne UTC). */
function todayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Ljubljana",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function subtractDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() - days + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmtFull(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("sl-SI", { day: "numeric", month: "long", year: "numeric" });
}

function fmtDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("sl-SI", { day: "numeric" });
}

function fmtDayMonth(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("sl-SI", { day: "numeric", month: "long" });
}

function fmtMonthYear(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("sl-SI", { month: "long", year: "numeric" });
}

function formatSlDateRange(fromIso: string, toIso: string): string {
  const from = new Date(`${fromIso}T12:00:00`);
  const to = new Date(`${toIso}T12:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return "—";
  if (from.getFullYear() === to.getFullYear()) {
    if (from.getMonth() === to.getMonth()) {
      return `${fmtDay(fromIso)} – ${fmtDay(toIso)} ${fmtMonthYear(toIso)}`;
    }
    return `${fmtDayMonth(fromIso)} – ${fmtDayMonth(toIso)} ${from.getFullYear()}`;
  }
  return `${fmtFull(fromIso)} – ${fmtFull(toIso)}`;
}

/** Posodobi toolbar ob zaklenjenem obdobju brez reload(). */
function syncLockedToolbarUI(doc: Document): void {
  const sel = doc.getElementById("daysSelect") as HTMLSelectElement | null;
  const dayPickWrap = doc.getElementById("mapDayPickWrap");
  const dayPick = doc.getElementById("mapDayPick") as HTMLInputElement | null;
  const dniBtn = doc.getElementById("mapModeBtnDni");
  const periodLabel = doc.getElementById("periodLabel");
  if (!sel) return;

  const value = sel.value;
  if (value === "pick") {
    dayPickWrap?.classList.remove("hidden");
    if (dayPick && !dayPick.value) dayPick.value = todayIso();
    if (periodLabel && dayPick?.value) periodLabel.textContent = fmtFull(dayPick.value);
    return;
  }

  dayPickWrap?.classList.add("hidden");
  const days = parseInt(value, 10);
  const showDni = (MAP_LOCKED_DAY_OPTIONS as readonly number[]).includes(days);
  if (dniBtn) dniBtn.hidden = !showDni;

  if (!periodLabel) return;
  if (value === "1") {
    periodLabel.textContent = fmtFull(todayIso());
    return;
  }
  if (showDni) {
    const to = todayIso();
    periodLabel.textContent = formatSlDateRange(subtractDays(to, days), to);
  }
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
  const mapModeTabs = doc.getElementById("mapModeTabs");
  const mapViewTabs = doc.getElementById("mapViewTabs");

  const sync = (locked: boolean) => {
    if (locked) syncLockedToolbarUI(doc);
    const mount = ensureMapLockPortal(doc);
    setMapLockPortalActive(mount, locked);
    onLockedChange(locked, mount);
  };

  const recompute = () => {
    /* Med zaklenjeno mrežo React portal ugasnemo — native #map-feature-lock je vir resnice. */
    if (isGridViewActiveInIframe(doc)) {
      sync(false);
      return;
    }
    sync(isMapPeriodLockedInIframe(doc));
  };

  const onSelectChange = (e: Event) => {
    if (isGridViewActiveInIframe(doc)) {
      sync(false);
      return; /* pusti native applyPeriodSelection / showPeriodLockUi */
    }
    const locked = isMapPeriodLockedInIframe(doc);
    if (locked) {
      e.stopImmediatePropagation();
      e.preventDefault();
      sync(true);
      return;
    }
    sync(false);
  };

  const onDayPickChange = (e: Event) => {
    if (isGridViewActiveInIframe(doc)) {
      sync(false);
      return;
    }
    if (sel?.value !== "pick") return;
    e.stopImmediatePropagation();
    e.preventDefault();
    sync(true);
  };

  const onModeTabClick = (e: Event) => {
    if (isGridViewActiveInIframe(doc)) return;
    if (!isMapPeriodLockedInIframe(doc)) return;
    const btn = (e.target as Element | null)?.closest("[data-mode]");
    if (!btn) return;
    const mode = (btn as HTMLElement).dataset.mode;
    if (!mode) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    mapModeTabs?.querySelectorAll(".map-mode-btn").forEach((b) => {
      b.classList.toggle("map-mode-btn--active", (b as HTMLElement).dataset.mode === mode);
    });
    sync(true);
  };

  const onViewTabClick = () => {
    /* Po native preklopu Občine/Mreža ponovno izračunaj React zaklep. */
    setTimeout(recompute, 0);
  };

  const onEmbedMessage = (e: MessageEvent) => {
    if (e.source !== iframe.contentWindow) return;
    if (e.data?.type !== "strele-map-view-changed") return;
    if (e.data.view === "grid") {
      sync(false);
      return;
    }
    if (e.data.view === "obcine") {
      if (e.data.locked === true) {
        sync(true);
        return;
      }
      if (e.data.locked === false) {
        sync(false);
        return;
      }
      recompute();
    }
  };

  sel?.addEventListener("change", onSelectChange, true);
  dayPick?.addEventListener("change", onDayPickChange, true);
  mapModeTabs?.addEventListener("click", onModeTabClick, true);
  mapViewTabs?.addEventListener("click", onViewTabClick);
  window.addEventListener("message", onEmbedMessage);

  recompute();

  return () => {
    sel?.removeEventListener("change", onSelectChange, true);
    dayPick?.removeEventListener("change", onDayPickChange, true);
    mapModeTabs?.removeEventListener("click", onModeTabClick, true);
    mapViewTabs?.removeEventListener("click", onViewTabClick);
    window.removeEventListener("message", onEmbedMessage);
  };
}
