const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("strelko_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers as Record<string, string>),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = (data as { detail?: unknown }).detail;
    let message = res.statusText;
    if (typeof detail === "string") {
      message = detail;
    } else if (Array.isArray(detail) && detail.length) {
      message = detail
        .map((item) => (typeof item?.msg === "string" ? item.msg : ""))
        .filter(Boolean)
        .join(" ");
    }
    const err = new Error(message) as import("../types").ApiError;
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

export const api = {
  preview: (body: object) =>
    request("/strelko/preview", { method: "POST", body: JSON.stringify(body) }),
  search: (body: object) =>
    request("/strelko/search", { method: "POST", body: JSON.stringify(body) }),
  listQueries: () => request<import("../types").SavedQueryListOut>("/strelko/queries"),
  getQuery: (queryId: string) =>
    request<import("../types").SavedQueryOut>(`/strelko/queries/${encodeURIComponent(queryId)}`),
  executeQuery: (body: object) =>
    request<import("../types").SavedQueryOut>("/strelko/queries", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  generateQueryPdf: async (queryId: string) => {
    const res = await fetch(
      `${API_BASE}/strelko/queries/${encodeURIComponent(queryId)}/pdf`,
      {
        method: "POST",
        headers: { ...authHeaders() },
      }
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const err = new Error(
        typeof (data as { detail?: string }).detail === "string"
          ? (data as { detail: string }).detail
          : res.statusText
      ) as import("../types").ApiError;
      err.status = res.status;
      throw err;
    }
    return res.blob();
  },
  downloadReportPdf: async (body: object) => {
    const res = await fetch(`${API_BASE}/strelko/report/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const err = new Error(
        typeof (data as { detail?: string }).detail === "string"
          ? (data as { detail: string }).detail
          : res.statusText
      ) as import("../types").ApiError;
      err.status = res.status;
      throw err;
    }
    return res.blob();
  },
  plans: () =>
    request<{
      plans: import("../types").Plan[];
      payments_enabled?: boolean;
      season_label_sl?: string;
      archive_free_now?: boolean;
      in_lightning_season?: boolean;
    }>("/strelko/plans"),
  credits: () => request<import("../types").Credits>("/strelko/credits"),
  alerts: () => request<import("../types").AlertsSettings>("/strelko/alerts"),
  updateAlerts: (body: object) =>
    request("/strelko/alerts", { method: "PUT", body: JSON.stringify(body) }),
  login: (email: string, password: string) =>
    request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, client_app: "strelko" }),
    }),
  verifyEmail: (token: string) =>
    request<{ message?: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
  forgotPassword: (email: string) =>
    request<{ message?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email, client_app: "strelko" }),
    }),
  resetPassword: (token: string, password: string) =>
    request<{ message?: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
  whoami: () => request<import("../types").User>("/auth/whoami"),
  checkout: (plan = "basic") =>
    request<{ checkout_url: string }>("/strelko/checkout", {
      method: "POST",
      body: JSON.stringify({ plan }),
    }),
  billingPortal: () =>
    request<{ portal_url: string }>("/strelko/billing-portal", { method: "POST", body: "{}" }),
  verifyCheckout: (sessionId: string) =>
    request<{
      credits_added: number;
      credits_balance: number;
      plan_id?: string;
      plan_name_sl?: string;
    }>("/strelko/checkout/verify", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId }),
    }),
  loginGoogle: (credential: string) =>
    request<{ access_token: string }>("/auth/oauth/google", {
      method: "POST",
      body: JSON.stringify({ id_token: credential, client_app: "strelko" }),
    }),
  dayStrikes: (body: object) =>
    request<import("../types").StrikePoint[]>("/strelko/strikes/day", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  periodStrikes: (body: object) =>
    request<import("../types").StrikePoint[]>("/strelko/strikes/period", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  dayHourly: (body: object) =>
    request<import("../types").HourlyChartData>("/strelko/strikes/hourly", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  widget: () => request<import("../types").UserWidgetConfig>("/strelko/widget"),
  updateWidget: (body: {
    lat: number;
    lon: number;
    label?: string | null;
    domain?: string | null;
  }) =>
    request<import("../types").UserWidgetConfig>("/strelko/widget", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};
