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
    /* One Tap prompt na mobilnih pogosto pade — gumba to ne zadeva. */
    use_fedcm_for_prompt: false,
    /*
     * FedCM za gumb: na Safari/iOS (in Chrome z blokiranimi 3P piškotki)
     * se gumb sicer sploh ne prikaže.
     */
    use_fedcm_for_button: true,
  });
  gsiInitialized = true;
}

function measureButtonWidth(container: HTMLElement): number {
  const measuredWidth = Math.floor(container.getBoundingClientRect().width);
  return Math.min(400, Math.max(200, measuredWidth || 320));
}

export async function renderGoogleButton(
  container: HTMLElement,
  onCredential: (credential: string) => void
): Promise<void> {
  if (!STRELKO_GOOGLE_CLIENT_ID) return;
  gsiOnCredential = onCredential;
  await ensureGsiInitialized();

  /* Vedno znova nariši — po zaprtju/odprtju modala / React remountu. */
  container.replaceChildren();
  delete container.dataset.gsiRendered;

  const width = measureButtonWidth(container);
  window.google!.accounts.id.renderButton(container, {
    type: "standard",
    theme: "filled_black",
    size: "large",
    text: "signin_with",
    shape: "pill",
    width,
    locale: "sl",
  });
  container.dataset.gsiRendered = "1";

  /* Če je bil modal še brez širine, po layoutu ponovno nariši. */
  if (!container.querySelector("iframe, div[role='button']")) {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
    container.replaceChildren();
    window.google!.accounts.id.renderButton(container, {
      type: "standard",
      theme: "filled_black",
      size: "large",
      text: "signin_with",
      shape: "pill",
      width: measureButtonWidth(container),
      locale: "sl",
    });
  }
}
