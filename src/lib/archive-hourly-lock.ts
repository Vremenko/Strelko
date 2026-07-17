/** Meritev / lupina zaklenjenega grafa Po urah (CTA je v parent DOM). */

export const HOURLY_LOCK_PORTAL_ID = "strelko-hourly-lock-root";
const HOURLY_LOCK_STYLE_ID = "strelko-hourly-lock-styles";

export type HourlyLockBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

/** Lupina v iframe — samo velikost; vsebina CTA je overlay v parent (scroll PE:none). */
const HOURLY_LOCK_PORTAL_CSS = `
#${HOURLY_LOCK_PORTAL_ID} {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background: #1a1a1a;
}
`;

export function ensureHourlyLockPortal(doc: Document): HTMLElement | null {
  const mount = doc.getElementById(HOURLY_LOCK_PORTAL_ID);
  if (!mount) return null;

  const host = mount.parentElement;
  if (host) {
    host.style.position = "relative";
    host.style.overflow = "hidden";
  }

  if (!doc.getElementById(HOURLY_LOCK_STYLE_ID)) {
    const style = doc.createElement("style");
    style.id = HOURLY_LOCK_STYLE_ID;
    style.textContent = HOURLY_LOCK_PORTAL_CSS;
    doc.head.appendChild(style);
  }

  return mount;
}

/**
 * Pozicija mounta glede na wrap (za position:absolute v wrap).
 * getBoundingClientRect() na elementu v iframe je lahko v koordinatah iframe-a
 * ALI starša — izberemo pravilno formulo, da ni zamika levo/gor.
 */
export function measureHourlyLockBox(
  wrap: HTMLElement,
  iframe: HTMLIFrameElement,
  mount: HTMLElement
): HourlyLockBox | null {
  const wrapRect = wrap.getBoundingClientRect();
  const iframeRect = iframe.getBoundingClientRect();
  const mountRect = mount.getBoundingClientRect();
  if (mountRect.width < 8 || mountRect.height < 8) return null;

  const iframeTopInWrap = iframeRect.top - wrapRect.top + wrap.scrollTop;
  const iframeLeftInWrap = iframeRect.left - wrapRect.left + wrap.scrollLeft;

  // Parent-viewport: mount leži znotraj iframe pravokotnika (isti koordinatni sistem).
  const mountInParentViewport =
    mountRect.top >= iframeRect.top - 1 &&
    mountRect.left >= iframeRect.left - 1 &&
    mountRect.bottom <= iframeRect.bottom + 1 &&
    mountRect.right <= iframeRect.right + 1;

  if (mountInParentViewport) {
    return {
      top: mountRect.top - wrapRect.top + wrap.scrollTop,
      left: mountRect.left - wrapRect.left + wrap.scrollLeft,
      width: mountRect.width,
      height: mountRect.height,
    };
  }

  // Iframe-local: mountRect je relativen na viewport iframe dokumenta.
  return {
    top: iframeTopInWrap + mountRect.top,
    left: iframeLeftInWrap + mountRect.left,
    width: mountRect.width,
    height: mountRect.height,
  };
}
