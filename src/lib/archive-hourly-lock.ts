/** Portal zaklenjenega grafa Po urah znotraj statistike embed iframe. */

export const HOURLY_LOCK_PORTAL_ID = "strelko-hourly-lock-root";
const HOURLY_LOCK_STYLE_ID = "strelko-hourly-lock-styles";

const HOURLY_LOCK_PORTAL_CSS = `
#${HOURLY_LOCK_PORTAL_ID} {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  flex: 1 1 auto;
  align-self: stretch;
  box-sizing: border-box;
}
#${HOURLY_LOCK_PORTAL_ID} .locked-content,
#${HOURLY_LOCK_PORTAL_ID} .archive-hourly-locked {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  margin: 0;
  padding: 1.25rem 1rem;
  border: none;
  border-radius: 0;
  background: transparent;
  box-sizing: border-box;
}
#${HOURLY_LOCK_PORTAL_ID} .locked-content__inner {
  max-width: 42rem;
  text-align: center;
}
#${HOURLY_LOCK_PORTAL_ID} .locked-content__icon {
  display: block;
  font-size: 1.35rem;
  margin-bottom: 0.35rem;
}
#${HOURLY_LOCK_PORTAL_ID} .locked-content__title {
  margin: 0 0 0.65rem;
  font-size: 1.05rem;
  line-height: 1.35;
  color: #f2f2f2;
  font-weight: 600;
}
#${HOURLY_LOCK_PORTAL_ID} .locked-content__text {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #999999;
}
#${HOURLY_LOCK_PORTAL_ID} .locked-content__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
#${HOURLY_LOCK_PORTAL_ID} .locked-content__actions--stacked {
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 0.6rem;
  width: min(100%, 320px);
  margin-inline: auto;
}
#${HOURLY_LOCK_PORTAL_ID} .locked-content__actions--stacked .btn {
  width: 100%;
}
#${HOURLY_LOCK_PORTAL_ID} .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.65rem 1.25rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-family: inherit;
}
#${HOURLY_LOCK_PORTAL_ID} .btn-primary {
  background: linear-gradient(135deg, #fbb006, #d99a05);
  color: #1a1508;
}
#${HOURLY_LOCK_PORTAL_ID} .btn-ghost {
  background: rgba(255, 255, 255, 0.08);
  color: #f2f2f2;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
#${HOURLY_LOCK_PORTAL_ID} .btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
`;

export function ensureHourlyLockPortal(doc: Document): HTMLElement | null {
  const mount = doc.getElementById(HOURLY_LOCK_PORTAL_ID);
  if (!mount) return null;

  if (!doc.getElementById(HOURLY_LOCK_STYLE_ID)) {
    const style = doc.createElement("style");
    style.id = HOURLY_LOCK_STYLE_ID;
    style.textContent = HOURLY_LOCK_PORTAL_CSS;
    doc.head.appendChild(style);
  }

  return mount;
}
