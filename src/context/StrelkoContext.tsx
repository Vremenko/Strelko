import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api/client";
import { geocodeAddress } from "../lib/geocode";
import { getToken, setToken } from "../lib/utils";
import { defaultSelectedPlanId } from "../lib/plans-modal";
import {
  DEFAULT_SEARCH_RADIUS_KM,
  SEARCH_PERIOD_DAYS,
  defaultSearchRange,
} from "../lib/search-dates";
import type {
  AlertsSettings,
  ApiError,
  AuthMode,
  Credits,
  GeocodeResult,
  ModalState,
  Plan,
  PlansMeta,
  PreviewResult,
  PreviewScreen,
  SearchResult,
  StatTab,
  User,
  UserWidgetConfig,
  WidgetObcina,
} from "../types";

const DEFAULT_OB_MID = 11027849;

interface StrelkoState {
  user: User | null;
  credits: Credits | null;
  alerts: AlertsSettings | null;
  plans: Plan[];
  plansMeta: PlansMeta;
  paymentsEnabled: boolean;
  selectedPlan: string;
  selected: GeocodeResult | null;
  locationQuery: string;
  suggestions: GeocodeResult[];
  preview: PreviewResult | null;
  previewScreen: PreviewScreen;
  searchResult: SearchResult | null;
  searchRadiusKm: number;
  searchDateFrom: string;
  searchDateTo: string;
  loading: boolean;
  statistikaTab: StatTab;
  widget: {
    publicWidgetObMid: number | null;
    publicWidgetObMids: number[];
    publicWidgetObcine: WidgetObcina[];
    publicWidgetTheme: "dark" | "light";
    publicWidgetPreviewSize: "compact" | "full";
    publicWidgetLat: number | null;
    publicWidgetLon: number | null;
    publicWidgetLabel: string;
  };
  modals: ModalState;
  cookieAccepted: boolean;
}

interface StrelkoContextValue extends StrelkoState {
  refreshUser: () => Promise<void>;
  loadPlans: () => Promise<void>;
  setSelectedPlan: (id: string) => void;
  setLocationQuery: (q: string) => void;
  selectPlace: (place: GeocodeResult | null) => void;
  fetchSuggestions: (q: string) => Promise<void>;
  runPreview: () => Promise<void>;
  runFullSearch: () => Promise<void>;
  downloadPdf: () => Promise<void>;
  setSearchRadiusKm: (km: number) => void;
  setSearchDateRange: (range: { from: string; to: string }) => void;
  openAuth: (mode: AuthMode) => void;
  closeAuth: () => void;
  openForgotPassword: () => void;
  closeForgotPassword: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  openCredits: (opts?: ModalState["creditsOptions"]) => void;
  closeCredits: () => void;
  closeCheckoutSuccess: () => void;
  openAlerts: () => void;
  closeAlerts: () => void;
  saveAlerts: (body: object) => Promise<void>;
  openPremiumUpsell: () => void;
  openMeteoAlarmUpsell: () => void;
  checkout: () => Promise<void>;
  openBillingPortal: () => Promise<void>;
  acceptCookies: () => void;
  clearSearch: () => void;
  setStatTab: (tab: StatTab) => void;
  setWidget: (patch: Partial<StrelkoState["widget"]>) => void;
  loadWidgetObcine: () => Promise<void>;
  loadWidgetObMid: (mid: number) => Promise<void>;
  resetWidget: () => void;
  userWidget: UserWidgetConfig | null;
  loadUserWidget: () => Promise<void>;
  openWidgetSetup: () => Promise<void>;
  closeWidgetSetup: () => void;
  saveUserWidget: (body: {
    lat: number;
    lon: number;
    label?: string | null;
    domain?: string | null;
  }) => Promise<void>;
}

const StrelkoContext = createContext<StrelkoContextValue | null>(null);

