/** Skupni vir podatkov za ponudbi Ob škodi in Podpornik (cenik + portal). */

import {
  OB_SKODI_MIN_QUANTITY,
  OB_SKODI_PER_TOKEN_GROSS_LABEL,
  OB_SKODI_PER_TOKEN_NET_APPROX_LABEL,
} from "./ob-skodi-tokens";
import {
  PODPORNIST_MONTHLY_GROSS_LABEL,
  PODPORNIST_MONTHLY_NET_EX_VAT_LABEL,
  PODPORNIST_PERIOD_LABEL,
} from "./podpornik-pricing";

export type PricingOfferId = "ob_skodi" | "podpornik";

export interface TokenUsageRule {
  daysLabel: string;
  tokens: number;
}

export interface PricingOffer {
  id: PricingOfferId;
  name: string;
  priceEur: string;
  /** Npr. «na mesec» pri Podporniku */
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
  priceEur: PODPORNIST_MONTHLY_GROSS_LABEL,
  pricePeriod: PODPORNIST_PERIOD_LABEL,
  priceLabel: "mesečna naročnina",
  priceExVat: PODPORNIST_MONTHLY_NET_EX_VAT_LABEL,
  vatNote: PRICING_VAT_NOTE,
  features: [
    "Dostop do celotnega arhiva strel",
    "Napredne statistike",
    "Widget za prikaz podatkov na spletni strani",
    "Samodejno mesečno podaljševanje",
    "Preklic naročnine kadar koli",
  ],
};

export const CENIK_PODPORNIST_DESCRIPTION =
  "S paketom Podpornik aktivirate mesečno spletno naročnino in pridobite dostop do dodatnih prikazov, hkrati pa podprete ekipo Meteoinfo pri razvoju novih aplikacij in meteoroloških produktov.";

/** Obvestilo neposredno nad gumbom na kartici Podpornik (cenik). */
export const CENIK_PODPORNIST_RENEWAL_NOTE =
  "Naročnina se samodejno mesečno podaljšuje do preklica.";

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
    q: "Ali lahko imam več naročnin Podpornik?",
    a: "Ne. Če imate paket že aktiven, nove naročnine ni mogoče skleniti.",
  },
  {
    q: "Kako prekličem naročnino Podpornik?",
    a: "Naročnino lahko kadar koli prekličete v Moj Strelko. Preklic ustavi prihodnja samodejna podaljšanja; dostop ostane aktiven do konca že plačanega obračunskega obdobja.",
  },
  {
    q: "Kje dobim račune?",
    a: "V Moj Strelko odprite zavihek Plačila. Tam so prikazana vaša plačila, zneski in povezave do potrdil ali računov Stripe.",
  },
] as const;

export const PURCHASE_STEPS = [
  "Prijavite se ali ustvarite uporabniški račun.",
  "Izberite nakup žetonov ali paket Podpornik ter plačilo opravite prek varnega plačilnega sistema.",
  "Naročnina Podpornik se samodejno mesečno podaljšuje do preklica v razdelku Moj Strelko. Po preklicu novih plačil ne bo, dostop pa ostane aktiven do konca že plačanega obračunskega obdobja.",
  "Potrdila o plačilu in računi bodo po povezavi plačilnega sistema poslani po e-pošti ter dostopni v razdelku Moj Strelko.",
] as const;

export const PURCHASE_CLOSING_NOTE = {
  lead: "Naročnino Podpornik in žetone lahko uporabljate hkrati.",
  body: "Podpornik je mesečna spletna naročnina za dodatne prikaze in orodja; žetoni so enkratni nakup za posamezne preglede udarov strel in izdelavo PDF-poročil.",
} as const;
