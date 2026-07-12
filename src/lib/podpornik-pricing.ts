/** Podpornik — mesečna cena z DDV in prikazni labeli (cenik + ponudbe). */

import { formatEurSl, OB_SKODI_VAT_RATE, roundMoneyEur } from "./ob-skodi-tokens";

export const PODPORNIST_MONTHLY_PRICE_GROSS_EUR = 4;
export const PODPORNIST_PERIOD_LABEL = "na mesec";

export const PODPORNIST_MONTHLY_GROSS_LABEL = formatEurSl(PODPORNIST_MONTHLY_PRICE_GROSS_EUR);

export const PODPORNIST_MONTHLY_NET_EUR = roundMoneyEur(
  PODPORNIST_MONTHLY_PRICE_GROSS_EUR / (1 + OB_SKODI_VAT_RATE)
);

export const PODPORNIST_MONTHLY_NET_LABEL = formatEurSl(PODPORNIST_MONTHLY_NET_EUR);

export const PODPORNIST_MONTHLY_NET_EX_VAT_LABEL = `(${PODPORNIST_MONTHLY_NET_LABEL} brez DDV)`;
