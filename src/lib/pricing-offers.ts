/** Skupni vir podatkov za ponudbi Ob škodi in Podpornik (cenik + portal). */

import {
  OB_SKODI_MIN_QUANTITY,
  OB_SKODI_PER_TOKEN_GROSS_LABEL,
  OB_SKODI_PER_TOKEN_NET_APPROX_LABEL,
} from "./ob-skodi-tokens";

export type PricingOfferId = "ob_skodi" | "podpornik";

export interface TokenUsageRule {
  daysLabel: string;
  tokens: number;
}

export interface PricingOffer {
  id: PricingOfferId;
  name: string;
  priceEur: string;
  /** Npr. «/ mesec» pri Podporniku */
  pricePeriod?: string;
  priceLabel: string;
  priceExVat: string;
  vatNote: string;
  features: string[];
}

export const PRICING_VAT_NOTE = "DDV vključen";
export const PRICING_VAT_RATE_NOTE =
  "Izračun cen brez DDV velja ob 22-odstotni stopnji DDV.";

export const PRICING_OB_SKODI: PricingOffer = {
  id: "ob_skodi",
  name: "Ob škodi",
  priceEur: OB_SKODI_PER_TOKEN_GROSS_LABEL,
  priceLabel: "na žeton · DDV je vključen",
  priceExVat: `približno ${OB_SKODI_PER_TOKEN_NET_APPROX_LABEL} brez DDV`,
  vatNote: PRICING_VAT_NOTE,
  features: [
    `Najmanjši nakup so ${OB_SKODI_MIN_QUANTITY} žetoni`,
    "do 10 dni: 1 žeton",
    "11–20 dni: 2 žetona",
    "21–30 dni: 3 žetoni",
    "prva izdelava PDF-poročila: dodatni 1 žeton",
    "žetoni ne potečejo",
    "brez naročnine",
  ],
};

export const PRICING_PODPORNIST: PricingOffer = {
  id: "podpornik",
  name: "Podpornik",
  priceEur: "4,50 €",
  pricePeriod: "/ mesec",
  priceLabel: "mesečna naročnina",
  priceExVat: "(3,69 € brez DDV / mesec)",
  vatNote: PRICING_VAT_NOTE,
  features: [
    "Dostop do celotnega arhiva strel",
    "Napredne statistike",
    "Widget za prikaz podatkov na spletni strani",
    "Samodejno mesečno podaljšanje",
    "Preklic kadar koli",
  ],
};

export const CENIK_PODPORNIST_PRICE_EX_VAT = "(3,69 € brez DDV)";

export const CENIK_PODPORNIST_DESCRIPTION =
  "S paketom Podpornik pridobite dostop do dodatnih prikazov in orodij, hkrati pa podprete nadaljnji razvoj Strelka ter novih meteoroloških aplikacij in produktov Meteoinfa.";

export const CENIK_PODPORNIST_FEATURES = [
  "Celoten arhiv strel po dnevih, urah, statističnih regijah in občinah",
  "Napredni statistični prikazi",
  "Widget za spletno stran",
] as const;

export const CENIK_PODPORNIST_DISCLAIMER =
  "Žetoni za preverjanje udarov strel ob škodnem dogodku in izdelavo PDF-poročila niso vključeni v naročnino Podpornik, zato jih je treba kupiti posebej.";

export const CENIK_ZETONI_DESCRIPTION =
  "Za preverjanje udarov strel pri škodnem dogodku in izdelavo PDF-poročila kot pomoč pri uveljavljanju škode pri zavarovalnici.";

export const CENIK_ZETONI_FEATURES = [
  "Prikaz udarov strel v okolici izbrane lokacije",
  "Izbira obdobja in radija iskanja",
  "Interaktivni zemljevid zaznanih udarov",
  "Datum, čas in oddaljenost posameznega udara",
  "Izdelava PDF-poročila",
] as const;

export const PRICING_OFFERS: PricingOffer[] = [PRICING_OB_SKODI, PRICING_PODPORNIST];

export const TOKEN_USAGE_RULES: TokenUsageRule[] = [
  { daysLabel: "1–10 dni", tokens: 1 },
  { daysLabel: "11–20 dni", tokens: 2 },
  { daysLabel: "21–30 dni", tokens: 3 },
];

export const TOKEN_USAGE_EXAMPLES = [
  {
    title: "Krajši pregled",
    detail: "7 dni, brez PDF-ja → 1 žeton",
  },
  {
    title: "Daljše obdobje s PDF-jem",
    detail: "18 dni + prva izdelava PDF-ja → 2 + 1 = 3 žetoni",
  },
  {
    title: "Ponovni ogled",
    detail: "Ista kupljena poizvedba ali ponovni prenos PDF-ja → 0 žetonov",
  },
  {
    title: "Nova poizvedba",
    detail: "Druga lokacija ali sprememba lokacije, obdobja ali radija → nova poraba žetonov",
  },
] as const;

export const PRICING_FAQ = [
  {
    q: "Kaj pomeni nova poizvedba?",
    a: "Vsaka druga lokacija ali sprememba lokacije, obdobja ali radija zahteva novo izvedbo in novo porabo žetonov.",
  },
  {
    q: "Ali žetoni potečejo?",
    a: "Ne. Kupljeni žetoni ostanejo na vašem računu, dokler jih ne porabite.",
  },
  {
    q: "Kako prekličem naročnino Podpornik?",
    a: "Naročnino lahko kadar koli prekličete v Moj Strelko. Po preklicu se ne izvedejo nova plačila, dostop pa ostane do konca že plačanega obdobja.",
  },
  {
    q: "Kje dobim račune?",
    a: "Potrdila in računi bodo po povezavi plačilnega sistema dostopni po e-pošti in v uporabniškem računu, ko bo ta funkcionalnost vklopljena.",
  },
] as const;

export const PURCHASE_STEPS = [
  "Prijavite se ali ustvarite uporabniški račun.",
  "Izberite nakup žetonov ali paket Podpornik ter plačilo opravite prek varnega plačilnega sistema.",
  "Naročnina Podpornik se vsak mesec samodejno podaljša, dokler je ne prekličete v razdelku Moj Strelko. Po preklicu novih plačil ne bo, dostop do paketa Podpornik pa ostane aktiven do konca že plačanega obdobja.",
  "Potrdila o plačilu in računi bodo po povezavi plačilnega sistema poslani po e-pošti ter dostopni v razdelku Moj Strelko.",
] as const;
