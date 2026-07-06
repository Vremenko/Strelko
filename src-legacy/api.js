const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

function authHeaders() {
  const token = localStorage.getItem("strelko_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.detail || res.statusText);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  preview: (body) =>
    request("/strelko/preview", { method: "POST", body: JSON.stringify(body) }),
  search: (body) =>
    request("/strelko/search", { method: "POST", body: JSON.stringify(body) }),
  downloadReportPdf: async (body) => {
    const res = await fetch(`${API_BASE}/strelko/report/pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const err = new Error(
        typeof data.detail === "string" ? data.detail : res.statusText
      );
      err.status = res.status;
      throw err;
    }
    return res.blob();
  },
  plans: () => request("/strelko/plans"),
  credits: () => request("/strelko/credits"),
  alerts: () => request("/strelko/alerts"),
  updateAlerts: (body) =>
    request("/strelko/alerts", { method: "PUT", body: JSON.stringify(body) }),
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (email, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, client_app: "strelko" }),
    }),
  verifyEmail: (token) =>
    request("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
  whoami: () => request("/auth/whoami"),
  checkout: (plan = "basic") =>
    request("/strelko/checkout", {
      method: "POST",
      body: JSON.stringify({ plan }),
    }),
  billingPortal: () =>
    request("/strelko/billing-portal", { method: "POST", body: "{}" }),
  verifyCheckout: (sessionId) =>
    request("/strelko/checkout/verify", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId }),
    }),
  loginGoogle: (credential) =>
    request("/auth/oauth/google", {
      method: "POST",
      body: JSON.stringify({ id_token: credential, client_app: "strelko" }),
    }),
};
