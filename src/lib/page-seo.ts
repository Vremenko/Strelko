/** SEO meta podatki po poti — title, description, canonical, robots, OG/Twitter, JSON-LD. */

import { COMPANY, LEGAL_PAGES } from "./legal";
import { PRICING_FAQ } from "./pricing-offers";
import { OB_SKODI_TOKEN_PRICE_GROSS_EUR } from "./ob-skodi-tokens";
import { PODPORNIST_MONTHLY_PRICE_GROSS_EUR } from "./podpornik-pricing";

export const SITE_ORIGIN = "https://strelko.meteoinfo.si";
export const SITE_NAME = "Strelko";
export const OG_IMAGE_DEFAULT = `${SITE_ORIGIN}/og-image.png`;
export const OG_IMAGE_ALT_DEFAULT = "Strelko – pregled udarov strel v Sloveniji";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const APPLE_TOUCH_ICON_URL = `${SITE_ORIGIN}/pwa/apple-touch-icon.png`;
export const OG_LOCALE = "sl_SI";
export const ORGANIZATION_NAME = "Meteoinfo d.o.o.";
export const ORGANIZATION_URL = "https://meteoinfo.si";
export const ORGANIZATION_LOGO_URL = `${SITE_ORIGIN}/assets/strelko-logo.png`;
export const THEME_COLOR = "#1a2744";

/** @deprecated Uporabi OG_IMAGE_DEFAULT */
export const OG_IMAGE_URL = OG_IMAGE_DEFAULT;
/** @deprecated Uporabi OG_IMAGE_ALT_DEFAULT */
export const OG_IMAGE_ALT = OG_IMAGE_ALT_DEFAULT;

export const SEO_FALLBACK = {
  title: "Strelko – pregled udarov strel v Sloveniji",
  description:
    "Strelko omogoča informativni pregled zaznanih udarov strel, arhiva, statistike in izdelavo PDF-poročil.",
} as const;

export type RobotsDirective = "index, follow" | "noindex, follow" | "noindex, nofollow";

export type PageSeo = {
  title: string;
  description: string;
  canonical: string;
  robots: RobotsDirective;
};

export type SocialMeta = {
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogImage: string;
  ogImageAlt: string;
  ogSiteName: string;
  ogLocale: string;
  ogType: "website";
  twitterCard: "summary_large_image";
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
};

const PUBLIC_ROUTES: Record<string, Omit<PageSeo, "robots">> = {
  "/": {
    title: "Strelko – pregled udarov strel v Sloveniji",
    description:
      "Preverite zaznane udare strel v Sloveniji, raziščite arhiv in statistiko ter pripravite informativno PDF-poročilo za zavarovalnico.",
    canonical: `${SITE_ORIGIN}/`,
  },
  "/pomoc-pri-zavarovalnici": {
    title: "Preverjanje udarov strel za zavarovalnico – Strelko",
    description:
      "Preverite zaznane udare strel v bližini izbrane lokacije, čas in oddaljenost ter izdelajte informativno PDF-poročilo.",
    canonical: `${SITE_ORIGIN}/pomoc-pri-zavarovalnici`,
  },
  "/statistika": {
    title: "Arhiv in statistika strel v Sloveniji – Strelko",
    description:
      "Preglejte arhiv in statistiko zaznanih strel v Sloveniji po dnevih, urah, statističnih regijah in občinah.",
    canonical: `${SITE_ORIGIN}/statistika`,
  },
  "/widget-obcine": {
    title: "Widget udarov strel za spletno stran – Strelko",
    description:
      "V svojo spletno stran vključite widget Strelko s prikazom aktualnih podatkov o zaznanih udarih strel.",
    canonical: `${SITE_ORIGIN}/widget-obcine`,
  },
  "/cenik": {
    title: "Cenik žetonov in paketa Podpornik – Strelko",
    description:
      "Preverite cene žetonov za pregled udarov strel in PDF-poročila ter mesečnega paketa Podpornik.",
    canonical: `${SITE_ORIGIN}/cenik`,
  },
  "/impressum": {
    title: "Impressum – Strelko",
    description:
      "Podatki o ponudniku storitve Strelko, Meteoinfo d.o.o., in kontaktni podatki.",
    canonical: `${SITE_ORIGIN}/impressum`,
  },
  "/pogoji-uporabe": {
    title: "Pogoji uporabe – Strelko",
    description:
      "Pogoji uporabe spletne storitve Strelko, žetonov, paketa Podpornik in plačil.",
    canonical: `${SITE_ORIGIN}/pogoji-uporabe`,
  },
  "/zasebnost": {
    title: "Politika zasebnosti – Strelko",
    description:
      "Kako Strelko obdeluje osebne podatke uporabnikov in obiskovalcev spletne strani.",
    canonical: `${SITE_ORIGIN}/zasebnost`,
  },
  "/piskotki": {
    title: "Politika piškotkov – Strelko",
    description:
      "Informacije o piškotkih in podobnih tehnologijah, ki jih uporablja strelko.meteoinfo.si.",
    canonical: `${SITE_ORIGIN}/piskotki`,
  },
  "/viri-podatkov": {
    title: "Viri podatkov – Strelko",
    description:
      "Izvor in omejitve podatkov o strelah v aplikaciji Strelko (LEELA, Met Office, DHMZ).",
    canonical: `${SITE_ORIGIN}/viri-podatkov`,
  },
  "/pravice-potrosnikov": {
    title: "Pravice potrošnikov – Strelko",
    description:
      "Povzetek potrošniških pravic pri nakupu žetonov, paketa Podpornik in digitalnih storitev Strelka.",
    canonical: `${SITE_ORIGIN}/pravice-potrosnikov`,
  },
};

