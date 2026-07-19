/** Zaščita pred vgradnjo običajnih strani v iframe (obramba poleg CSP). */

import { isPublicEmbedPath } from "./public-embed";

export function shouldAllowFraming(pathname: string): boolean {
  return isPublicEmbedPath(pathname);
}

/**
 * Če stran ni javni embed in teče v tujem iframe-u, prekini prikaz.
 * CSP frame-ancestors je primarna zaščita; to je dodatna obramba v SPA.
 */
export function installFrameGuard(pathname: string): void {
  if (typeof window === "undefined") return;
  try {
    if (window.top === window.self) return;
  } catch {
    /* cross-origin top — obravnavaj kot vgrajeno */
  }
  if (shouldAllowFraming(pathname)) return;
  try {
    document.documentElement.innerHTML = "";
    document.body?.remove();
  } catch {
    /* ignore */
  }
}
