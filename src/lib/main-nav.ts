/** Glavna navigacija — določanje aktivne povezave iz poti (brez query/hash). */

export type MainNavId = "zavarovalnica" | "statistika" | "widget" | "cenik" | "moj-strelko";

const NAV_PREFIX: Readonly<Record<MainNavId, string>> = {
  zavarovalnica: "/pomoc-pri-zavarovalnici",
  statistika: "/statistika",
  widget: "/widget-obcine",
  cenik: "/cenik",
  "moj-strelko": "/moj-strelko",
};

/** Vrne ID aktivne glavne povezave ali null (npr. domov, pravne strani). */
export function activeMainNavId(pathname: string): MainNavId | null {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === NAV_PREFIX["moj-strelko"] || path.startsWith(`${NAV_PREFIX["moj-strelko"]}/`)) {
    return "moj-strelko";
  }
  if (path === NAV_PREFIX.zavarovalnica || path.startsWith(`${NAV_PREFIX.zavarovalnica}/`)) {
    return "zavarovalnica";
  }
  if (path === NAV_PREFIX.statistika || path.startsWith(`${NAV_PREFIX.statistika}/`)) {
    return "statistika";
  }
  if (path === NAV_PREFIX.widget || path.startsWith(`${NAV_PREFIX.widget}/`)) {
    return "widget";
  }
  if (path === NAV_PREFIX.cenik || path.startsWith(`${NAV_PREFIX.cenik}/`)) {
    return "cenik";
  }

  return null;
}

export function isMainNavActive(pathname: string, id: MainNavId): boolean {
  return activeMainNavId(pathname) === id;
}

export function mainNavLinkClass(pathname: string, id: MainNavId, extra = ""): string {
  const active = isMainNavActive(pathname, id);
  return ["nav-link", extra, active ? "is-active" : ""].filter(Boolean).join(" ");
}
