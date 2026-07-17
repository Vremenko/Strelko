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
    } else if (detail && typeof detail === "object" && !Array.isArray(detail)) {
      const structured = detail as { message?: string };
      if (typeof structured.message === "string") {
        message = structured.message;
      }
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

async function requestWithCredentials<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
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
    } else if (detail && typeof detail === "object" && !Array.isArray(detail)) {
      const structured = detail as { message?: string };
      if (typeof structured.message === "string") {
        message = structured.message;
      }
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
  queryQuote: (body: object) =>
    request<import("../types").QueryQuoteOut>("/strelko/queries/quote", {
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
      const detail = (data as { detail?: unknown }).detail;
      let message = res.statusText;
      if (typeof detail === "string") {
        message = detail;
      } else if (detail && typeof detail === "object" && !Array.isArray(detail)) {
        const structured = detail as { message?: string };
        if (typeof structured.message === "string") {
          message = structured.message;
        }
      }
      const err = new Error(message) as import("../types").ApiError;
      err.status = res.status;
      err.data = data;
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
  resendVerification: (email: string) =>
    request<{ message?: string }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email, client_app: "strelko" }),
    }),
  resetPassword: (token: string, password: string) =>
    request<{ message?: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
  whoami: () => request<import("../types").User>("/auth/whoami"),
  checkout: (body: { plan: string; quantity?: number }) =>
    request<{ checkout_url: string; session_id: string }>("/strelko/checkout", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  billingPortal: () =>
    request<{ portal_url: string }>("/strelko/billing-portal", { method: "POST", body: "{}" }),
  restoreSubscription: () =>
    request<import("../types").Credits>("/strelko/subscription/restore", {
      method: "POST",
      body: "{}",
    }),
  billingHistory: (opts?: { page?: number; page_size?: number }) => {
    const page = opts?.page ?? 0;
    const pageSize = opts?.page_size ?? 8;
    const q = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });
    return request<import("../types").BillingHistory>(`/strelko/billing/history?${q}`);
  },
  downloadInvoicePdf: async (invoiceId: number) => {
    const res = await fetch(
      `${API_BASE}/strelko/invoices/${invoiceId}/pdf?t=${Date.now()}`,
      {
        headers: { ...authHeaders() },
        cache: "no-store",
      }
    );
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const detail = (data as { detail?: unknown }).detail;
      let message = res.statusText;
      if (typeof detail === "string") {
        message = detail;
      }
      const err = new Error(message) as import("../types").ApiError;
      err.status = res.status;
      err.data = data;
      throw err;
    }
    const disposition = res.headers.get("Content-Disposition") || "";
    const rawName =
      /filename\*=UTF-8''([^;]+)/i.exec(disposition)?.[1] ||
      /filename="([^"]+)"/i.exec(disposition)?.[1] ||
      /filename=([^;]+)/i.exec(disposition)?.[1] ||
      "";
    let filename = "racun.pdf";
    if (rawName) {
      try {
        filename = decodeURIComponent(rawName.trim().replace(/^["']|["']$/g, ""));
      } catch {
        filename = rawName.trim().replace(/^["']|["']$/g, "");
      }
    }
    const buf = await res.arrayBuffer();
    return new File([buf], filename, { type: "application/pdf" });
  },
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
  obcinaWidgetPreviewToken: (body: object) =>
    requestWithCredentials<import("../lib/widget-obcine").ObcinaWidgetPreviewToken>(
      "/strelko/obcina-widgets/preview-token",
      { method: "POST", body: JSON.stringify(body) }
    ),
  listObcinaWidgets: () =>
    request<import("../lib/widget-obcine").ObcinaWidgetList>("/strelko/obcina-widgets"),
  createObcinaWidget: (body: object) =>
    request<import("../lib/widget-obcine").ObcinaWidgetPublic>("/strelko/obcina-widgets", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  patchObcinaWidget: (publicKey: string, body: object) =>
    request<import("../lib/widget-obcine").ObcinaWidgetPublic>(
      `/strelko/obcina-widgets/${encodeURIComponent(publicKey)}`,
      { method: "PATCH", body: JSON.stringify(body) }
    ),
  verifyObcinaWidgetPublic: (publicKey: string) =>
    request<import("../lib/widget-obcine").ObcinaWidgetPublic>(
      `/strelko/obcina-widgets/public/${encodeURIComponent(publicKey)}`
    ),
};

function adminQuery(params: Record<string, string | number | boolean | undefined>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const adminApi = {
  summary: () => request<import("../types").AdminStrelkoSummary>("/admin/strelko/summary"),
  listInvoices: (params: {
    furs_status?: string;
    user_id?: number;
    email?: string;
    limit?: number;
    offset?: number;
  }) =>
    request<{ items: import("../types").AdminStrelkoInvoice[]; total: number }>(
      `/admin/strelko/invoices${adminQuery(params)}`
    ),
  downloadInvoicePdf: async (invoiceId: number) => {
    const res = await fetch(`${API_BASE}/admin/strelko/invoices/${invoiceId}/pdf`, {
      headers: { ...authHeaders() },
      cache: "no-store",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(
        typeof (data as { detail?: string }).detail === "string"
          ? (data as { detail: string }).detail
          : res.statusText
      );
    }
    return res.blob();
  },
  retryFurs: (invoiceId: number) =>
    request<{ ok: boolean; message?: string }>(
      `/admin/strelko/invoices/${invoiceId}/retry-furs`,
      { method: "POST", body: "{}" }
    ),
  resendEmail: (invoiceId: number) =>
    request<{ ok: boolean; message?: string }>(
      `/admin/strelko/invoices/${invoiceId}/resend-email`,
      { method: "POST", body: "{}" }
    ),
  reconcile: (params: {
    lookback_days?: number;
    auto_issue?: boolean;
    send_email?: boolean;
  }) =>
    request<import("../types").AdminStrelkoReconcileResult>(
      `/admin/strelko/reconcile${adminQuery(params)}`,
      { method: "POST", body: "{}" }
    ),
  issueMissing: (refType: string, refId: string) =>
    request<{ ok: boolean; message?: string; invoice_number?: string }>(
      "/admin/strelko/issue-missing",
      { method: "POST", body: JSON.stringify({ ref_type: refType, ref_id: refId }) }
    ),
  listUsers: (params: {
    email?: string;
    page?: number;
    page_size?: number;
    limit?: number;
    offset?: number;
  }) =>
    request<import("../types").AdminStrelkoUserList>(`/admin/strelko/users${adminQuery(params)}`),
  userSuggest: (q: string, limit = 8) =>
    request<{ items: { id: number; email: string }[] }>(
      `/admin/strelko/users/suggest${adminQuery({ q, limit })}`
    ),
  getUser: (userId: number) =>
    request<import("../types").AdminStrelkoUserDetail>(`/admin/strelko/users/${userId}`),
  grantCredits: (userId: number, amount: number, note?: string) =>
    request<{ credits_balance: number; amount_granted: number }>(
      `/admin/strelko/users/${userId}/grant-credits`,
      { method: "POST", body: JSON.stringify({ amount, note: note || null }) }
    ),
  activatePodpornik: (userId: number, expiresOn: string) =>
    request<{
      ok: boolean;
      podpornik_active: boolean;
      podpornik_manual: boolean;
      season_pass_expires_at?: string | null;
      message?: string;
    }>(`/admin/strelko/users/${userId}/activate-podpornik`, {
      method: "POST",
      body: JSON.stringify({ expires_on: expiresOn }),
    }),
  cancelPodpornik: (userId: number) =>
    request<{
      ok: boolean;
      mode: string;
      cancel_at_period_end?: boolean | null;
      podpornik_active: boolean;
      season_pass_expires_at?: string | null;
      message: string;
    }>(`/admin/strelko/users/${userId}/cancel-podpornik`, { method: "POST" }),
  deleteUser: (userId: number, confirmEmail: string) =>
    request<{ ok: boolean; deleted_user_id: number; message?: string }>(
      `/admin/strelko/users/${userId}`,
      { method: "DELETE", body: JSON.stringify({ confirm_email: confirmEmail }) }
    ),
  smsSummary: () =>
    request<import("../types").AdminStrelkoSmsSummary>("/admin/strelko/sms/summary"),
  smsScenarios: () =>
    request<import("../types").AdminStrelkoSmsScenarioList>("/admin/strelko/sms/scenarios"),
  smsPreview: (userId: number, scenarioId = "standard") =>
    request<import("../types").AdminStrelkoSmsPreview>(
      `/admin/strelko/sms/preview?user_id=${userId}&scenario_id=${encodeURIComponent(scenarioId)}`
    ),
  smsNotifications: (params?: { limit?: number; offset?: number }) =>
    request<{ items: import("../types").AdminStrelkoSmsNotification[]; total: number }>(
      `/admin/strelko/sms/notifications${adminQuery(params || {})}`
    ),
  smsSubscribers: (params?: { limit?: number; offset?: number }) =>
    request<{ items: import("../types").AdminStrelkoSmsSubscriber[]; total: number }>(
      `/admin/strelko/sms/subscribers${adminQuery(params || {})}`
    ),
  upsertSmsSubscriber: (body: import("../types").AdminStrelkoSmsSubscriberUpsert) =>
    request<{ ok: boolean; message: string; subscriber: import("../types").AdminStrelkoSmsSubscriber }>(
      "/admin/strelko/sms/subscribers",
      { method: "POST", body: JSON.stringify(body) }
    ),
  removeSmsSubscriber: (userId: number) =>
    request<{ ok: boolean; message: string; subscriber: import("../types").AdminStrelkoSmsSubscriber }>(
      `/admin/strelko/sms/subscribers/${userId}`,
      { method: "DELETE" }
    ),
  sendSms: (body: { user_id: number; scenario_id?: string }) =>
    request<import("../types").AdminStrelkoSmsSendResult>("/admin/strelko/sms/send", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
