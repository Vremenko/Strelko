import { hasArchiveFullAccess } from "./season";

export function archiveEmbedUrl(_loggedIn: boolean, scope: "preview" | "full" = "full"): string {
  const params = new URLSearchParams({
    days: "30",
    controls: "1",
    stats: "1",
    credit: "0",
    api: "/arhiv",
    theme: "dark",
    refresh_sec: "600",
  });
  if (scope === "preview") {
    params.set("chart", "daily");
    params.set("compact", "1");
    params.set("title", "0");
    params.set("stats", "0");
  } else {
    params.set("chart", "all");
    params.set("obcine", "1");
    if (!hasArchiveFullAccess()) params.set("locked", "1");
  }
  return `/arhiv/public/embed?${params}`;
}

export function archiveMapEmbedUrl(days = 30): string {
  return `/arhiv/public/map-embed.html?${new URLSearchParams({
    api: "/arhiv",
    days: String(days),
    refresh_sec: "600",
    v: "3",
  })}`;
}

export { initArchiveEmbedTap, initArchiveDaysOverlay } from "./archive-embed-interaction";
