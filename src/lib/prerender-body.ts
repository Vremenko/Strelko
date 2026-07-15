/** Statistična HTML vsebina za prerender v #app (crawlerji, brez flasha ob nalaganju). */

import { LEGAL_PAGES } from "./legal";
import { resolvePageSeo, type PageSeo } from "./page-seo";

export type PrerenderLink = {
  href: string;
  label: string;
};

export type PrerenderSnapshot = {
  heading: string;
  description: string;
  excerpt?: string;
  sectionTitles?: string[];
  links?: PrerenderLink[];
};

const SITE_NAV_LINKS: PrerenderLink[] = [
  { href: "/", label: "Domača stran" },
  { href: "/pomoc-pri-zavarovalnici", label: "Pomoč pri zavarovalnici" },
  { href: "/statistika", label: "Statistika strel" },
  { href: "/widget-obcine", label: "Widget za občine" },
  { href: "/cenik", label: "Cenik" },
];

const LEGAL_NAV_LINKS: PrerenderLink[] = Object.values(LEGAL_PAGES).map((page) => ({
  href: page.path,
  label: "navTitle" in page && typeof page.navTitle === "string" ? page.navTitle : page.title,
}));

const LEGAL_BY_PATH = Object.fromEntries(
  Object.values(LEGAL_PAGES).map((page) => [page.path, page])
) as Record<string, (typeof LEGAL_PAGES)[keyof typeof LEGAL_PAGES]>;

const HEADINGS: Record<string, string> = {
  "/": "Preverite udare strel v svoji bližini",
  "/pomoc-pri-zavarovalnici":
    "Vam je strela poškodovala klimatsko napravo, televizijo ali drugo elektroniko?",
  "/statistika": "Statistika strel v Sloveniji",
  "/widget-obcine": "Widget udarov strel za spletne strani",
  "/cenik": "Cenik",
  "/impressum": "Impressum",
  "/pogoji-uporabe": "Pogoji uporabe",
  "/zasebnost": "Politika zasebnosti",
  "/piskotki": "Politika piškotkov",
  "/pravice-potrosnikov": "Pravice potrošnikov",
  "/moj-strelko": "Moj Strelko",
  "/verify-email": "Potrditev e-poštnega naslova",
  "/reset-password": "Ponastavitev gesla",
};

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstParagraphFromHtml(html: string): string {
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  return match ? stripHtml(match[1]) : "";
}

function legalSnapshotExtras(routePath: string): Pick<PrerenderSnapshot, "excerpt" | "sectionTitles"> {
  const page = LEGAL_BY_PATH[routePath];
  if (!page?.sections.length) return {};

  return {
    excerpt: firstParagraphFromHtml(page.sections[0].body),
    sectionTitles: page.sections.map((section) => section.title),
  };
}

export function prerenderSnapshotForRoute(routePath: string, seo?: PageSeo): PrerenderSnapshot {
  const meta = seo ?? resolvePageSeo(routePath, "");
  const heading = HEADINGS[routePath] ?? meta.title.replace(/\s*–\s*Strelko\s*$/u, "").trim();
  const legal = LEGAL_BY_PATH[routePath];

  const links = legal
    ? LEGAL_NAV_LINKS
    : routePath === "/" || HEADINGS[routePath]
      ? SITE_NAV_LINKS
      : undefined;

  return {
    heading,
    description: meta.description,
    ...(legal ? legalSnapshotExtras(routePath) : {}),
    links,
  };
}

export function renderPrerenderSnapshotHtml(routePath: string): string {
  const snapshot = prerenderSnapshotForRoute(routePath);
  const parts = [
    `<div id="prerender-snapshot" class="prerender-snapshot">`,
    "<main>",
    `<h1>${escapeHtml(snapshot.heading)}</h1>`,
    `<p>${escapeHtml(snapshot.description)}</p>`,
  ];

  if (snapshot.excerpt) {
    parts.push(`<p>${escapeHtml(snapshot.excerpt)}</p>`);
  }

  if (snapshot.sectionTitles?.length) {
    parts.push("<h2>Pregled vsebine</h2>", "<ul>");
    for (const title of snapshot.sectionTitles) {
      parts.push(`<li>${escapeHtml(title)}</li>`);
    }
    parts.push("</ul>");
  }

  if (snapshot.links?.length) {
    const navLabel = LEGAL_BY_PATH[routePath] ? "Pravne informacije" : "Glavna navigacija";
    parts.push(`<nav aria-label="${navLabel}">`);
    for (const link of snapshot.links) {
      parts.push(`<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`);
    }
    parts.push("</nav>");
  }

  parts.push("</main>", "</div>");
  return parts.join("");
}
