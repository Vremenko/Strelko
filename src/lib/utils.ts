export function escapeHtml(s: string): string {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

export function formatPlaceName(label?: string | null): string {
  if (!label) return "";
  return label.split(",")[0].trim();
}

export const TOKEN_KEY = "strelko_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    /* zasebno brskanje / blokirana shramba */
    return null;
  }
}

export function setToken(t: string | null): void {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* Zavrzi — klicatelj naj napako prijave obravnava prek whoami / UI. */
    if (t) {
      throw new Error(
        "Brskalnik ne dovoli shranjevanja prijave. Poskusite v običajnem (ne zasebnem) načinu."
      );
    }
  }
}

export const SEARCH_RADIUS_KM = 20;
