import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useStrelko } from "../context/StrelkoContext";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const { openForgotPassword, openAuth } = useStrelko();
  const [status, setStatus] = useState<"form" | "ok" | "error">("form");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Manjka žeton. Uporabite povezavo iz e-pošte.");
    } else {
      setStatus("form");
    }
  }, [token]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") || "");
    const passwordConfirm = String(fd.get("password_confirm") || "");
    if (password !== passwordConfirm) {
      setFormError("Gesli se ne ujemata.");
      return;
    }
    const btn = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    if (btn) btn.disabled = true;
    try {
      setFormError("");
      const res = await api.resetPassword(token, password);
      setStatus("ok");
      setMessage(res.message || "Geslo je posodobljeno. Zdaj se lahko prijavite.");
      window.history.replaceState({}, "", "/reset-password?done=1");
    } catch (err) {
      const detail = (err as { data?: { detail?: string } }).data?.detail;
      setFormError(
        typeof detail === "string" ? detail : "Povezava je neveljavna ali je potekla."
      );
      if (btn) btn.disabled = false;
    }
  };

  const requestNewLink = () => {
    openForgotPassword();
    navigate("/");
  };

  if (status === "error") {
    return (
      <section className="verify-email-panel">
        <div className="verify-email-card error">
          <p className="verify-email-icon">✕</p>
          <h2>Ponastavitev gesla</h2>
          <p>{message}</p>
          <button type="button" className="btn btn-primary" onClick={requestNewLink}>
            Zahtevaj novo povezavo
          </button>
        </div>
      </section>
    );
  }

  if (status === "ok") {
    return (
      <section className="verify-email-panel">
        <div className="verify-email-card ok">
          <p className="verify-email-icon">✓</p>
          <h2>Geslo posodobljeno</h2>
          <p>{message}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              navigate("/");
              openAuth("login");
            }}
          >
            Prijava
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="verify-email-panel">
      <div className="verify-email-card">
        <h2>Novo geslo</h2>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
          Izberite geslo z vsaj 8 znaki.
        </p>
        <form id="reset-password-form" className="reset-password-form" onSubmit={onSubmit}>
          <input
            type="password"
            name="password"
            placeholder="Novo geslo"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <input
            type="password"
            name="password_confirm"
            placeholder="Ponovite geslo"
            required
            minLength={8}
            autoComplete="new-password"
          />
          {formError && <p className="form-error">{formError}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Shrani geslo
          </button>
        </form>
      </div>
    </section>
  );
}
