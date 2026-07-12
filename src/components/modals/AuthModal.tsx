import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStrelko } from "../../context/StrelkoContext";
import {
  hasRegisterFieldErrors,
  mapRegisterApiError,
  validateRegisterForm,
} from "../../lib/auth-register";
import { renderGoogleButton } from "../../lib/auth-google";
import type { ApiError } from "../../types";

export function AuthModal() {
  const { modals, closeAuth, login, register, loginGoogle, openAuth, openForgotPassword } =
    useStrelko();
  const mode = modals.auth;
  const googleRef = useRef<HTMLDivElement>(null);
  const loginGoogleRef = useRef(loginGoogle);
  const [loginError, setLoginError] = useState("");
  const [registerView, setRegisterView] = useState<"form" | "success">("form");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerFieldErrors, setRegisterFieldErrors] = useState<
    ReturnType<typeof validateRegisterForm>
  >({});
  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  loginGoogleRef.current = loginGoogle;

  useEffect(() => {
    if (!mode || mode !== "register") {
      setRegisterView("form");
      setRegisterEmail("");
      setRegisterFieldErrors({});
      setRegisterSubmitting(false);
    }
  }, [mode]);

  useEffect(() => {
    if (!mode || !googleRef.current) return;
    const container = googleRef.current;

    let cancelled = false;
    let firstRaf = 0;
    let secondRaf = 0;

    firstRaf = requestAnimationFrame(() => {
      secondRaf = requestAnimationFrame(() => {
        if (cancelled) return;

        void renderGoogleButton(container, async (credential) => {
          try {
            setLoginError("");
            await loginGoogleRef.current(credential);
          } catch (e) {
            setLoginError((e as Error).message || "Google prijava ni uspela.");
          }
        }).catch((e) => {
          if (!cancelled) setLoginError((e as Error).message || "Google prijava ni na voljo.");
        });
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(firstRaf);
      cancelAnimationFrame(secondRaf);
    };
  }, [mode, registerView]);

  if (!mode) return null;
  const isLogin = mode === "login";
  const showRegisterSuccess = !isLogin && registerView === "success";

  const onLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    try {
      setLoginError("");
      await login(email, password);
    } catch (err) {
      setLoginError((err as Error).message || "Napaka");
    }
  };

  const onRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "");
    const passwordConfirm = String(fd.get("password_confirm") || "");
    const termsAccepted = fd.get("terms_accepted") === "on";

    const clientErrors = validateRegisterForm({
      email,
      password,
      passwordConfirm,
      termsAccepted,
    });
    setRegisterFieldErrors(clientErrors);
    if (hasRegisterFieldErrors(clientErrors)) return;

    try {
      setRegisterSubmitting(true);
      setRegisterFieldErrors({});
      await register(email, password);
      setRegisterEmail(email);
      setRegisterView("success");
    } catch (err) {
      setRegisterFieldErrors(mapRegisterApiError(err as ApiError));
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const handleCloseAuth = () => {
    setRegisterView("form");
    setRegisterEmail("");
    setRegisterFieldErrors({});
    setRegisterSubmitting(false);
    closeAuth();
  };

  const backToRegisterForm = () => {
    setRegisterView("form");
    setRegisterFieldErrors({});
    setRegisterSubmitting(false);
  };

  return (
    <div
      className="modal-overlay"
      id="auth-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseAuth();
      }}
    >
      <div className="modal auth-modal">
        <button type="button" className="modal-close-btn" aria-label="Zapri" onClick={handleCloseAuth}>
          ×
        </button>

        {showRegisterSuccess ? (
          <div className="auth-register-success">
            <h3>Preverite e-pošto</h3>
            <p className="auth-register-success-lead">
              Račun za <strong>{registerEmail}</strong> je ustvarjen.
            </p>
            <p>
              Za dokončanje registracije morate potrditi e-poštni naslov. Potrditveno sporočilo bi
              moralo prispeti v nekaj minutah. Preverite tudi mapo z neželeno oziroma vsiljeno
              pošto.
            </p>
            <div className="auth-register-success-actions">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => openAuth("login")}
              >
                Nazaj na prijavo
              </button>
              <button type="button" className="btn btn-ghost btn-block" onClick={backToRegisterForm}>
                Spremeni e-poštni naslov
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3>{isLogin ? "Prijava" : "Registracija"}</h3>
            <form id="auth-form" onSubmit={isLogin ? onLoginSubmit : onRegisterSubmit}>
              <div className="auth-field">
                <input
                  type="email"
                  name="email"
                  placeholder="E-pošta"
                  required
                  autoComplete="email"
                  defaultValue={!isLogin ? registerEmail : undefined}
                  key={!isLogin ? `register-email-${registerEmail}` : "login-email"}
                  aria-invalid={registerFieldErrors.email ? true : undefined}
                  aria-describedby={registerFieldErrors.email ? "register-email-error" : undefined}
                />
                {!isLogin && registerFieldErrors.email && (
                  <p className="auth-field-error" id="register-email-error">
                    {registerFieldErrors.email}
                  </p>
                )}
              </div>

              <div className="auth-field">
                <input
                  type="password"
                  name="password"
                  placeholder="Geslo"
                  required
                  minLength={isLogin ? undefined : 8}
                  maxLength={isLogin ? undefined : 72}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  key={isLogin ? "login-password" : `register-password-${registerView}-${registerEmail}`}
                  aria-invalid={registerFieldErrors.password ? true : undefined}
                  aria-describedby={
                    !isLogin
                      ? registerFieldErrors.password
                        ? "register-password-error"
                        : "register-password-hint"
                      : undefined
                  }
                />
                {!isLogin && !registerFieldErrors.password && (
                  <p className="auth-field-hint" id="register-password-hint">
                    Geslo naj vsebuje vsaj 8 znakov.
                  </p>
                )}
                {!isLogin && registerFieldErrors.password && (
                  <p className="auth-field-error" id="register-password-error">
                    {registerFieldErrors.password}
                  </p>
                )}
              </div>

              {!isLogin && (
                <div className="auth-field">
                  <input
                    type="password"
                    name="password_confirm"
                    placeholder="Ponovite geslo"
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    key={`register-password-confirm-${registerView}-${registerEmail}`}
                    aria-invalid={registerFieldErrors.passwordConfirm ? true : undefined}
                    aria-describedby={
                      registerFieldErrors.passwordConfirm ? "register-password-confirm-error" : undefined
                    }
                  />
                  {registerFieldErrors.passwordConfirm && (
                    <p className="auth-field-error" id="register-password-confirm-error">
                      {registerFieldErrors.passwordConfirm}
                    </p>
                  )}
                </div>
              )}

              {!isLogin && (
                <label className="checkbox-row auth-legal-consent">
                  <input type="checkbox" name="terms_accepted" required />
                  <span>
                    Strinjam se s{" "}
                    <Link
                      to="/pogoji-uporabe"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Splošnimi pogoji
                    </Link>{" "}
                    in{" "}
                    <Link
                      to="/zasebnost"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Politiko zasebnosti
                    </Link>
                    .
                  </span>
                </label>
              )}
              {!isLogin && registerFieldErrors.terms && (
                <p className="auth-field-error auth-field-error-terms">{registerFieldErrors.terms}</p>
              )}

              {isLogin && loginError && <p className="form-error">{loginError}</p>}
              {!isLogin && registerFieldErrors.form && (
                <p className="form-error">{registerFieldErrors.form}</p>
              )}

              {isLogin && (
                <p className="auth-forgot-row">
                  <button type="button" className="btn-link" onClick={openForgotPassword}>
                    Pozabljeno geslo?
                  </button>
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={!isLogin && registerSubmitting}
              >
                {isLogin ? "Prijava" : registerSubmitting ? "Ustvarjam račun …" : "Ustvari račun"}
              </button>
            </form>

            <div className="auth-divider">
              <span>ali</span>
            </div>
            <div id="strelko-google-signin" className="auth-google-wrap" ref={googleRef} />
            <p
              style={{
                textAlign: "center",
                fontSize: "0.85rem",
                color: "var(--muted)",
                marginTop: "1rem",
              }}
            >
              {isLogin ? "Nimate računa?" : "Že imate račun?"}{" "}
              <button
                type="button"
                className={`btn-link${isLogin ? " auth-register-link" : ""}`}
                onClick={() => openAuth(isLogin ? "register" : "login")}
              >
                {isLogin ? "Registracija" : "Prijava"}
              </button>
            </p>
            <p className="auth-cenik-link">
              <Link to="/cenik">Cenik in paketi</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
