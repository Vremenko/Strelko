import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStrelko } from "../../context/StrelkoContext";
import { COMPANY } from "../../lib/legal";
import { renderGoogleButton } from "../../lib/auth-google";

export function AuthModal() {
  const { modals, closeAuth, login, register, loginGoogle, openAuth, openForgotPassword } =
    useStrelko();
  const mode = modals.auth;
  const googleRef = useRef<HTMLDivElement>(null);
  const loginGoogleRef = useRef(loginGoogle);
  const [error, setError] = useState("");

  loginGoogleRef.current = loginGoogle;

  useEffect(() => {
    if (!mode || !googleRef.current) return;
    const container = googleRef.current;
    container.replaceChildren();
    delete container.dataset.gsiRendered;

    let cancelled = false;
    void renderGoogleButton(container, async (credential) => {
      try {
        setError("");
        await loginGoogleRef.current(credential);
      } catch (e) {
        setError((e as Error).message || "Google prijava ni uspela.");
      }
    }).catch((e) => {
      if (!cancelled) setError((e as Error).message || "Google prijava ni na voljo.");
    });

    return () => {
      cancelled = true;
      container.replaceChildren();
      delete container.dataset.gsiRendered;
    };
  }, [mode]);

  if (!mode) return null;
  const isLogin = mode === "login";

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    try {
      setError("");
      if (isLogin) await login(email, password);
      else await register(email, password);
    } catch (err) {
      setError((err as Error).message || "Napaka");
    }
  };

  return (
    <div className="modal-overlay" id="auth-modal">
      <div className="modal">
        <h3>{isLogin ? "Prijava" : "Registracija"}</h3>
        <form id="auth-form" onSubmit={onSubmit}>
          <input type="email" name="email" placeholder="E-pošta" required autoComplete="email" />
          <input
            type="password"
            name="password"
            placeholder="Geslo"
            required
            minLength={8}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
          {!isLogin && (
            <label className="checkbox-row auth-legal-consent">
              <input type="checkbox" name="terms_accepted" required />
              <span>
                Strinjam se s <Link to="/pogoji-uporabe">pogoji uporabe</Link>,{" "}
                <Link to="/zasebnost">politiko zasebnosti Strelko</Link> in{" "}
                <a href={COMPANY.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
                  politiko zasebnosti Meteoinfo
                </a>
                .
              </span>
            </label>
          )}
          {error && <p className="form-error">{error}</p>}
          {isLogin && (
            <p className="auth-forgot-row">
              <button type="button" className="btn-link" onClick={openForgotPassword}>
                Pozabljeno geslo?
              </button>
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-block">
            {isLogin ? "Prijava" : "Ustvari račun"}
          </button>
        </form>
        <div className="auth-divider">
          <span>ali</span>
        </div>
        <div
          key={mode}
          id="strelko-google-signin"
          className="auth-google-wrap"
          ref={googleRef}
        />
        <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--muted)", marginTop: "1rem" }}>
          {isLogin ? "Nimate računa?" : "Že imate račun?"}{" "}
          <button
            type="button"
            className="btn-link"
            onClick={() => openAuth(isLogin ? "register" : "login")}
          >
            {isLogin ? "Registracija" : "Prijava"}
          </button>
        </p>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: "100%", marginTop: "0.5rem" }}
          onClick={closeAuth}
        >
          Zapri
        </button>
      </div>
    </div>
  );
}
