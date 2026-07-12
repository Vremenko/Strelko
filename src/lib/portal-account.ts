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

export function getPodpornikStatus(credits?: Credits | null): {
  active: boolean;
  label: string;
  hint: string;
  canCancel: boolean;
} {
  if (!isPodpornikActive(credits)) {
    return {
      active: false,
      label: "Ni aktiven",
      hint: "Podpornik omogoča polni arhiv, napredne statistike in widget.",
      canCancel: false,
    };
  }

  const cancelScheduled = Boolean(credits?.subscription_cancel_at_period_end);
  /** Datum poteka iz API (30-dnevno obdobje določa backend ob plačilu/podaljšanju). */
  const periodEnd = credits?.subscription_current_period_end;
  const seasonEnd = credits?.season_pass_expires_at;
  const expiryRaw = periodEnd || seasonEnd;
  const expiryFormatted = expiryRaw ? formatPeriodEnd(expiryRaw) : null;
  const canCancel = Boolean(credits?.billing_portal_available) && !cancelScheduled;

  if (cancelScheduled && expiryFormatted) {
    return {
      active: true,
      label: `Velja do ${expiryFormatted}`,
      hint: "Naročnina je preklicana.",
      canCancel: false,
    };
  }

  if (expiryFormatted) {
    return {
      active: true,
      label: `Velja do ${expiryFormatted}`,
      hint: "",
      canCancel,
    };
  }

  return {
    active: true,
    label: "Aktiven",
    hint: "Aktivna naročnina Podpornik",
    canCancel,
  };
}

export function tokenBalanceLabel(credits?: Credits | null): string {
  if (credits?.credits_balance == null) return "—";
  return tokenCountLabel(credits.credits_balance);
}
