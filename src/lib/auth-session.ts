import type { ApiError } from "../types";

/** Sporočilo, ko alerts ne uspe, seja pa ostane. */
export const ALERTS_LOAD_WARNING =
  "Nastavitve opozoril trenutno niso na voljo. Prijava ostaja aktivna.";

/**
 * Ali naj napaka počisti auth žeton.
 * - 401: neveljavna seja
 * - 403 pri whoami: neaktiven / prepovedan račun (veljavna prijava ni mogoča)
 * - 403 pri pomožnih klicih: ne briši (ni nujno neveljavna prijava)
 * - 500 / timeout / omrežje: ne briši
 */
export function shouldClearAuthToken(
  status: number | undefined,
  source: "whoami" | "auxiliary"
): boolean {
  if (status === 401) return true;
  if (source === "whoami" && status === 403) return true;
  return false;
}

export function errorStatus(err: unknown): number | undefined {
  return (err as ApiError | undefined)?.status;
}

export interface SessionAuxPlan {
  clearAuth: boolean;
  creditsOk: boolean;
  alertsOk: boolean;
  alertsWarning: string | null;
}

/**
 * Odločitev po uspešnem whoami.
 * `creditsError` / `alertsError`: null = uspeh; objekt = napaka (status lahko manjka).
 */
export function planAfterWhoami(args: {
  creditsError?: { status?: number } | null;
  alertsError?: { status?: number } | null;
}): SessionAuxPlan {
  const creditsFailed = args.creditsError != null;
  const alertsFailed = args.alertsError != null;

  if (creditsFailed && shouldClearAuthToken(args.creditsError?.status, "auxiliary")) {
    return { clearAuth: true, creditsOk: false, alertsOk: false, alertsWarning: null };
  }
  if (alertsFailed && shouldClearAuthToken(args.alertsError?.status, "auxiliary")) {
    return { clearAuth: true, creditsOk: !creditsFailed, alertsOk: false, alertsWarning: null };
  }

  return {
    clearAuth: false,
    creditsOk: !creditsFailed,
    alertsOk: !alertsFailed,
    alertsWarning: alertsFailed ? ALERTS_LOAD_WARNING : null,
  };
}
