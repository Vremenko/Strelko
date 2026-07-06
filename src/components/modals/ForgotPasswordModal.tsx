import { FormEvent, useState } from "react";
import { api } from "../../api/client";
import { useStrelko } from "../../context/StrelkoContext";

export function ForgotPasswordModal() {
  const { modals, closeForgotPassword, openAuth } = useStrelko();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!modals.forgotPassword) return null;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") || "");
    try {
      setError("");
      setSuccess("");
      const res = await api.forgotPassword(email);
      setSuccess(
        res.message ||
          "Če račun s tem e-poštnim naslovom obstaja, smo poslali navodila za ponastavitev gesla."
      );
    } catch (err) {
      setSuccess("");
      setError((err as Error).message || "Napaka");
    }
  };

  const backToLogin = () => {
    closeForgotPassword();
    openAuth("login");
  };

  return (
    <div className="modal-overlay" id="forgot-password-modal">
      <div className="modal">
        <h3>Ponastavitev gesla</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "0 0 1rem" }}>
          Vnesite e-poštni naslov računa. Poslali vam bomo povezavo za novo geslo.
        </p>
        <form id="forgot-password-form" onSubmit={onSubmit}>
          <input
            type="email"
            name="email"
            placeholder="E-pošta"
            required
            autoComplete="email"
          />
          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Pošlji povezavo
          </button>
        </form>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: "100%", marginTop: "0.5rem" }}
          onClick={backToLogin}
        >
          Nazaj na prijavo
        </button>
      </div>
    </div>
  );
}
