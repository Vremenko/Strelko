export const STRELKO_GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "228056926621-ct3h8nh8npos2qkl0oh1bmjqa45e2gvb.apps.googleusercontent.com";

let gsiLoadPromise: Promise<void> | null = null;
let gsiInitialized = false;
let gsiOnCredential: ((credential: string) => void) | null = null;

export function loadGoogleGsiScript(): Promise<void> {
  if (gsiLoadPromise) return gsiLoadPromise;
  gsiLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="accounts.google.com/gsi/client"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Google prijava ni na voljo.")),
        { once: true }
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

async function ensureGsiInitialized(): Promise<void> {
  await loadGoogleGsiScript();
  if (gsiInitialized) return;
  window.google!.accounts.id.initialize({
    client_id: STRELKO_GOOGLE_CLIENT_ID,
    callback: (response: { credential?: string }) => {
      if (response.credential) gsiOnCredential?.(response.credential);
    },
    auto_select: false,
    locale: "sl",
    use_fedcm_for_prompt: true,
    use_fedcm_for_button: true,
  });
  gsiInitialized = true;
}

export async function renderGoogleButton(
  container: HTMLElement,
  onCredential: (credential: string) => void
): Promise<void> {
  if (!STRELKO_GOOGLE_CLIENT_ID || container.dataset.gsiRendered === "1") return;
  gsiOnCredential = onCredential;
  await ensureGsiInitialized();
  if (container.dataset.gsiRendered === "1") return;
  const width = Math.min(
    400,
    Math.max(200, Math.floor(container.getBoundingClientRect().width || 320))
  );
  window.google!.accounts.id.renderButton(container, {
    type: "standard",
    theme: "filled_black",
    size: "large",
    text: "signin_with",
    shape: "rectangular",
    width,
    locale: "sl",
  });
  container.dataset.gsiRendered = "1";
}