const initialWidget = (): StrelkoState["widget"] => ({
  publicWidgetObMid: DEFAULT_OB_MID,
  publicWidgetObMids: [DEFAULT_OB_MID],
  publicWidgetObcine: [],
  publicWidgetTheme: "dark",
  publicWidgetPreviewSize: "compact",
  publicWidgetLat: null,
  publicWidgetLon: null,
  publicWidgetLabel: "",
});

export function StrelkoProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const defaultRange = defaultSearchRange();
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [alerts, setAlerts] = useState<AlertsSettings | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansMeta, setPlansMeta] = useState<PlansMeta>({});
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [selectedPlan, setSelectedPlanState] = useState("podpornik");
  const [selected, setSelected] = useState<GeocodeResult | null>(null);
  const [locationQuery, setLocationQueryState] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewScreen, setPreviewScreen] = useState<PreviewScreen>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchRadiusKm, setSearchRadiusKm] = useState(DEFAULT_SEARCH_RADIUS_KM);
  const [searchDateFrom, setSearchDateFrom] = useState(defaultRange.from);
  const [searchDateTo, setSearchDateTo] = useState(defaultRange.to);
  const [loading, setLoading] = useState(false);
  const [statistikaTab, setStatistikaTab] = useState<StatTab>("grafi");
  const [widget, setWidgetState] = useState(initialWidget);
  const [userWidget, setUserWidget] = useState<UserWidgetConfig | null>(null);
  const [modals, setModals] = useState<ModalState>({
    auth: null,
    credits: false,
    alerts: false,
    widget: false,
    forgotPassword: false,
    checkoutSuccess: null,
    creditsOptions: {},
  });
  const [cookieAccepted, setCookieAccepted] = useState(
    () => localStorage.getItem("strelko_cookie_consent") === "1"
  );

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setCredits(null);
      setPaymentsEnabled(false);
      return;
    }
    try {
      const u = await api.whoami();
      const [c, a] = await Promise.all([api.credits(), api.alerts()]);
      setUser(u);
      setCredits(c);
      setAlerts(a);
      setPaymentsEnabled(!!c.payments_enabled);
    } catch {
      setToken(null);
      setUser(null);
      setCredits(null);
      setAlerts(null);
      setPaymentsEnabled(false);
    }
  }, []);

  const loadPlans = useCallback(async () => {
    try {
      const res = await api.plans();
      const loadedPlans = res.plans || [];
      setPlans(loadedPlans);
      setPlansMeta({
        season_label_sl: res.season_label_sl,
        archive_free_now: res.archive_free_now,
        in_lightning_season: res.in_lightning_season,
      });
      setPaymentsEnabled(!!res.payments_enabled);
      setSelectedPlanState((prev) => {
        if (loadedPlans.some((p) => p.id === prev)) return prev;
        return defaultSelectedPlanId(loadedPlans);
      });
    } catch {
      setPlans([]);
    }
  }, []);

  const loadUserWidget = useCallback(async () => {
    if (!getToken()) {
      setUserWidget(null);
      return;
    }
    try {
      setUserWidget(await api.widget());
    } catch {
      setUserWidget(null);
    }
  }, []);

  useEffect(() => {
    void loadPlans();
    void refreshUser();
  }, [loadPlans, refreshUser]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (!checkout) return;
    window.history.replaceState({}, "", window.location.pathname);
    if (checkout === "cancel") {
      setModals((m) => ({
        ...m,
        credits: true,
        creditsOptions: { checkoutError: "Plačilo je bilo preklicano." },
      }));
      return;
    }
    if (checkout !== "success") return;
    const sid = params.get("session_id");
    if (!sid || !getToken()) return;
    void (async () => {
      try {
        const res = await api.verifyCheckout(sid);
        setCredits({ credits_balance: res.credits_balance });
        await refreshUser();
        setModals({
          auth: null,
          credits: false,
          alerts: false,
          widget: false,
          forgotPassword: false,
          checkoutSuccess: {
            creditsAdded: res.credits_added,
            balance: res.credits_balance,
            planName: res.plan_name_sl ?? credits?.plan_name_sl,
            planId: res.plan_id,
          },
          creditsOptions: {},
        });
      } catch (e) {
        const err = e as ApiError;
        setModals((m) => ({
          ...m,
          credits: true,
          creditsOptions: {
            checkoutError:
              err.message ||
              "Naročnine ni bilo mogoče potrditi. Če je bila kartica bremenjena, kontaktirajte podporo.",
          },
        }));
      }
    })();
  }, [refreshUser, credits?.plan_name_sl]);

  const afterAuth = useCallback(async () => {
    await refreshUser();
    setModals((m) => ({ ...m, auth: null }));
    if (preview?.requires_login) await runFullSearchInner();
  }, [preview, refreshUser]);

  async function runFullSearchInner(place?: GeocodeResult) {
    const target = place ?? selected;
    if (!target) {
      console.warn("runFullSearchInner: manjkajoča lokacija (selected/places)");
      return;
    }
    setLoading(true);
    try {
      const body = {
        lat: target.lat,
        lon: target.lon,
        radius_km: searchRadiusKm,
        label: target.label,
        date_from: searchDateFrom,
        date_to: searchDateTo,
      };
      const res = (await api.search(body)) as SearchResult;
      if (!res || typeof res !== "object" || !Array.isArray(res.daily)) {
        alert(
          "Odgovor strežnika ni v pričakovani obliki. Poskusite znova ali zmanjšajte obdobje/radij."
        );
        return;
      }
      setSearchResult(res);
      setPreview(null);
      setPreviewScreen(null);
      setCredits((c) => ({ ...(c || {}), credits_balance: res.credits_remaining }));
      const stayOn =
        location.pathname === "/pomoc-pri-zavarovalnici"
          ? "/pomoc-pri-zavarovalnici"
          : "/";
      if (location.pathname !== stayOn) navigate(stayOn);
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 402) {
        setSelectedPlanState(defaultSelectedPlanId(plans));
        setModals((m) => ({
          ...m,
          credits: true,
          creditsOptions: { insufficientCredits: true },
        }));
      } else if (err.status === 401) {
        setToken(null);
        setModals((m) => ({ ...m, auth: "login" }));
      } else {
        alert(err.message || "Napaka pri iskanju.");
      }
    } finally {
      setLoading(false);
    }
  }

  const value = useMemo<StrelkoContextValue>(
    () => ({
      user,
      credits,
      alerts,
      plans,
      plansMeta,
      paymentsEnabled,
      selectedPlan,
      selected,
      locationQuery,
      suggestions,
      preview,
      previewScreen,
      searchResult,
      searchRadiusKm,
      searchDateFrom,
      searchDateTo,
      loading,
      statistikaTab,
      widget,
      userWidget,
      modals,
      cookieAccepted,
      refreshUser,
      loadPlans,
      setSelectedPlan: setSelectedPlanState,
      setLocationQuery: setLocationQueryState,
      selectPlace: setSelected,
      fetchSuggestions: async (q) => {
        if (!q || q.length < 3) {
          setSuggestions([]);
          return;
        }
        try {
          setSuggestions(await geocodeAddress(q));
        } catch {
          setSuggestions([]);
        }
      },
      runPreview: async () => {
        const q = locationQuery.trim();
        if (!q && !selected) {
          alert("Vnesite naslov ali kraj.");
          return;
        }
        setLoading(true);
        setPreview(null);
        setPreviewScreen(null);
        try {
          let place = selected;
          if (!place || place.label !== q) {
            const results = await geocodeAddress(q);
            place = results[0];
            setSelected(place);
          }
          const res = (await api.preview({
            lat: place.lat,
            lon: place.lon,
            radius_km: searchRadiusKm,
            label: place.label,
            days: SEARCH_PERIOD_DAYS,
          })) as PreviewResult;
          if (getToken()) {
            if (!user) {
              await refreshUser();
            }
            await runFullSearchInner(place);
            return;
          }
          setPreview(res);
          if (!getToken() && res.has_nearby_strikes) {
            setPreviewScreen("teaser");
          } else if (!getToken() && !res.has_nearby_strikes) {
            setPreviewScreen("no-strikes");
          }
        } catch (e) {
          alert((e as Error).message || "Napaka pri predogledu.");
        } finally {
          setLoading(false);
        }
      },
      setSearchRadiusKm,
      setSearchDateRange: (range) => {
        setSearchDateFrom(range.from);
        setSearchDateTo(range.to);
      },
      openPremiumUpsell: () => {
        setSelectedPlanState(defaultSelectedPlanId(plans));
        setModals((m) => ({ ...m, credits: true, creditsOptions: {} }));
      },
      openMeteoAlarmUpsell: () => {
        setSelectedPlanState(defaultSelectedPlanId(plans));
        if (alerts?.sms_eligible) {
          setModals((m) => ({ ...m, alerts: true }));
        } else {
          setModals((m) => ({
            ...m,
            credits: true,
            creditsOptions: { meteoalarmUpsell: true },
          }));
        }
      },
      runFullSearch: async () => {
        if (!user) {
          setModals((m) => ({ ...m, auth: "login" }));
          return;
        }
        await runFullSearchInner();
      },
      downloadPdf: async () => {
        if (!searchResult) return;
        try {
          const blob = await api.downloadReportPdf({
            lat: searchResult.lat,
            lon: searchResult.lon,
            radius_km: searchResult.radius_km,
            label: searchResult.location_label,
            date_from: searchResult.date_from,
            date_to: searchResult.date_to,
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `strelko-pregled-${searchResult.date_from}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        } catch (e) {
          alert((e as Error).message || "PDF ni na voljo.");
        }
      },
      openAuth: (mode) => setModals((m) => ({ ...m, auth: mode, forgotPassword: false })),
      closeAuth: () => setModals((m) => ({ ...m, auth: null })),
      openForgotPassword: () =>
        setModals((m) => ({ ...m, auth: null, forgotPassword: true })),
      closeForgotPassword: () => setModals((m) => ({ ...m, forgotPassword: false })),
      login: async (email, password) => {
        const tok = await api.login(email, password);
        setToken(tok.access_token);
        await afterAuth();
      },
      register: async (email, password) => {
        await api.register(email, password);
        alert("Račun ustvarjen. Preverite e-pošto za aktivacijo, nato se prijavite.");
        setModals((m) => ({ ...m, auth: "login" }));
      },
      loginGoogle: async (credential) => {
        const tok = await api.loginGoogle(credential);
        setToken(tok.access_token);
        await afterAuth();
      },
      logout: () => {
        setToken(null);
        setUser(null);
        setCredits(null);
      },
      openCredits: (opts = {}) =>
        setModals((m) => ({ ...m, credits: true, creditsOptions: opts })),
      closeCredits: () =>
        setModals((m) => ({ ...m, credits: false, creditsOptions: {} })),
      closeCheckoutSuccess: () =>
        setModals((m) => ({ ...m, checkoutSuccess: null })),
      openAlerts: () => setModals((m) => ({ ...m, alerts: true })),
      closeAlerts: () => setModals((m) => ({ ...m, alerts: false })),
      saveAlerts: async (body) => {
        await api.updateAlerts(body);
        setAlerts(await api.alerts());
        setModals((m) => ({ ...m, alerts: false }));
      },
      checkout: async () => {
        const { checkout_url } = await api.checkout(selectedPlan);
        window.location.href = checkout_url;
      },
      openBillingPortal: async () => {
        const { portal_url } = await api.billingPortal();
        window.location.href = portal_url;
      },
      acceptCookies: () => {
        localStorage.setItem("strelko_cookie_consent", "1");
        setCookieAccepted(true);
      },
      clearSearch: () => {
        setPreview(null);
        setPreviewScreen(null);
        setSearchResult(null);
        setSelected(null);
        setLocationQueryState("");
      },
      setStatTab: setStatistikaTab,
      setWidget: (patch) => setWidgetState((w) => ({ ...w, ...patch })),
      loadWidgetObcine: async () => {
        if (widget.publicWidgetObcine.length) return;
        try {
          const res = await fetch("/widget/api/obcine-map?days=365");
          if (res.ok) {
            const data = (await res.json()) as { ob_id?: number; ob_mid?: number; obcina: string }[];
            setWidgetState((w) => ({
              ...w,
              publicWidgetObcine: data
                .map((row) => ({ ob_mid: row.ob_id ?? row.ob_mid!, name: row.obcina }))
                .filter((r) => r.ob_mid && r.name)
                .sort((a, b) => a.name.localeCompare(b.name, "sl")),
            }));
          }
        } catch {
          /* ignore */
        }
      },
      loadWidgetObMid: async (mid) => {
        const obMid = Number(mid) || DEFAULT_OB_MID;
        setWidgetState((w) => {
          if (w.publicWidgetObMid === obMid && w.publicWidgetLat != null) return w;
          return {
            ...w,
            publicWidgetObMid: obMid,
            publicWidgetObMids: [obMid],
          };
        });
        try {
          const res = await fetch(`/widget/api/obcina-widget?ob_mid=${obMid}`);
          if (!res.ok) return;
          const data = (await res.json()) as {
            bounds?: [number, number][];
            obcina?: string;
          };
          if (data.bounds && data.bounds.length >= 2) {
            setWidgetState((w) => ({
              ...w,
              publicWidgetLat: (data.bounds![0][0] + data.bounds![1][0]) / 2,
              publicWidgetLon: (data.bounds![0][1] + data.bounds![1][1]) / 2,
              publicWidgetLabel: data.obcina || "",
            }));
          }
        } catch {
          /* ignore */
        }
      },
      resetWidget: () => setWidgetState(initialWidget()),
      loadUserWidget,
      openWidgetSetup: async () => {
        if (!user) {
          setModals((m) => ({ ...m, auth: "login" }));
          return;
        }
        if (!credits?.widget_active) {
          setSelectedPlanState("podpornik");
          setModals((m) => ({
            ...m,
            credits: true,
            creditsOptions: {},
          }));
          return;
        }
        try {
          setUserWidget(await api.widget());
        } catch {
          setUserWidget(null);
        }
        setModals((m) => ({ ...m, widget: true }));
      },
      closeWidgetSetup: () => setModals((m) => ({ ...m, widget: false })),
      saveUserWidget: async (body) => {
        const updated = await api.updateWidget(body);
        setUserWidget(updated);
        await refreshUser();
        setModals((m) => ({ ...m, widget: false }));
      },
    }),
    [
      user,
      credits,
      alerts,
      plans,
      plansMeta,
      paymentsEnabled,
      selectedPlan,
      selected,
      locationQuery,
      suggestions,
      preview,
      previewScreen,
      searchResult,
      searchRadiusKm,
      searchDateFrom,
      searchDateTo,
      loading,
      statistikaTab,
      widget,
      userWidget,
      modals,
      cookieAccepted,
      refreshUser,
      loadPlans,
      loadUserWidget,
      afterAuth,
      navigate,
      location.pathname,
      alerts,
    ]
  );

  return <StrelkoContext.Provider value={value}>{children}</StrelkoContext.Provider>;
}

export function useStrelko(): StrelkoContextValue {
  const ctx = useContext(StrelkoContext);
  if (!ctx) throw new Error("useStrelko outside provider");
  return ctx;
}
