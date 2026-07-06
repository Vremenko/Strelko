import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Prosimo počakajte …");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Manjka žeton za potrditev. Uporabite povezavo iz e-pošte.");
      return;
    }
    void (async () => {
      try {
        const res = await api.verifyEmail(token);
        setStatus("ok");
        setMessage(
          res.message ||
            "Račun je aktiviran. Zdaj se lahko prijavite in preverite udare strel."
        );
        window.history.replaceState({}, "", "/verify-email?verified=1");
      } catch (e) {
        setStatus("error");
        const err = e as { data?: { detail?: string } };
        setMessage(
          typeof err.data?.detail === "string"
            ? err.data.detail
            : "Povezava je neveljavna ali je potekla."
        );
      }
    })();
  }, [token]);

  const icon = status === "ok" ? "✓" : status === "loading" ? "…" : "✕";
  const title =
    status === "ok"
      ? "E-pošta potrjena"
      : status === "loading"
        ? "Potrjujem e-pošto …"
        : "Potrditev ni uspela";

  return (
    <section className="verify-email-panel">
      <div className={`verify-email-card ${status}`}>
        <p className="verify-email-icon">{icon}</p>
        <h2>{title}</h2>
        <p>{message}</p>
        {status === "ok" && (
          <Link to="/" className="btn btn-primary">
            Nadaljuj na Strelko
          </Link>
        )}
      </div>
    </section>
  );
}