const ROUTE_OG_IMAGES: Record<string, { image: string; alt: string }> = {
  "/": {
    image: `${SITE_ORIGIN}/og/home.png`,
    alt: "Strelko – pregled udarov strel v Sloveniji",
  },
  "/pomoc-pri-zavarovalnici": {
    image: `${SITE_ORIGIN}/og/zavarovalnica.png`,
    alt: "Preverjanje udarov strel za zavarovalnico – Strelko",
  },
  "/statistika": {
    image: `${SITE_ORIGIN}/og/statistika.png`,
    alt: "Arhiv in statistika strel v Sloveniji – Strelko",
  },
  "/widget-obcine": {
    image: `${SITE_ORIGIN}/og/widget.png`,
    alt: "Widget udarov strel za spletno stran – Strelko",
  },
  "/cenik": {
    image: `${SITE_ORIGIN}/og/cenik.png`,
    alt: "Cenik žetonov in paketa Podpornik – Strelko",
  },
  "/impressum": {
    image: `${SITE_ORIGIN}/og/impressum.png`,
    alt: "Impressum – Strelko",
  },
  "/pogoji-uporabe": {
    image: `${SITE_ORIGIN}/og/pogoji.png`,
    alt: "Pogoji uporabe – Strelko",
  },
  "/zasebnost": {
    image: `${SITE_ORIGIN}/og/zasebnost.png`,
    alt: "Politika zasebnosti – Strelko",
  },
  "/piskotki": {
    image: `${SITE_ORIGIN}/og/piskotki.png`,
    alt: "Politika piškotkov – Strelko",
  },
  "/viri-podatkov": {
    image: `${SITE_ORIGIN}/og/viri-podatkov.png`,
    alt: "Viri podatkov – Strelko",
  },
  "/pravice-potrosnikov": {
    image: `${SITE_ORIGIN}/og/pravice.png`,
    alt: "Pravice potrošnikov – Strelko",
  },
};

const LEGAL_PATHS = new Set(Object.values(LEGAL_PAGES).map((page) => page.path));

const BREADCRUMB_LABELS: Record<string, string> = {
  "/pomoc-pri-zavarovalnici": "Pomoč pri zavarovalnici",
  "/statistika": "Statistika",
  "/widget-obcine": "Widget občine",
  "/cenik": "Cenik",
  ...Object.fromEntries(
    Object.values(LEGAL_PAGES).map((page) => [
      page.path,
      "navTitle" in page && typeof page.navTitle === "string" ? page.navTitle : page.title,
    ])
  ),
};

type SitemapEntry = {
  path: string;
  priority: number;
  changefreq: "weekly" | "monthly" | "yearly";
};

