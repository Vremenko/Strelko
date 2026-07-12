export function StrelkoLogo() {
  return (
    <svg viewBox="0 0 64 64" width="48" height="48" aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#1e293b" stroke="#f5c542" strokeWidth="2" />
      <path
        d="M38 12L24 38h10l-6 18 20-30H36l2-14z"
        fill="#f5c542"
        stroke="#fff"
        strokeWidth="0.5"
      />
    </svg>
  );
}

export function IconShield() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M24 4L8 12v12c0 10 6.5 18.5 16 20 9.5-1.5 16-10 16-20V12L24 4z"
        stroke="#60a5fa"
        strokeWidth="2"
        fill="rgba(96,165,250,0.1)"
      />
      <path
        d="M18 24l4 4 8-8"
        stroke="#4ade80"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconMap() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="6" y="10" width="36" height="28" rx="4" stroke="#f5c542" strokeWidth="2" />
      <circle cx="18" cy="22" r="3" fill="#f5c542" />
      <path d="M6 32l12-10 8 6 16-18" stroke="#60a5fa" strokeWidth="2" />
    </svg>
  );
}

export function IconLocationPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="2.25" fill="currentColor" />
    </svg>
  );
}

export function IconInsurance() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="10" y="8" width="28" height="32" rx="3" stroke="#94a3b8" strokeWidth="2" />
      <path d="M16 20h16M16 28h12" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 8v6h6" stroke="#f5c542" strokeWidth="2" />
    </svg>
  );
}

/** Ščit + strela iz header logotipa (strelko-logo.png) — brez wordmarka. */
const LOGO_MARK_VIEW_W = 60;
const LOGO_MARK_VIEW_H = 70;

export function SearchScanBolt() {
  return (
    <div className="search-scan-symbol" aria-hidden="true">
      <span className="search-scan-symbol__halo" />
      <span className="search-scan-symbol__halo search-scan-symbol__halo--delay" />
      <svg
        className="search-scan-symbol__mark"
        viewBox={`0 0 ${LOGO_MARK_VIEW_W} ${LOGO_MARK_VIEW_H}`}
        aria-hidden="true"
      >
        <image href="/assets/strelko-logo.png" width={300} height={70} />
      </svg>
    </div>
  );
}
