/** Oznake in razvrščanje za admin seznam uporabnikov. */

export type AdminUserFilterId =
  | "all"
  | "podpornik_active"
  | "podpornik_manual"
  | "podpornik_stripe"
  | "cancel_pending"
  | "no_podpornik"
  | "email_unverified"
  | "inactive"
  | "has_credits"
  | "no_credits";

export type AdminUserSortBy = "created_at" | "email" | "credits_balance" | "podpornik_expires";
export type AdminUserSortDir = "asc" | "desc";

export const ADMIN_USER_FILTERS: { id: AdminUserFilterId; label: string }[] = [
  { id: "all", label: "Vsi uporabniki" },
  { id: "podpornik_active", label: "Aktiven Podpornik" },
  { id: "podpornik_manual", label: "Ročni Podpornik" },
  { id: "podpornik_stripe", label: "Stripe naročnina" },
  { id: "cancel_pending", label: "Preklic ob koncu obdobja" },
  { id: "no_podpornik", label: "Brez Podpornika" },
  { id: "email_unverified", label: "Nepotrjena e-pošta" },
  { id: "inactive", label: "Neaktiven račun" },
  { id: "has_credits", label: "Ima žetone" },
  { id: "no_credits", label: "Brez žetonov" },
];

export const ADMIN_USER_SORT_OPTIONS: { id: AdminUserSortBy; label: string }[] = [
  { id: "created_at", label: "Datum registracije" },
  { id: "email", label: "E-pošta" },
  { id: "credits_balance", label: "Število žetonov" },
  { id: "podpornik_expires", label: "Veljavnost Podpornika" },
];

export function creditReasonKind(reason: string): "purchase" | "spend" | "admin" | "correction" | "other" {
  const r = (reason || "").toLowerCase();
  if (r.startsWith("admin_grant") || r.includes("admin_grant")) return "admin";
  if (r.includes("purchase") || r.includes("checkout") || r.includes("stripe") || r.includes("welcome")) {
    return "purchase";
  }
  if (r.includes("query") || r.includes("pdf") || r.includes("spend") || r.startsWith("-")) return "spend";
  if (r.includes("adjust") || r.includes("correction") || r.includes("refund")) return "correction";
  return "other";
}

export function creditReasonLabel(reason: string): string {
  const raw = (reason || "").trim();
  const kind = creditReasonKind(raw);
  const kindLabel =
    kind === "purchase"
      ? "Nakup"
      : kind === "spend"
        ? "Poraba"
        : kind === "admin"
          ? "Admin dodelitev"
          : kind === "correction"
            ? "Popravek"
            : raw || "Drugo";

  if (kind === "admin") {
    const note = raw.replace(/^admin_grant[:\s-]*/i, "").trim();
    return note && note.toLowerCase() !== "admin_grant" ? `${kindLabel}: ${note}` : kindLabel;
  }
  if (kind === "other") return kindLabel;
  return kindLabel;
}

export function podpornikSourceLabel(u: {
  podpornik_active?: boolean;
  podpornik_manual?: boolean | null;
  stripe_subscription_id?: string | null;
}): "Stripe" | "Ročno" | "Ni aktiven" {
  if (!u.podpornik_active) return "Ni aktiven";
  if (u.podpornik_manual || !u.stripe_subscription_id) return "Ročno";
  return "Stripe";
}

export function authMethodLabel(u: {
  signup_client_app?: string | null;
  last_client_app?: string | null;
}): string | null {
  // Provider (Google/e-pošta) ni shranjen — prikaži le, če obstaja client app namig.
  const app = (u.last_client_app || u.signup_client_app || "").toLowerCase();
  if (!app) return null;
  return `Aplikacija: ${app}`;
}
