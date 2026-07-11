import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api/client";
import { geocodeAddress, isValidGeocodePlace } from "../lib/geocode";
import { getToken, setToken } from "../lib/utils";
import { clearCheckoutPlanId, consumeCheckoutPlanId, peekCheckoutPlanId } from "../lib/auth-intent";
import { defaultSelectedPlanId } from "../lib/plans-modal";
import {
  DEFAULT_SEARCH_RADIUS_KM,
  buildPreviewRequestBody,
  clampSearchRange,
  defaultSearchRange,
} from "../lib/search-dates";
import { NATIONAL_WIDGET_SCOPE } from "../lib/widget-obcine";
import {
  buildIdempotencyKey,
  readSavedQueryIdFromStorage,
  savedQueryOutToSearchResult,
  writeSavedQueryIdToStorage,
} from "../lib/saved-queries";
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
  SavedQuerySummary,
  SearchResult,
  User,
  UserWidgetConfig,
  WidgetObcina,
} from "../types";

const DEFAULT_OB_MID = 11026516;
const SEARCH_RESULT_STORAGE_KEY = "strelko_search_result_v1";

function readSearchResultFromStorage(): SearchResult | null {
  try {
    const raw = sessionStorage.getItem(SEARCH_RESULT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SearchResult;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.daily)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSearchResultToStorage(res: SearchResult | null): void {
  try {
    if (res) {
      sessionStorage.setItem(SEARCH_RESULT_STORAGE_KEY, JSON.stringify(res));
    } else {
      sessionStorage.removeItem(SEARCH_RESULT_STORAGE_KEY);
    }
  } catch {
    /* private browsing / quota */
  }
}

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
  savedQueryId: string | null;
  savedQueries: SavedQuerySummary[];
  savedQueriesLoading: boolean;
  savedQueriesError: string | null;
  searchRadiusKm: number;
  searchDateFrom: string;
  searchDateTo: string;
  loading: boolean;
  pdfDownloading: boolean;
  widget: {
    publicWidgetObMid: number | null;
    publicWidgetObMids: number[];
    publicWidgetObcine: WidgetObcina[];
    publicWidgetScope: "slovenija" | null;
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
  loadSavedQueries: () => Promise<void>;
  openSavedQuery: (queryId: string) => Promise<void>;
  generateSavedQueryPdf: (queryId: string) => Promise<void>;
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
  setWidget: (patch: Partial<StrelkoState["widget"]>) => void;
  loadWidgetObcine: () => Promise<void>;
  loadWidgetSelection: (value: string | number) => Promise<void>;
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
  publicWidgetScope: null,
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
  const [searchResult, setSearchResultState] = useState<SearchResult | null>(() =>
    window.location.pathname === "/pomoc-pri-zavarovalnici"
      ? readSearchResultFromStorage()
      : null
  );
  const [savedQueryId, setSavedQueryIdState] = useState<string | null>(() =>
    window.location.pathname === "/pomoc-pri-zavarovalnici"
      ? readSavedQueryIdFromStorage()
      : null
  );
  const setSavedQueryId = useCallback((id: string | null) => {
    writeSavedQueryIdToStorage(id);
    setSavedQueryIdState(id);
  }, []);
  const [savedQueries, setSavedQueries] = useState<SavedQuerySummary[]>([]);
  const [savedQueriesLoading, setSavedQueriesLoading] = useState(false);
  const [savedQueriesError, setSavedQueriesError] = useState<string | null>(null);
  const applySearchResult = useCallback((res: SearchResult | null) => {
    writeSearchResultToStorage(res);
    setSearchResultState(res);
  }, []);
  const clearSearchState = useCallback(() => {
    writeSearchResultToStorage(null);
    writeSavedQueryIdToStorage(null);
    setPreview(null);
    setPreviewScreen(null);
    setSearchResultState(null);
    setSavedQueryIdState(null);
    setSelected(null);
    setLocationQueryState("");
  }, []);
  const clearSearchDisplayState = useCallback(() => {
    writeSearchResultToStorage(null);
    writeSavedQueryIdToStorage(null);
    setPreview(null);
    setPreviewScreen(null);
    setSearchResultState(null);
    setSavedQueryIdState(null);
  }, []);
  const [searchRadiusKm, setSearchRadiusKm] = useState(DEFAULT_SEARCH_RADIUS_KM);
  const [searchDateFrom, setSearchDateFrom] = useState(defaultRange.from);
  const [searchDateTo, setSearchDateTo] = useState(defaultRange.to);
  const [loading, setLoading] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
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

  const refreshUserInFlightRef = useRef<Promise<void> | null>(null);
  const runPreviewInFlightRef = useRef(false);
  const openQueryInFlightRef = useRef<string | null>(null);

  const loadSavedQueries = useCallback(async () => {
    if (!user) {
      setSavedQueries([]);
      setSavedQueriesError(null);
      return;
    }
    setSavedQueriesLoading(true);
    setSavedQueriesError(null);
    try {
      const res = await api.listQueries();
      setSavedQueries(Array.isArray(res.queries) ? res.queries : []);
      if (typeof res.token_balance === "number") {
        setCredits((c) => ({ ...(c || {}), credits_balance: res.token_balance }));
      }
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 401) {
        setSavedQueries([]);
        setSavedQueriesError(null);
        return;
      }
      setSavedQueriesError(err.message || "Poizvedb ni mogoče naložiti.");
    } finally {
      setSavedQueriesLoading(false);
    }
  }, [user]);

  const openSavedQuery = useCallback(
    async (queryId: string) => {
      if (!user) {
        setModals((m) => ({ ...m, auth: "login" }));
        return;
      }
      if (openQueryInFlightRef.current === queryId) return;
      openQueryInFlightRef.current = queryId;
      setLoading(true);
      try {
        const out = await api.getQuery(queryId);
        const res = savedQueryOutToSearchResult(out);
        if (!Array.isArray(res.daily)) {
          alert("Shranjeni rezultat ni v pričakovani obliki.");
          return;
        }
        applySearchResult(res);
        setSavedQueryId(out.id);
        setSelected({
          lat: out.lat,
          lon: out.lon,
          label: out.label ?? "",
        });
        setLocationQueryState(out.label ?? "");
        setSearchRadiusKm(out.radius_km);
        setSearchDateFrom(out.date_from);
        setSearchDateTo(out.date_to);
        setPreview(null);
        setPreviewScreen(null);
        setCredits((c) => ({ ...(c || {}), credits_balance: out.token_balance }));
        if (location.pathname !== "/pomoc-pri-zavarovalnici") {
          navigate(`/pomoc-pri-zavarovalnici?query=${encodeURIComponent(out.id)}`);
        } else {
          navigate(`/pomoc-pri-zavarovalnici?query=${encodeURIComponent(out.id)}`, {
            replace: true,
          });
        }
      } catch (e) {
        const err = e as ApiError;
        if (err.status === 401) {
          setToken(null);
          setModals((m) => ({ ...m, auth: "login" }));
        } else if (err.status === 404 || err.status === 403) {
          alert("Poizvedbe ni mogoče odpreti. Morda ne obstaja ali ne pripada vašemu računu.");
          if (location.pathname === "/pomoc-pri-zavarovalnici" && location.search.includes("query=")) {
            navigate("/pomoc-pri-zavarovalnici", { replace: true });
          }
        } else {
          alert(err.message || "Poizvedbe ni mogoče naložiti.");
        }
      } finally {
        openQueryInFlightRef.current = null;
        setLoading(false);
      }
    },
    [user, applySearchResult, setSavedQueryId, navigate, location.pathname]
  );

  const refreshUser = useCallback(async () => {
    const pending = refreshUserInFlightRef.current;
    if (pending) return pending;

    const task = (async () => {
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
    })();

    refreshUserInFlightRef.current = task;
    try {
      await task;
    } finally {
      if (refreshUserInFlightRef.current === task) {
        refreshUserInFlightRef.current = null;
      }
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

  const loadWidgetObcine = useCallback(async () => {
    try {
      const res = await fetch("/widget/api/obcine-map?days=365");
      if (!res.ok) return;
      const data = (await res.json()) as { ob_id?: number; ob_mid?: number; obcina: string }[];
      setWidgetState((w) => {
        if (w.publicWidgetObcine.length) return w;
        return {
          ...w,
          publicWidgetObcine: data
            .map((row) => ({ ob_mid: row.ob_id ?? row.ob_mid!, name: row.obcina }))
            .filter((r) => r.ob_mid && r.name)
            .sort((a, b) => a.name.localeCompare(b.name, "sl")),
        };
      });
    } catch {
      /* ignore */
    }
  }, []);

  const loadWidgetSelection = useCallback(async (value: string | number) => {
    if (value === NATIONAL_WIDGET_SCOPE) {
      setWidgetState((w) => ({
        ...w,
        publicWidgetScope: NATIONAL_WIDGET_SCOPE,
        publicWidgetObMids: [],
        publicWidgetLat: null,
        publicWidgetLon: null,
        publicWidgetLabel: "SLOVENIJA",
      }));
      return;
    }
    const obMid = Number(value) || DEFAULT_OB_MID;
    setWidgetState((w) => {
      const name = w.publicWidgetObcine.find((o) => o.ob_mid === obMid)?.name ?? "";
      return {
        ...w,
        publicWidgetScope: null,
        publicWidgetObMid: obMid,
        publicWidgetObMids: [obMid],
        publicWidgetLat: null,
        publicWidgetLon: null,
        publicWidgetLabel: name,
      };
    });
  }, []);

  const resetWidget = useCallback(() => {
    setWidgetState(initialWidget());
  }, []);

  useEffect(() => {
    void loadPlans();
    void refreshUser();
  }, [loadPlans, refreshUser]);

  useEffect(() => {
    if (location.pathname !== "/") return;
    clearSearchDisplayState();
  }, [location.pathname, clearSearchDisplayState]);

  useEffect(() => {
    if (location.pathname !== "/pomoc-pri-zavarovalnici") return;
    if (searchResult) return;
    const stored = readSearchResultFromStorage();
    if (!stored) return;
    applySearchResult(stored);
    const storedId = readSavedQueryIdFromStorage();
    if (storedId) setSavedQueryIdState(storedId);
  }, [searchResult, applySearchResult, location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/pomoc-pri-zavarovalnici") return;
    const qid = new URLSearchParams(location.search).get("query");
    if (!qid || !user) return;
    if (savedQueryId === qid && searchResult) return;
    void openSavedQuery(qid);
  }, [
    location.pathname,
    location.search,
    user,
    savedQueryId,
    searchResult,
    openSavedQuery,
  ]);

  useEffect(() => {
    if (!user) {
      setSavedQueries([]);
      setSavedQueriesError(null);
      return;
    }
    void loadSavedQueries();
  }, [user, loadSavedQueries]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (!checkout) return;
    const tab = params.get("tab");
    const cleanUrl = tab
      ? `${window.location.pathname}?tab=${encodeURIComponent(tab)}`
      : window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);
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
    const pendingPlan = peekCheckoutPlanId();
    if (pendingPlan) {
      setSelectedPlanState(pendingPlan);
      try {
        const { checkout_url } = await api.checkout(pendingPlan);
        consumeCheckoutPlanId();
        window.location.href = checkout_url;
        return;
      } catch (e) {
        clearCheckoutPlanId();
        const err = e as ApiError;
        setModals((m) => ({
          ...m,
          credits: true,
          creditsOptions: {
            checkoutError: err.message || "Checkout trenutno ni na voljo.",
          },
        }));
      }
    }
    if (preview?.requires_login) await runFullSearchInner();
  }, [preview, refreshUser, runFullSearchInner]);

  async function runFullSearchInner(place?: GeocodeResult) {
    const target = place ?? selected;
    if (!isValidGeocodePlace(target)) {
      alert("Izberite veljaven naslov s seznama predlogov ali vnesite naslov, ki ga sistem prepozna.");
      return;
    }
    setLoading(true);
    try {
      const searchRange = clampSearchRange({
        from: searchDateFrom,
        to: searchDateTo,
      });
      const body = {
        lat: target.lat,
        lon: target.lon,
        radius_km: searchRadiusKm,
        label: target.label,
        date_from: searchRange.from,
        date_to: searchRange.to,
      };
      const idempotencyKey = buildIdempotencyKey(
        target.lat,
        target.lon,
        searchRadiusKm,
        searchRange.from,
        searchRange.to
      );
      const out = await api.executeQuery({
        ...body,
        idempotency_key: idempotencyKey,
      });
      const res = savedQueryOutToSearchResult(out);
      if (!res || typeof res !== "object" || !Array.isArray(res.daily)) {
        alert(
          "Odgovor strežnika ni v pričakovani obliki. Poskusite znova ali zmanjšajte obdobje/radij."
        );
        return;
      }
      applySearchResult(res);
      setSavedQueryId(out.id);
      setPreview(null);
      setPreviewScreen(null);
      setCredits((c) => ({ ...(c || {}), credits_balance: out.token_balance }));
      if (!out.replay) {
        void loadSavedQueries();
      }
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
      savedQueryId,
      savedQueries,
      savedQueriesLoading,
      savedQueriesError,
      searchRadiusKm,
      searchDateFrom,
      searchDateTo,
      loading,
      pdfDownloading,
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
        if (runPreviewInFlightRef.current) {
          return;
        }
        const q = locationQuery.trim();
        if (!q && !selected) {
          alert("Vnesite naslov ali kraj.");
          return;
        }
        runPreviewInFlightRef.current = true;
        setLoading(true);
        setPreview(null);
        setPreviewScreen(null);
        try {
          let place = selected;
          if (!isValidGeocodePlace(place) || place.label.trim() !== q) {
            const results = await geocodeAddress(q);
            place = results[0];
            setSelected(place);
            setLocationQueryState(place.label);
          }
          if (!isValidGeocodePlace(place)) {
            alert("Lokacija ni veljavna. Izberite naslov s seznama predlogov.");
            return;
          }
          const previewRange = clampSearchRange({
            from: searchDateFrom,
            to: searchDateTo,
          });
          if (
            previewRange.from !== searchDateFrom ||
            previewRange.to !== searchDateTo
          ) {
            setSearchDateFrom(previewRange.from);
            setSearchDateTo(previewRange.to);
          }
          const res = (await api.preview(
            buildPreviewRequestBody({
              lat: place.lat,
              lon: place.lon,
              radius_km: searchRadiusKm,
              label: place.label,
              date_from: previewRange.from,
              date_to: previewRange.to,
            })
          )) as PreviewResult;
          if (getToken()) {
            await refreshUser();
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
          const err = e as ApiError;
          alert(err.message || "Napaka pri predogledu.");
        } finally {
          runPreviewInFlightRef.current = false;
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
        if (!searchResult || pdfDownloading) return;
        setPdfDownloading(true);
        try {
          let blob: Blob;
          if (savedQueryId) {
            blob = await api.generateQueryPdf(savedQueryId);
            void loadSavedQueries();
            await refreshUser();
          } else {
            blob = await api.downloadReportPdf({
              lat: searchResult.lat,
              lon: searchResult.lon,
              radius_km: searchResult.radius_km,
              label: searchResult.location_label,
              date_from: searchResult.date_from,
              date_to: searchResult.date_to,
            });
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `strelko-pregled-${searchResult.date_from}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        } catch (e) {
          const err = e as ApiError;
          if (err.status === 402) {
            setSelectedPlanState(defaultSelectedPlanId(plans));
            setModals((m) => ({
              ...m,
              credits: true,
              creditsOptions: { insufficientCredits: true },
            }));
          } else {
            alert(err.message || "PDF ni na voljo.");
          }
        } finally {
          setPdfDownloading(false);
        }
      },
      loadSavedQueries,
      openSavedQuery,
      generateSavedQueryPdf: async (queryId: string) => {
        try {
          const blob = await api.generateQueryPdf(queryId);
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `strelko-pregled-${queryId.slice(0, 8)}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          await loadSavedQueries();
          await refreshUser();
        } catch (e) {
          const err = e as ApiError;
          if (err.status === 402) {
            setSelectedPlanState(defaultSelectedPlanId(plans));
            setModals((m) => ({
              ...m,
              credits: true,
              creditsOptions: { insufficientCredits: true },
            }));
          } else {
            alert(err.message || "PDF ni mogoče pripraviti.");
          }
        }
      },
      openAuth: (mode) => setModals((m) => ({ ...m, auth: mode, forgotPassword: false })),
      closeAuth: () => {
        clearCheckoutPlanId();
        setModals((m) => ({ ...m, auth: null }));
      },
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
        clearCheckoutPlanId();
        setToken(null);
        setUser(null);
        setCredits(null);
        clearSearchState();
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
        clearCheckoutPlanId();
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
      clearSearch: clearSearchState,
      setWidget: (patch) => setWidgetState((w) => ({ ...w, ...patch })),
      loadWidgetObcine,
      loadWidgetSelection,
      resetWidget,
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
      savedQueryId,
      savedQueries,
      savedQueriesLoading,
      savedQueriesError,
      searchRadiusKm,
      searchDateFrom,
      searchDateTo,
      loading,
      pdfDownloading,
      widget,
      userWidget,
      modals,
      cookieAccepted,
      refreshUser,
      loadPlans,
      loadUserWidget,
      loadWidgetObcine,
      loadWidgetSelection,
      resetWidget,
      afterAuth,
      navigate,
      location.pathname,
      clearSearchState,
      loadSavedQueries,
      openSavedQuery,
      setSavedQueryId,
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
