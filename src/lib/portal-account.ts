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

export const PODPORNIK_RENEWAL_NOTICE =
  "Naročnina se samodejno podaljšuje vsak mesec do preklica.";

export function getPodpornikOverview(credits?: Credits | null): {
  active: boolean;
  cancelScheduled: boolean;
  canCancel: boolean;
  canRestore: boolean;
  expiryLabel: string | null;
  cancelNotice: string | null;
  renewalNotice: string | null;
} {
  if (!isPodpornikActive(credits)) {
    return {
      active: false,
      cancelScheduled: false,
      canCancel: false,
      canRestore: false,
      expiryLabel: null,
      cancelNotice: null,
      renewalNotice: null,
    };
  }

  const cancelScheduled = Boolean(credits?.subscription_cancel_at_period_end);
  const periodEnd = credits?.subscription_current_period_end;
  const seasonEnd = credits?.season_pass_expires_at;
  const expiryRaw = periodEnd || seasonEnd;
  const expiryFormatted = expiryRaw ? formatPeriodEndGenitive(expiryRaw) : null;
  const canManageBilling = Boolean(credits?.billing_portal_available);
  const hasStripeSub = Boolean(credits?.has_subscription);
  /** Gumb Prekliči, ko ni načrtovanega preklica in obstaja Stripe naročnina/portal. */
  const canCancel = !cancelScheduled && (canManageBilling || hasStripeSub);
  /** Obnovi: še velja, nastavljen preklic ob koncu, Stripe sub še obstaja. */
  const canRestore = cancelScheduled && (canManageBilling || hasStripeSub);

  return {
    active: true,
    cancelScheduled,
    canCancel,
    canRestore,
    expiryLabel: expiryFormatted ? `Velja do ${expiryFormatted}` : null,
    cancelNotice: cancelScheduled
      ? "Naročnina se ne bo samodejno podaljšala."
      : !canManageBilling
        ? "Samodejno podaljševanje lahko prekinete po e-pošti na podpora@meteoinfo.si."
        : null,
    renewalNotice: canCancel ? PODPORNIK_RENEWAL_NOTICE : null,
  };
}

export function tokenBalanceLabel(credits?: Credits | null): string {
  if (credits?.credits_balance == null) return "—";
  return tokenCountLabel(credits.credits_balance);
}

/** Ali API odgovor pomeni, da obnovitev ni mogoča → nova naročnina na ceniku. */
export function isSubscriptionNotRestorableError(err: unknown): boolean {
  const data = (err as { data?: { detail?: unknown } } | null)?.data;
  const detail = data?.detail;
  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    return (detail as { code?: string }).code === "subscription_not_restorable";
  }
  return false;
}
