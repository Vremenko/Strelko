/** Skupni vir podatkov za ponudbi Ob škodi in Podpornik (cenik + portal). */

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
  priceEur: "4,50 €",
  priceLabel: "enkratno plačilo",
  priceExVat: "(3,69 € brez DDV)",
  vatNote: PRICING_VAT_NOTE,
  features: [
    "4 žetoni",
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
    "polni arhiv in napredne statistike",
    "widget za eno spletno stran",
    "podpora razvoju Strelka, produktov, meritev in vsebin Meteoinfa",
    "samodejno mesečno obnavljanje",
    "preklic kadar koli",
    "brez žetonov in zavarovalniških PDF-poročil",
  ],
};

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
  "Prijavite se ali ustvarite račun.",
  "Plačilo prek varnega plačilnega sistema (kmalu na voljo).",
  "Za žetone izvedite poizvedbo na strani Pomoč pri zavarovalnici; za Podpornika odprite arhiv in widget.",
] as const;

export function tokensPackLabel(): string {
  return `Kupite 4 žetone za ${PRICING_OB_SKODI.priceEur}`;
}
