import { FormEvent, useState } from "react";
import { api } from "../../api/client";
import { useStrelko } from "../../context/StrelkoContext";

export function ForgotPasswordModal() {
  const { modals, closeForgotPassword, openAuth } = useStrelko();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!modals.forgotPassword) return null;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") || "").trim();
    try {
      setError("");
      setSuccess("");
      setSubmitting(true);
      const res = await api.forgotPassword(email);
      setSuccess(
        res.message ||
          "Če račun s tem e-poštnim naslovom obstaja, smo poslali navodila za ponastavitev gesla."
      );
    } catch (err) {
      setSuccess("");
      setError(
        (err as Error).message ||
          "Povezave za ponastavitev gesla trenutno ni bilo mogoče poslati. Poskusite znova."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const backToLogin = () => {
    closeForgotPassword();
    openAuth("login");
  };

  return (
    <div
      className="modal-overlay"
      id="forgot-password-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeForgotPassword();
      }}
    >
      <div className="modal auth-modal">
        <button
          type="button"
          className="modal-close-btn"
          aria-label="Zapri"
          onClick={closeForgotPassword}
        >
          ×
        </button>
        <h3>Ponastavitev gesla</h3>
        <p className="auth-forgot-lead">
          Vnesite e-poštni naslov računa. Poslali vam bomo povezavo za nastavitev novega gesla.
        </p>
        <form id="forgot-password-form" onSubmit={onSubmit}>
          <input
            type="email"
            name="email"
            placeholder="E-pošta"
            required
            autoComplete="email"
            defaultValue={modals.forgotPasswordEmail}
            key={`forgot-email-${modals.forgotPasswordEmail}`}
          />
          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting}
          >
            {submitting ? "Pošiljam …" : "Pošlji povezavo"}
          </button>
        </form>
        <button
          type="button"
          className="btn btn-ghost btn-block"
          style={{ marginTop: "0.5rem" }}
          onClick={backToLogin}
        >
          Nazaj na prijavo
        </button>
      </div>
    </div>
  );
}
