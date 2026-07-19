/** Umami Analytics (self-hosted, SPA pageviews po privolitvi). */

declare global {
  interface Window {
    umami?: {
      track: (
        event?: string | ((props: Record<string, unknown>) => Record<string, unknown>),
        data?: Record<string, unknown>
      ) => void;
    };
  }
}

const viteEnv =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const WEBSITE_ID = (viteEnv.VITE_UMAMI_WEBSITE_ID ?? "").trim();
const SCRIPT_URL = (viteEnv.VITE_UMAMI_SCRIPT_URL ?? "").trim();
const HOST_URL = (viteEnv.VITE_UMAMI_HOST_URL ?? "").trim() || scriptOrigin(SCRIPT_URL);

let scriptRequested = false;
/** Runtime vrata: ob preklicu privolitve ustavi dogodke v trenutnem ogledu. */
let trackingAllowed = false;

function scriptOrigin(url: string): string {
  if (!url) return "";
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

/** Ali je Umami konfiguriran (env ob buildu). */
export function umamiEnabled(): boolean {
  return WEBSITE_ID.length > 0 && SCRIPT_URL.length > 0;
}

/** Omogoči ali ustavi pošiljanje dogodkov (tudi če je skripta že naložena). */
export function setUmamiTrackingAllowed(allowed: boolean): void {
  trackingAllowed = allowed;
}

export function isUmamiTrackingAllowed(): boolean {
  return trackingAllowed;
}

/** Naloži Umami tracker (enkrat). */
export function loadUmamiScript(): void {
  if (!umamiEnabled() || !trackingAllowed || scriptRequested) return;
  scriptRequested = true;
  const script = document.createElement("script");
  script.defer = true;
  script.async = true;
  script.src = SCRIPT_URL;
  script.dataset.websiteId = WEBSITE_ID;
  if (HOST_URL) {
    script.dataset.hostUrl = HOST_URL;
  }
  document.head.appendChild(script);
}

/** Poti, ki jih ne pošiljamo v analitiko. */
export function isUmamiExcludedPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/admin2" ||
    pathname.startsWith("/embed/")
  );
}

/** Ročni pageview (React Router SPA). */
export function trackUmamiPageview(pathname: string, search = ""): void {
  if (!umamiEnabled() || !trackingAllowed || isUmamiExcludedPath(pathname)) return;
  const url = `${pathname}${search}`;
  if (typeof window.umami?.track !== "function") return;
  window.umami.track((props) => ({ ...props, url }));
}
