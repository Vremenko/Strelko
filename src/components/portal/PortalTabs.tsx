export type PortalTabId = "pregled" | "poizvedbe" | "narocnina";

const LEGACY_TAB_MAP: Record<string, PortalTabId> = {
  zetoni: "pregled",
  racuni: "narocnina",
};

export const PORTAL_TABS: { id: PortalTabId; label: string }[] = [
  { id: "pregled", label: "Pregled" },
  { id: "poizvedbe", label: "Poizvedbe" },
  { id: "narocnina", label: "Paketi in plačila" },
];

export function parsePortalTab(raw: string | null): PortalTabId {
  if (raw && PORTAL_TABS.some((t) => t.id === raw)) {
    return raw as PortalTabId;
  }
  if (raw && raw in LEGACY_TAB_MAP) {
    return LEGACY_TAB_MAP[raw];
  }
  return "pregled";
}

interface PortalTabsProps {
  active: PortalTabId;
  onChange: (tab: PortalTabId) => void;
}

export function PortalTabs({ active, onChange }: PortalTabsProps) {
  return (
    <nav className="portal-tabs" aria-label="Moj Strelko">
      <div className="portal-tabs__scroll">
        {PORTAL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`portal-tab${active === tab.id ? " is-active" : ""}`}
            aria-current={active === tab.id ? "page" : undefined}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
