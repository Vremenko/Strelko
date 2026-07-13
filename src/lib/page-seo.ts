/** SEO meta podatki po poti — title, description, canonical, robots, OG/Twitter, JSON-LD. */

export const SITE_ORIGIN = "https://strelko.meteoinfo.si";
export const SITE_NAME = "Strelko";
export const OG_IMAGE_URL = `${SITE_ORIGIN}/og-image.png`;
export const OG_IMAGE_ALT = "Strelko – pregled udarov strel v Sloveniji";
export const OG_LOCALE = "sl_SI";
export const ORGANIZATION_NAME = "Meteoinfo d.o.o.";
export const ORGANIZATION_URL = "https://meteoinfo.si";

export const SEO_FALLBACK = {
  title: "Strelko – pregled udarov strel v Sloveniji",
  description:
    "Strelko omogoča informativni pregled zaznanih udarov strel, arhiva, statistike in izdelavo PDF-poročil.",
} as const;

export type RobotsDirective = "index, follow" | "noindex, follow";

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
  "/pravice-potrosnikov": {
    title: "Pravice potrošnikov – Strelko",
    description:
      "Povzetek potrošniških pravic pri nakupu žetonov, paketa Podpornik in digitalnih storitev Strelka.",
    canonical: `${SITE_ORIGIN}/pravice-potrosnikov`,
  },
};

const NOINDEX_PATHS = new Set(["/moj-strelko", "/verify-email", "/reset-password"]);

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
  "/pravice-potrosnikov",
] as const;

/** Vse znane SPA poti (prerender + 200); neznane → HTTP 404 + noindex. */
export const KNOWN_APP_PATHS = [
  ...SITEMAP_PATHS,
  "/moj-strelko",
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
      robots: "noindex, follow",
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

export function socialMetaFromPageSeo(seo: PageSeo): SocialMeta {
  return {
    ogTitle: seo.title,
    ogDescription: seo.description,
    ogUrl: seo.canonical,
    ogImage: OG_IMAGE_URL,
    ogImageAlt: OG_IMAGE_ALT,
    ogSiteName: SITE_NAME,
    ogLocale: OG_LOCALE,
    ogType: "website",
    twitterCard: "summary_large_image",
    twitterTitle: seo.title,
    twitterDescription: seo.description,
    twitterImage: OG_IMAGE_URL,
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
        url: ORGANIZATION_URL,
        email: "ekipa@meteoinfo.si",
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

export function pageJsonLd(seo: PageSeo): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: seo.title,
    description: seo.description,
    url: seo.canonical,
    inLanguage: "sl",
    isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
  };
}

export function sitemapXml(lastmod: string): string {
  const urls = SITEMAP_PATHS.map((routePath) => {
    const loc = routePath === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${routePath}`;
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
