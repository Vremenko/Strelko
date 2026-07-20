export type ArchiveEmbedAccess = {
  hourlyAccess?: boolean;
};

export function archiveEmbedUrl(
  scope: "preview" | "full" = "full",
  archiveFullAccess = true,
  access: ArchiveEmbedAccess = {},
  opts?: { days?: number; publicEmbed?: boolean }
): string {
  const days = opts?.days != null && opts.days > 0 ? opts.days : 30;
  const publicEmbed = !!opts?.publicEmbed;
  const params = new URLSearchParams({
    days: String(days),
    /* Javni: isti izbirnik obdobja kot na Statistiki (brez Po meri — v embed.html). */
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
    if (publicEmbed) {
      /* Javni: dnevni + Po urah + regije; brez občin / zaklepov. */
      params.set("public", "1");
      params.set("hourly", "1");
    } else {
      if (archiveFullAccess) {
        params.set("obcine", "1");
      }
      if (access.hourlyAccess) {
        params.set("hourly", "1");
      }
    }
  }
  return `/arhiv/public/embed?${params}`;
}

export function archiveMapEmbedUrl(
  days = 30,
  opts?: {
    hideChrome?: boolean;
    day?: string;
    defaultRangeDays?: number;
    /** Skrij zavihek Mreža 1 × 1 km (javni embed). */
    hideGrid?: boolean;
    /** Eksplicitno brez Podpornik dostopa. */
    supporter?: boolean;
  }
): string {
  const params = new URLSearchParams({
    api: "/arhiv",
    refresh_sec: "600",
    v: "18",
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
  if (opts?.hideGrid) params.set("grid", "0");
  if (opts?.supporter === false) params.set("supporter", "0");
  if (opts?.supporter === true) params.set("supporter", "1");
  return `/arhiv/public/map-embed.html?${params}`;
}
