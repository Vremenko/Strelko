/** Statistična HTML vsebina za prerender v #app (crawlerji, brez flasha ob nalaganju). */

import { resolvePageSeo, type PageSeo } from "./page-seo";

export type PrerenderLink = {
  href: string;
  label: string;
};

export type PrerenderSnapshot = {
  heading: string;
  description: string;
  links?: PrerenderLink[];
};

const SITE_NAV_LINKS: PrerenderLink[] = [
  { href: "/", label: "Domača stran" },
  { href: "/pomoc-pri-zavarovalnici", label: "Pomoč pri zavarovalnici" },
  { href: "/statistika", label: "Statistika strel" },
  { href: "/widget-obcine", label: "Widget za občine" },
  { href: "/cenik", label: "Cenik" },
];

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

export function prerenderSnapshotForRoute(routePath: string, seo?: PageSeo): PrerenderSnapshot {
  const meta = seo ?? resolvePageSeo(routePath, "");
  const heading = HEADINGS[routePath] ?? meta.title.replace(/\s*–\s*Strelko\s*$/u, "").trim();

  const links = routePath === "/" || HEADINGS[routePath] ? SITE_NAV_LINKS : undefined;

  return {
    heading,
    description: meta.description,
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

  if (snapshot.links?.length) {
    parts.push('<nav aria-label="Glavna navigacija">');
    for (const link of snapshot.links) {
      parts.push(`<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`);
    }
    parts.push("</nav>");
  }

  parts.push("</main>", "</div>");
  return parts.join("");
}
