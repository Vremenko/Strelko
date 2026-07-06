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
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t: string | null): void {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

export const SEARCH_RADIUS_KM = 20;
