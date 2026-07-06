/** Google Sign-In (GSI) za Strelko auth modal. */

export const STRELKO_GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "228056926621-ct3h8nh8npos2qkl0oh1bmjqa45e2gvb.apps.googleusercontent.com";

let gsiLoadPromise = null;

export function loadGoogleGsiScript() {
  if (gsiLoadPromise) return gsiLoadPromise;
  gsiLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Google prijava ni na voljo."))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google prijava ni na voljo."));
    document.head.appendChild(script);
  });
  return gsiLoadPromise;
}

export function mountGoogleSignInButton(container, onCredential, escapeHtml) {
  if (!container || !STRELKO_GOOGLE_CLIENT_ID || container.dataset.gsiRendered === "1") {
    return;
  }
  loadGoogleGsiScript()
    .then(() => {
      if (container.dataset.gsiRendered === "1") return;
      window.google.accounts.id.initialize({
        client_id: STRELKO_GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) onCredential(response.credential);
        },
        auto_select: false,
        locale: "sl",
      });
      const width = Math.min(
        400,
        Math.max(200, Math.floor(container.getBoundingClientRect().width || container.clientWidth || 320))
      );
      window.google.accounts.id.renderButton(container, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width,
        locale: "sl",
      });
      container.dataset.gsiRendered = "1";
    })
    .catch((err) => {
      container.innerHTML = `<p class="form-error">${escapeHtml(err.message)}</p>`;
    });
}