const SITEMAP_ENTRIES: SitemapEntry[] = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/pomoc-pri-zavarovalnici", priority: 0.9, changefreq: "monthly" },
  { path: "/statistika", priority: 0.8, changefreq: "weekly" },
  { path: "/widget-obcine", priority: 0.7, changefreq: "monthly" },
  { path: "/cenik", priority: 0.8, changefreq: "monthly" },
  { path: "/impressum", priority: 0.3, changefreq: "yearly" },
  { path: "/pogoji-uporabe", priority: 0.3, changefreq: "yearly" },
  { path: "/zasebnost", priority: 0.3, changefreq: "yearly" },
  { path: "/piskotki", priority: 0.3, changefreq: "yearly" },
  { path: "/viri-podatkov", priority: 0.3, changefreq: "yearly" },
  { path: "/pravice-potrosnikov", priority: 0.3, changefreq: "yearly" },
];

const NOINDEX_PATHS = new Set([
  "/moj-strelko",
  "/admin",
  "/admin2",
  "/embed/statistika-grafi",
  "/embed/obcine-zemljevid",
  "/verify-email",
  "/reset-password",
]);

/** Javne poti za sitemap.xml (brez query, hash ali zasebnih poti). */
export const SITEMAP_PATHS = [
  "/",
  "/pomoc-pri-zavarovalnici",
  "/statistika",
  "/widget-obcine",
  "/cenik",
  "/impressum",
  "/pogoji-uporabe",
  "/zasebnost",
  "/piskotki",
  "/viri-podatkov",
  "/pravice-potrosnikov",
] as const;

/** Vse znane SPA poti (prerender + 200); neznane → HTTP 404 + noindex. */
export const KNOWN_APP_PATHS = [
  ...SITEMAP_PATHS,
  "/moj-strelko",
  "/admin",
  "/admin2",
  "/embed/statistika-grafi",
  "/embed/obcine-zemljevid",
  "/verify-email",
  "/reset-password",
] as const;

export const NOT_FOUND_SEO: PageSeo = {
  title: "Stran ni najdena – Strelko",
  description: "Zahtevana stran na strelko.meteoinfo.si ne obstaja. Vrnite se na domačo stran.",
  canonical: `${SITE_ORIGIN}/`,
  robots: "noindex, follow",
};

export function normalizePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed || "/";
}

export function isKnownAppPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return (KNOWN_APP_PATHS as readonly string[]).includes(path);
}

function isCheckoutReturnState(search: string): boolean {
  const checkout = new URLSearchParams(search).get("checkout");
  return checkout === "success" || checkout === "cancel";
}

function canonicalForPath(path: string): string {
  return `${SITE_ORIGIN}${path === "/" ? "/" : path}`;
}

export function resolvePageSeo(pathname: string, search: string): PageSeo {
  const path = normalizePathname(pathname);

  if (NOINDEX_PATHS.has(path)) {
    return {
      ...SEO_FALLBACK,
      canonical: canonicalForPath(path),
      robots: path.startsWith("/embed/") || path === "/admin2" || path === "/admin"
        ? "noindex, nofollow"
        : "noindex, follow",
    };
  }

  if (path === "/pomoc-pri-zavarovalnici" && new URLSearchParams(search).has("query")) {
    const base = PUBLIC_ROUTES["/pomoc-pri-zavarovalnici"];
    return {
      title: base.title,
      description: base.description,
      canonical: base.canonical,
      robots: "noindex, follow",
    };
  }

  const publicRoute = PUBLIC_ROUTES[path];

  if (isCheckoutReturnState(search)) {
    if (publicRoute) {
      return {
        title: publicRoute.title,
        description: publicRoute.description,
        canonical: publicRoute.canonical,
        robots: "noindex, follow",
      };
    }
    return {
      ...SEO_FALLBACK,
      canonical: canonicalForPath(path),
      robots: "noindex, follow",
    };
  }

  if (publicRoute) {
    return {
      ...publicRoute,
      robots: "index, follow",
    };
  }

  return {
    ...NOT_FOUND_SEO,
    canonical: canonicalForPath(path),
  };
}

