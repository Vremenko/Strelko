import type { Plan } from "../types";
import { OB_SKODI_PER_TOKEN_GROSS_LABEL } from "./ob-skodi-tokens";
import { PODPORNIST_MONTHLY_GROSS_LABEL } from "./podpornik-pricing";

export function defaultPlansFallback(): Plan[] {
  return [
    {
      id: "ob_skodi",
      name_sl: "Ob škodi",
      tagline_sl: "Za dokaz pri zavarovalnici",
      price_eur: OB_SKODI_PER_TOKEN_GROSS_LABEL.replace(" €", ""),
      price_suffix_sl: " / žeton",
      billing_mode: "subscription",
      monthly_credits: 5,
      max_locations: 2,
      pdf_per_period: 1,
      features_sl: [
        "5 podrobnih pregledov / mesec",
        "Do 2 lokacij",
        "1× PDF poročilo / mesec",
        "Velja vse leto",
      ],
      recommended: false,
    },
    {
      id: "podpornik",
      name_sl: "Podpornik",
      tagline_sl: "Statistika strel in widget za vašo stran",
      price_eur: PODPORNIST_MONTHLY_GROSS_LABEL.replace(" €", ""),
      price_suffix_sl: " do konca sezone",
      billing_mode: "subscription",
      monthly_credits: 5,
      max_locations: 1,
      pdf_per_period: 0,
      features_sl: [
        "Polni arhiv med sezono",
        "5 pregledov lokacije / sezono",
        "Widget za 1 spletno stran",
        "Pozimi arhiv brezplačen za vse",
      ],
      recommended: true,
    },
  ];
}

export function resolvePlansList(plans: Plan[]): Plan[] {
  return plans.length ? plans : defaultPlansFallback();
}

export function checkoutButtonLabel(planId: string, plans: Plan[]): string {
  const p = plans.find((x) => x.id === planId);
  if (planId === "podpornik") return "Kupi Podpornik";
  if (planId === "ob_skodi") return "Naroči Ob škodi";
  return p?.billing_mode === "season_pass" ? "Kupi paket" : "Naroči se";
}

export function defaultSelectedPlanId(plans: Plan[]): string {
  const list = resolvePlansList(plans);
  const rec = list.find((p) => p.recommended);
  return rec?.id || "podpornik";
}
