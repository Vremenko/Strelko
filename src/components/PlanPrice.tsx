import { planPriceBreakdown } from "../lib/pricing";
import type { Plan } from "../types";

interface PlanPriceProps {
  plan: Plan;
  /** Usklajeno z legacy renderPlanPriceHtml v modalu paketov. */
  variant?: "modal" | "default";
}

export function PlanPrice({ plan, variant = "default" }: PlanPriceProps) {
  if (plan.contact_only) {
    return (
      <p className="plan-price">
        <strong>{plan.price_eur || "Po dogovoru"}</strong>
      </p>
    );
  }

  const breakdown = planPriceBreakdown(plan);

  if (variant === "modal") {
    if (!breakdown) {
      return (
        <p className="plan-price">
          <strong>{plan.price_eur}</strong> € / mesec
        </p>
      );
    }
    return (
      <>
        <p className="plan-price">
          <strong>{breakdown.gross}</strong> € / mesec
        </p>
        <p className="plan-price-vat">
          vklj. {breakdown.vatRate}% DDV · brez DDV {breakdown.net} € · DDV {breakdown.vat} €
        </p>
      </>
    );
  }

  const suffix = plan.price_suffix_sl || (plan.billing_mode === "season_pass" ? "" : " / mesec");

  if (!breakdown) {
    return (
      <p className="plan-price">
        <strong>{plan.price_eur}</strong> €{suffix ? ` ${suffix.trim()}` : " / mesec"}
      </p>
    );
  }

  return (
    <>
      <p className="plan-price">
        <strong>{breakdown.gross}</strong> €{suffix ? ` ${suffix.trim()}` : ""}
      </p>
      <p className="plan-price-vat">
        vklj. {breakdown.vatRate}% DDV · brez DDV {breakdown.net} € · DDV {breakdown.vat} €
      </p>
    </>
  );
}

export function PlanPriceVatNote({ plan }: { plan: Plan }) {
  const vatLine = planPriceBreakdown(plan);
  if (!vatLine) return null;
  return <p className="plan-price-vat">vklj. {vatLine.vatRate}% DDV</p>;
}