export function resolveOgImage(pathname: string): { image: string; alt: string } {
  const path = normalizePathname(pathname);
  return ROUTE_OG_IMAGES[path] ?? { image: OG_IMAGE_DEFAULT, alt: OG_IMAGE_ALT_DEFAULT };
}

export function socialMetaFromPageSeo(seo: PageSeo, pathname: string): SocialMeta {
  const og = resolveOgImage(pathname);
  return {
    ogTitle: seo.title,
    ogDescription: seo.description,
    ogUrl: seo.canonical,
    ogImage: og.image,
    ogImageAlt: og.alt,
    ogSiteName: SITE_NAME,
    ogLocale: OG_LOCALE,
    ogType: "website",
    twitterCard: "summary_large_image",
    twitterTitle: seo.title,
    twitterDescription: seo.description,
    twitterImage: og.image,
  };
}

export function siteJsonLdGraph(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_ORIGIN}/#organization`,
        name: ORGANIZATION_NAME,
        legalName: COMPANY.legalName,
        url: ORGANIZATION_URL,
        email: COMPANY.email,
        logo: {
          "@type": "ImageObject",
          url: ORGANIZATION_LOGO_URL,
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: COMPANY.address,
          postalCode: COMPANY.postal.split(" ")[0],
          addressLocality: COMPANY.postal.split(" ").slice(1).join(" "),
          addressCountry: "SI",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_ORIGIN}/#website`,
        name: SITE_NAME,
        url: `${SITE_ORIGIN}/`,
        inLanguage: "sl",
        publisher: { "@id": `${SITE_ORIGIN}/#organization` },
      },
    ],
  };
}

function breadcrumbLabelForPath(path: string, seo: PageSeo): string | null {
  if (path === "/") return null;
  return BREADCRUMB_LABELS[path] ?? seo.title.replace(/\s*–\s*Strelko\s*$/u, "").trim();
}

function breadcrumbJsonLd(path: string, seo: PageSeo): Record<string, unknown> | null {
  const label = breadcrumbLabelForPath(path, seo);
  if (!label) return null;

  return {
    "@type": "BreadcrumbList",
    "@id": `${seo.canonical}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE_NAME,
        item: `${SITE_ORIGIN}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: label,
        item: seo.canonical,
      },
    ],
  };
}

function cenikOfferNodes(): Record<string, unknown>[] {
  const seller = { "@id": `${SITE_ORIGIN}/#organization` };
  const pageUrl = `${SITE_ORIGIN}/cenik`;

  return [
    {
      "@type": "Offer",
      "@id": `${pageUrl}#offer-ob-skodi`,
      name: "Ob škodi – žeton",
      description: "Žeton za preverjanje udarov strel in izdelavo PDF-poročila.",
      price: OB_SKODI_TOKEN_PRICE_GROSS_EUR,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: pageUrl,
      seller,
    },
    {
      "@type": "Offer",
      "@id": `${pageUrl}#offer-podpornik`,
      name: "Podpornik",
      description: "Mesečna naročnina z dostopom do arhiva, statistik in widgeta.",
      price: PODPORNIST_MONTHLY_PRICE_GROSS_EUR,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: pageUrl,
      seller,
    },
  ];
}

function cenikFaqJsonLd(): Record<string, unknown> {
  const pageUrl = `${SITE_ORIGIN}/cenik`;
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: PRICING_FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function pageJsonLd(pathname: string, seo: PageSeo): Record<string, unknown> {
  const path = normalizePathname(pathname);
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": `${seo.canonical}#webpage`,
      name: seo.title,
      description: seo.description,
      url: seo.canonical,
      inLanguage: "sl",
      isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
    },
  ];

  const breadcrumb = breadcrumbJsonLd(path, seo);
  if (breadcrumb && (LEGAL_PATHS.has(path) || BREADCRUMB_LABELS[path])) {
    graph.push(breadcrumb);
  }

  if (path === "/cenik") {
    graph.push(...cenikOfferNodes(), cenikFaqJsonLd());
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export function sitemapXml(lastmod: string): string {
  const urls = SITEMAP_ENTRIES.map((entry) => {
    const loc = entry.path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${entry.path}`;
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${entry.changefreq}</changefreq>`,
      `    <priority>${entry.priority.toFixed(1)}</priority>`,
      "  </url>",
    ].join("\n");
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
