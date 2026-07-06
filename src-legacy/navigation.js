/** Path ↔ view routing for Strelko SPA. */

export function resolveViewFromPath(
  pathname = window.location.pathname,
  hash = window.location.hash
) {
  if (pathname === "/statistika" || pathname === "/statistika/") {
    const tab = hash.replace("#", "");
    const statTab = tab === "zemljevid" || tab === "grafi" ? tab : "grafi";
    return { view: "statistika", statTab };
  }
  if (pathname === "/widget-obcine" || pathname === "/widget-obcine/") {
    return { view: "widget-obcine" };
  }
  if (
    pathname === "/pomoc-pri-zavarovalnici" ||
    pathname === "/pomoc-pri-zavarovalnici/"
  ) {
    return { view: "zavarovalnica" };
  }
  return { view: "landing" };
}

export function pathForView(view, statTab = "grafi") {
  if (view === "statistika") {
    return statTab && statTab !== "grafi" ? `/statistika#${statTab}` : "/statistika";
  }
  if (view === "widget-obcine") return "/widget-obcine";
  if (view === "zavarovalnica") return "/pomoc-pri-zavarovalnici";
  return "/";
}

export function navigateToView(state, view, { statTab, render } = {}) {
  state.legalPage = null;
  if (statTab) state.statistikaTab = statTab;
  state.view = view;
  const path = pathForView(view, state.statistikaTab);
  window.history.pushState({ view, statTab: state.statistikaTab || null }, "", path);
  render();
  window.scrollTo(0, 0);
}
