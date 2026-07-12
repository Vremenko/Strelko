export function archiveEmbedUrl(
  scope: "preview" | "full" = "full",
  archiveFullAccess = true
): string {
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
    if (archiveFullAccess) {
      params.set("obcine", "1");
    }
  }
  return `/arhiv/public/embed?${params}`;
}

export function archiveMapEmbedUrl(
  days = 30,
  opts?: { hideChrome?: boolean; day?: string; defaultRangeDays?: number }
): string {
  const params = new URLSearchParams({
    api: "/arhiv",
    refresh_sec: "600",
    v: "7",
  });
  if (opts?.day) {
    params.set("day", opts.day);
  } else {
    params.set("days", String(days));
  }
  if (opts?.defaultRangeDays != null) {
    params.set("default_range_days", String(opts.defaultRangeDays));
  }
  if (opts?.hideChrome) params.set("chrome", "0");
  return `/arhiv/public/map-embed.html?${params}`;
}
