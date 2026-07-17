import type { Credits } from "../types";
import { tokenCountLabel } from "./ob-skodi-tokens";

export function formatPeriodEnd(isoDate: string): string {
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("sl-SI", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const SL_MONTHS_GENITIVE = [
  "januarja",
  "februarja",
  "marca",
  "aprila",
  "maja",
  "junija",
  "julija",
  "avgusta",
  "septembra",
  "oktobra",
  "novembra",
  "decembra",
] as const;

/** npr. 31. oktobra 2026 — za prikaz veljavnosti paketa Podpornik. */
export function formatPeriodEndGenitive(isoDate: string): string {
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  const day = parsed.getDate();
  const month = SL_MONTHS_GENITIVE[parsed.getMonth()];
  const year = parsed.getFullYear();
  return `${day}. ${month} ${year}`;
}

/** Ali je naročnina Podpornik aktivna (neodvisno od žetonov Ob škodi). */
export function isPodpornikActive(credits?: Credits | null): boolean {
  if (!credits || credits.plan_id !== "podpornik") return false;
  if (credits.has_subscription) return true;
  const exp = credits.season_pass_expires_at;
  if (exp) {
    const parsed = new Date(`${exp}T12:00:00`);
    if (!Number.isNaN(parsed.getTime()) && parsed >= new Date()) return true;
  }
  return false;
}

export function canSubscribePodpornik(credits?: Credits | null): boolean {
  return !isPodpornikActive(credits);
}

export function getPodpornikOverview(credits?: Credits | null): {
  active: boolean;
  cancelScheduled: boolean;
  canCancel: boolean;
  expiryLabel: string | null;
  cancelNotice: string | null;
} {
  if (!isPodpornikActive(credits)) {
    return {
      active: false,
      cancelScheduled: false,
      canCancel: false,
      expiryLabel: null,
      cancelNotice: null,
    };
  }

  const cancelScheduled = Boolean(credits?.subscription_cancel_at_period_end);
  const periodEnd = credits?.subscription_current_period_end;
  const seasonEnd = credits?.season_pass_expires_at;
  const expiryRaw = periodEnd || seasonEnd;
  const expiryFormatted = expiryRaw ? formatPeriodEndGenitive(expiryRaw) : null;
  const canManageBilling = Boolean(credits?.billing_portal_available);
  /** Gumb samo, ko Stripe portal res deluje (aktivna plačilna naročnina). */
  const canCancel = !cancelScheduled && canManageBilling;

  return {
    active: true,
    cancelScheduled,
    canCancel,
    expiryLabel: expiryFormatted ? `Velja do ${expiryFormatted}` : null,
    cancelNotice: cancelScheduled
      ? "Naročnina se ne bo samodejno podaljšala."
      : canManageBilling
        ? null
        : "Samodejno podaljševanje lahko prekinete po e-pošti na podpora@meteoinfo.si.",
  };
}

export function tokenBalanceLabel(credits?: Credits | null): string {
  if (credits?.credits_balance == null) return "—";
  return tokenCountLabel(credits.credits_balance);
}
