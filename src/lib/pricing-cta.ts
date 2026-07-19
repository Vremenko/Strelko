/**
 * CTA na ceniku / nakupu: gosti vedno vidijo prijavo;
 * »kmalu na voljo« samo po uspešnem API odgovoru z izrecno onemogočenimi plačili.
 */

export type PaymentsAvailability = "loading" | "enabled" | "disabled" | "error";

export function resolvePaymentsAvailability(p: {
  paymentsResolved: boolean;
  paymentsEnabled: boolean;
  plansError: string | null;
}): PaymentsAvailability {
  if (p.plansError) return "error";
  if (!p.paymentsResolved) return "loading";
  return p.paymentsEnabled ? "enabled" : "disabled";
}

/** Neprijavljen: vedno prijava, gumb nikoli onemogočen zaradi plačil. */
export function guestObSkodiCtaLabel(): string {
  return "Za nakup žetonov se prijavite.";
}

export function guestPodpornikCtaLabel(): string {
  return "Za aktivacijo paketa Podpornik se prijavite.";
}
