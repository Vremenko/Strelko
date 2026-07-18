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
import { geocodeSuggest, isValidGeocodePlace, resolveGeocodePlace } from "../lib/geocode";
import { getToken, setToken } from "../lib/utils";
import {
  clearAuthCheckoutIntent,
  clearCheckoutIntent,
  clearCheckoutPlanId,
  clearCheckoutQuantity,
  consumeCheckoutPlanId,
  isCenikAuthReturn,
  peekAuthReturn,
  peekCheckoutPlanId,
  peekCheckoutQuantity,
  setAuthReturn,
} from "../lib/auth-intent";
import { defaultSelectedPlanId } from "../lib/plans-modal";
import {
  DEFAULT_SEARCH_RADIUS_KM,
  buildPreviewRequestBody,
  clampSearchRange,
  defaultSearchRange,
  validateSearchPeriod,
} from "../lib/search-dates";
import { NATIONAL_WIDGET_SCOPE } from "../lib/widget-obcine";
import {
  buildIdempotencyKey,
  savedQueryOutToSearchResult,
  writeSavedQueryIdToStorage,
} from "../lib/saved-queries";
import { parseInsufficientTokensDetail } from "../lib/query-billing";
import { tokenCountLabel } from "../lib/ob-skodi-tokens";
import { canSubscribePodpornik } from "../lib/portal-account";
import { openStripeBillingPortalInNewTab } from "../lib/stripe-billing-portal";
import {
  clearPreviewCheckoutReturn,
  peekPreviewCheckoutReturn,
  PREVIEW_CHECKOUT_RETURN_PATH,
  type PreviewCheckoutReturnPayload,
} from "../lib/preview-checkout-return";
import type {
  AlertsSettings,
  ApiError,
  AuthMode,
  Credits,
  GeocodeResult,
  InsufficientTokensDetail,
  ModalState,
  Plan,
  PlansMeta,
  PreviewResult,
  PreviewScreen,
  SavedQueryOut,
  SavedQuerySummary,
  SearchResult,
  User,
  UserWidgetConfig,
  WidgetObcina,
} from "../types";

const DEFAULT_OB_MID = 11026516;
const SEARCH_RESULT_STORAGE_KEY = "strelko_search_result_v1";

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
  previewTokenNotice: InsufficientTokensDetail | null;
  previewActionError: string | null;
  searchResult: SearchResult | null;
  savedQueryId: string | null;
  activeQueryPdf: {
    queryId: string;
    pdf_tokens_cost: number;
    pdf_button_label: string;
    pdf_cost_hint: string;
  } | null;
  pdfDownloadError: string | null;
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
  fetchSuggestions: (q: string, options?: { sticky?: boolean }) => Promise<void>;
  cancelSuggestions: () => void;
  runPreview: () => Promise<void>;
  runFullSearch: () => Promise<void>;
  downloadPdf: () => Promise<void>;
  loadSavedQueries: () => Promise<void>;
  openSavedQuery: (queryId: string) => Promise<void>;
  generateSavedQueryPdf: (queryId: string) => Promise<void>;
  setSearchRadiusKm: (km: number) => void;
  setSearchDateRange: (range: { from: string; to: string }) => void;
  openAuth: (mode: AuthMode, returnTo?: string) => void;
  closeAuth: () => void;
  openForgotPassword: (email?: string) => void;
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
  checkout: (quantity?: number, planOverride?: string) => Promise<void>;
  openBillingPortal: () => Promise<void>;
  restoreSubscription: () => Promise<void>;
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
  const [previewTokenNotice, setPreviewTokenNotice] = useState<InsufficientTokensDetail | null>(
    null
  );
  const [previewActionError, setPreviewActionError] = useState<string | null>(null);
  const [searchResult, setSearchResultState] = useState<SearchResult | null>(null);
  const [savedQueryId, setSavedQueryIdState] = useState<string | null>(null);
  const [activeQueryPdf, setActiveQueryPdf] = useState<{
    queryId: string;
    pdf_tokens_cost: number;
    pdf_button_label: string;
    pdf_cost_hint: string;
  } | null>(null);
  const [pdfDownloadError, setPdfDownloadError] = useState<string | null>(null);
  const applyQueryPdfMeta = useCallback(
    (out: Pick<SavedQueryOut, "id" | "pdf_tokens_cost" | "pdf_button_label" | "pdf_cost_hint">) => {
      setActiveQueryPdf({
        queryId: out.id,
        pdf_tokens_cost: out.pdf_tokens_cost,
        pdf_button_label: out.pdf_button_label,
        pdf_cost_hint: out.pdf_cost_hint,
      });
    },
    []
  );

  const refreshQueryPdfMeta = useCallback(
    async (queryId: string) => {
      const refreshed = await api.getQuery(queryId);
      applyQueryPdfMeta(refreshed);
      setCredits((c) => ({ ...(c || {}), credits_balance: refreshed.token_balance }));
      return refreshed;
    },
    [applyQueryPdfMeta]
  );

  const triggerPdfDownload = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

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
    setPreviewTokenNotice(null);
    setPreviewActionError(null);
    setActiveQueryPdf(null);
    setPdfDownloadError(null);
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
    setPreviewTokenNotice(null);
    setPreviewActionError(null);
    setActiveQueryPdf(null);
    setPdfDownloadError(null);
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
    forgotPasswordEmail: "",
    checkoutSuccess: null,
    creditsOptions: {},
  });

  /** Stari modal »Izberite paket« je ukinjen — vedno na Cenik. */
  const goToCenik = useCallback(
    (notice?: string) => {
      setModals((m) => ({ ...m, credits: false, creditsOptions: {} }));
      navigate("/cenik", notice ? { state: { cenikNotice: notice } } : undefined);
    },
    [navigate]
  );

  const openCreditsNotice = useCallback(
    (opts: ModalState["creditsOptions"] = {}) => {
      if (opts.checkoutError) {
        goToCenik(opts.checkoutError);
        return;
      }
      if (opts.insufficientCredits) {
        goToCenik(
          "Za podroben pregled potrebujete vsaj 1 žeton. Kupite žetone ali aktivirajte paket Podpornik na ceniku."
        );
        return;
      }
      if (opts.meteoalarmUpsell) {
        goToCenik(
          "MeteoAlarm SMS opozorila so vključena v paketu Podpornik. Aktivacijo najdete na ceniku."
        );
        return;
      }
      goToCenik();
    },
    [goToCenik]
  );

  const [cookieAccepted, setCookieAccepted] = useState(
    () => localStorage.getItem("strelko_cookie_consent") === "1"
  );

  const refreshUserInFlightRef = useRef<Promise<void> | null>(null);
  const runPreviewInFlightRef = useRef(false);
  const openQueryInFlightRef = useRef<string | null>(null);
  /** Prepreči, da bi ?query= po »Nova poizvedba« takoj znova odprl rezultat. */
  const suppressQueryHydrationRef = useRef(false);
  /**
   * Query ID iz pravkar končane lokalne oddaje — hidracija iz URL-ja ga mora prezreti,
   * da ne počisti rezultata in ne sproži podvojenega GET /queries/:id.
   */
  const ignoreHydrationQueryIdRef = useRef<string | null>(null);
  /** Med uspešno lokalno oddajo ne dovolimo effectu »brez query« da počisti rezultat. */
  const localSubmitLockRef = useRef(false);
  const billingPortalInFlightRef = useRef(false);
  const runFullSearchInFlightRef = useRef(false);
  const previewScreenRef = useRef<PreviewScreen>(null);
  const suggestSeqRef = useRef(0);
  const lastSuggestionsRef = useRef<GeocodeResult[]>([]);

  previewScreenRef.current = previewScreen;

  const clearSearch = useCallback(() => {
    const onZavarovalnica = location.pathname === "/pomoc-pri-zavarovalnici";
    const qid = onZavarovalnica
      ? new URLSearchParams(location.search).get("query")
      : null;
    if (qid) {
      suppressQueryHydrationRef.current = true;
      openQueryInFlightRef.current = null;
    }
    localSubmitLockRef.current = false;
    ignoreHydrationQueryIdRef.current = null;
    setLoading(false);
    clearSearchState();
    if (qid) {
      navigate("/pomoc-pri-zavarovalnici", { replace: true });
    }
  }, [location.pathname, location.search, navigate, clearSearchState]);

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

  const commitLocalQueryResult = useCallback(
    (out: SavedQueryOut, res: SearchResult) => {
      const onZavarovalnica = location.pathname === "/pomoc-pri-zavarovalnici";
      if (onZavarovalnica) {
        localSubmitLockRef.current = true;
        ignoreHydrationQueryIdRef.current = out.id;
      }
      applySearchResult(res);
      setSavedQueryId(out.id);
      applyQueryPdfMeta(out);
      setPdfDownloadError(null);
      setPreview(null);
      setPreviewScreen(null);
      setPreviewTokenNotice(null);
      setPreviewActionError(null);
      setCredits((c) => ({ ...(c || {}), credits_balance: out.token_balance }));
      if (!out.replay) {
        void loadSavedQueries();
      }
      const resultsPath = `/pomoc-pri-zavarovalnici?query=${encodeURIComponent(out.id)}`;
      if (onZavarovalnica) {
        navigate(resultsPath, { replace: true });
      } else if (location.pathname !== "/") {
        navigate(resultsPath);
      }
    },
    [
      applySearchResult,
      setSavedQueryId,
      applyQueryPdfMeta,
      loadSavedQueries,
      location.pathname,
      navigate,
    ]
  );

  /** Osnovni predogled (brez žetonov) — počisti plačljivi rezultat, ohrani preview zaslon.
   *  Morebitni ostanki ?query= (ID shranjene poizvedbe) odstranimo: anonimni predogled
   *  nima lastnega ID-ja; star query v URL-ju bi po prijavi sprožil napačen GET /queries/:id. */
  const commitPreviewResult = useCallback(
    (res: PreviewResult, tokenDetail: InsufficientTokensDetail | null = null) => {
      applySearchResult(null);
      setSavedQueryId(null);
      setActiveQueryPdf(null);
      setPdfDownloadError(null);
      setPreview(res);
      setPreviewTokenNotice(tokenDetail);
      setPreviewActionError(null);
      setPreviewScreen(res.has_nearby_strikes ? "teaser" : "no-strikes");
      if (
        location.pathname === "/pomoc-pri-zavarovalnici" &&
        new URLSearchParams(location.search).get("query")
      ) {
        navigate("/pomoc-pri-zavarovalnici", { replace: true });
      }
    },
    [applySearchResult, setSavedQueryId, location.pathname, location.search, navigate]
  );

  /** Obnovi zaklenjeni osnovni predogled po Stripe (novi zavihek) — brez novega API predogleda. */
  const restorePreviewFromCheckoutReturn = useCallback(
    (
      payload: PreviewCheckoutReturnPayload,
      opts?: { availableTokens?: number }
    ) => {
      applySearchResult(null);
      setSavedQueryId(null);
      setActiveQueryPdf(null);
      setPdfDownloadError(null);
      setSelected(payload.selected);
      setLocationQueryState(payload.locationQuery || payload.selected.label || "");
      setSearchRadiusKm(payload.searchRadiusKm);
      setSearchDateFrom(payload.searchDateFrom);
      setSearchDateTo(payload.searchDateTo);
      setPreview(payload.preview);
      setPreviewScreen(payload.previewScreen);
      setPreviewActionError(null);
      if (payload.tokenNotice) {
        const nextAvailable =
          typeof opts?.availableTokens === "number"
            ? opts.availableTokens
            : payload.tokenNotice.available_tokens;
        setPreviewTokenNotice({
          ...payload.tokenNotice,
          available_tokens: nextAvailable,
        });
      } else {
        setPreviewTokenNotice(null);
      }
      clearPreviewCheckoutReturn();
      if (location.pathname !== PREVIEW_CHECKOUT_RETURN_PATH) {
        navigate(PREVIEW_CHECKOUT_RETURN_PATH, { replace: true });
      } else if (new URLSearchParams(location.search).get("query")) {
        navigate(PREVIEW_CHECKOUT_RETURN_PATH, { replace: true });
      }
    },
    [
      applySearchResult,
      setSavedQueryId,
      location.pathname,
      location.search,
      navigate,
    ]
  );

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
        applyQueryPdfMeta(out);
        setPdfDownloadError(null);
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
          /* Med osnovnim predogledom je ?query= tuj/star ID — ne alertaj in ne zbriši predogleda. */
          if (previewScreenRef.current) {
            if (
              location.pathname === "/pomoc-pri-zavarovalnici" &&
              location.search.includes("query=")
            ) {
              navigate("/pomoc-pri-zavarovalnici", { replace: true });
            }
          } else {
            alert("Poizvedbe ni mogoče odpreti. Morda ne obstaja ali ne pripada vašemu računu.");
            if (
              location.pathname === "/pomoc-pri-zavarovalnici" &&
              location.search.includes("query=")
            ) {
              navigate("/pomoc-pri-zavarovalnici", { replace: true });
            }
          }
        } else {
          alert(err.message || "Poizvedbe ni mogoče naložiti.");
        }
      } finally {
        openQueryInFlightRef.current = null;
        setLoading(false);
      }
    },
    [user, applySearchResult, setSavedQueryId, applyQueryPdfMeta, navigate, location.pathname, location.search]
  );

  const refreshUser = useCallback(async () => {
    const previous = refreshUserInFlightRef.current;

    const task = (async () => {
      /* Počakaj prejšnji klic, nato vedno preveri trenutni token (nova prijava ne sme
         podedovati neuspeha stare seje, ki bi zbrisala svež access token). */
      if (previous) {
        try {
          await previous;
        } catch {
          /* ignore */
        }
      }

      const token = getToken();
      if (!token) {
        setUser(null);
        setCredits(null);
        setPaymentsEnabled(false);
        return;
      }
      try {
        const u = await api.whoami();
        if (getToken() !== token) return;
        const [c, a] = await Promise.all([api.credits(), api.alerts()]);
        if (getToken() !== token) return;
        setUser(u);
        setCredits(c);
        setAlerts(a);
        setPaymentsEnabled(!!c.payments_enabled);
      } catch {
        if (getToken() !== token) return;
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

  /* Običajen prihod na /pomoc-pri-zavarovalnici (brez ?query=): prazen obrazec.
     Med lokalno oddajo (loading / lock) in med osnovnim predogledom ne čistimo —
     sicer form ↔ results utripa oziroma predogled izgine takoj po uspehu. */
  useEffect(() => {
    if (location.pathname !== "/pomoc-pri-zavarovalnici") return;
    const qid = new URLSearchParams(location.search).get("query");
    if (qid) return;
    if (localSubmitLockRef.current || loading) return;
    if (previewScreen) return;
    suppressQueryHydrationRef.current = false;
    openQueryInFlightRef.current = null;
    ignoreHydrationQueryIdRef.current = null;
    clearSearchState();
  }, [location.pathname, location.search, clearSearchState, loading, previewScreen]);

  useEffect(() => {
    if (location.pathname !== "/pomoc-pri-zavarovalnici") return;
    const qid = new URLSearchParams(location.search).get("query");
    if (!qid || !user) return;
    /* Osnovni predogled ni shranjena poizvedba — ?query= med predogledom ne nalagaj. */
    if (previewScreen) return;
    if (suppressQueryHydrationRef.current) return;
    if (ignoreHydrationQueryIdRef.current === qid) {
      ignoreHydrationQueryIdRef.current = null;
      localSubmitLockRef.current = false;
      return;
    }
    if (savedQueryId === qid && searchResult) return;
    void openSavedQuery(qid);
  }, [
    location.pathname,
    location.search,
    user,
    savedQueryId,
    searchResult,
    previewScreen,
    openSavedQuery,
  ]);

  /* Po prijavi med osnovnim predogledom odstrani tuj/star ?query= (ni ID predogleda). */
  useEffect(() => {
    if (!user || !previewScreen) return;
    if (location.pathname !== "/pomoc-pri-zavarovalnici") return;
    const qid = new URLSearchParams(location.search).get("query");
    if (!qid) return;
    navigate("/pomoc-pri-zavarovalnici", { replace: true });
  }, [user, previewScreen, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (!user) {
      setSavedQueries([]);
      setSavedQueriesError(null);
      return;
    }
    void loadSavedQueries();
  }, [user, loadSavedQueries]);

  useEffect(() => {
    if (!user || !savedQueryId) return;
    if (activeQueryPdf?.queryId === savedQueryId) return;
    void refreshQueryPdfMeta(savedQueryId).catch(() => {
      /* poizvedba morda ni več na voljo */
    });
  }, [user, savedQueryId, activeQueryPdf?.queryId, refreshQueryPdfMeta]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (!checkout) return;
    const tab = params.get("tab");
    const cleanUrl = tab
      ? `${window.location.pathname}?tab=${encodeURIComponent(tab)}`
      : window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);

    const pendingPreviewReturn = peekPreviewCheckoutReturn();

    if (checkout === "cancel") {
      if (pendingPreviewReturn) {
        restorePreviewFromCheckoutReturn(pendingPreviewReturn);
        return;
      }
      goToCenik("Plačilo je bilo preklicano.");
      return;
    }
    if (checkout !== "success") return;
    const sid = params.get("session_id");
    if (!sid || !getToken()) return;
    const planFromUrl = params.get("plan");
    const planHint: "ob_skodi" | "podpornik" | null =
      planFromUrl === "ob_skodi" || planFromUrl === "podpornik"
        ? planFromUrl
        : peekCheckoutPlanId();
    void (async () => {
      try {
        const res = await api.verifyCheckout(sid);
        setCredits((c) => ({ ...(c || {}), credits_balance: res.credits_balance }));
        await refreshUser();
        clearCheckoutIntent();
        const resume = peekPreviewCheckoutReturn();
        if (resume) {
          restorePreviewFromCheckoutReturn(resume, {
            availableTokens: res.credits_balance,
          });
        }
        setModals({
          auth: null,
          credits: false,
          alerts: false,
          widget: false,
          forgotPassword: false,
          forgotPasswordEmail: "",
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
        await refreshUser().catch(() => {
          /* stanje žetonov po napaki še vedno poskusimo osvežiti */
        });
        let resolvedPlan: "ob_skodi" | "podpornik" | null = planHint;
        if (!resolvedPlan && err.data && typeof err.data === "object") {
          const apiPlan = (err.data as { plan_id?: string }).plan_id;
          if (apiPlan === "ob_skodi" || apiPlan === "podpornik") {
            resolvedPlan = apiPlan;
          }
        }
        const resume = peekPreviewCheckoutReturn();
        if (resume) {
          restorePreviewFromCheckoutReturn(resume);
          setPreviewActionError(
            err.message ||
              "Nakupa žetonov ni bilo mogoče potrditi. Če je bila kartica obremenjena, kontaktirajte podporo."
          );
          return;
        }
        const fallback =
          resolvedPlan === "podpornik"
            ? "Naročnine ni bilo mogoče potrditi. Če je bila kartica bremenjena, kontaktirajte podporo."
            : "Nakupa žetonov ni bilo mogoče dokončati. Če je bila kartica obremenjena, žetonov ne kupujte znova in kontaktirajte podporo.";
        goToCenik(err.message || fallback);
      }
    })();
  }, [
    refreshUser,
    credits?.plan_name_sl,
    goToCenik,
    restorePreviewFromCheckoutReturn,
  ]);

  const afterAuth = useCallback(async () => {
    await refreshUser();
    setModals((m) => ({ ...m, auth: null }));
    if (isCenikAuthReturn(peekAuthReturn())) {
      return;
    }
    const pendingPlan = peekCheckoutPlanId();
    if (pendingPlan) {
      if (pendingPlan === "podpornik") {
        try {
          const currentCredits = await api.credits();
          if (!canSubscribePodpornik(currentCredits)) {
            clearCheckoutIntent();
            goToCenik("Paket Podpornik je že aktiven.");
            return;
          }
        } catch {
          /* nadaljuj z običajnim checkoutom */
        }
      }
      setSelectedPlanState(pendingPlan);
      try {
        const pendingQty = peekCheckoutQuantity();
        const { checkout_url } = await api.checkout({
          plan: pendingPlan,
          ...(pendingPlan === "ob_skodi" && pendingQty != null
            ? { quantity: pendingQty }
            : {}),
        });
        consumeCheckoutPlanId();
        clearCheckoutQuantity();
        window.location.href = checkout_url;
        return;
      } catch (e) {
        clearCheckoutIntent();
        const err = e as ApiError;
        goToCenik(err.message || "Checkout trenutno ni na voljo.");
      }
    }
  }, [refreshUser, goToCenik]);

  async function runFullSearchInner(place?: GeocodeResult) {
    const target = place ?? selected;
    if (!isValidGeocodePlace(target)) {
      alert("Izberite veljaven naslov s seznama predlogov ali vnesite naslov, ki ga sistem prepozna.");
      return;
    }
    const fromIso =
      previewScreen && preview?.date_from ? preview.date_from : searchDateFrom;
    const toIso = previewScreen && preview?.date_to ? preview.date_to : searchDateTo;
    const periodErr = validateSearchPeriod(fromIso, toIso);
    if (periodErr) {
      alert(periodErr);
      return;
    }
    setPreviewActionError(null);
    setLoading(true);
    try {
      const searchRange = clampSearchRange({
        from: fromIso,
        to: toIso,
      });
      if (searchRange.from !== searchDateFrom || searchRange.to !== searchDateTo) {
        setSearchDateFrom(searchRange.from);
        setSearchDateTo(searchRange.to);
      }
      const idempotencyKey = buildIdempotencyKey(
        target.lat,
        target.lon,
        searchRadiusKm,
        searchRange.from,
        searchRange.to
      );

      const executeOnce = () =>
        api.executeQuery({
          lat: target.lat,
          lon: target.lon,
          radius_km: searchRadiusKm,
          label: target.label,
          date_from: searchRange.from,
          date_to: searchRange.to,
          idempotency_key: idempotencyKey,
        });

      let out: SavedQueryOut;
      try {
        out = await executeOnce();
      } catch (firstErr) {
        const err = firstErr as ApiError;
        if (err.status !== 401) throw firstErr;
        await refreshUser();
        if (!getToken()) {
          setAuthReturn(`${location.pathname}${location.search}${location.hash}`);
          setModals((m) => ({ ...m, auth: "login" }));
          return;
        }
        out = await executeOnce();
      }

      const res = savedQueryOutToSearchResult(out);
      if (!res || typeof res !== "object" || !Array.isArray(res.daily)) {
        alert(
          "Odgovor strežnika ni v pričakovani obliki. Poskusite znova ali zmanjšajte obdobje/radij."
        );
        return;
      }
      commitLocalQueryResult(out, res);
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 402) {
        const tokenDetail = parseInsufficientTokensDetail(err.data);
        if (previewScreen) {
          if (tokenDetail) setPreviewTokenNotice(tokenDetail);
        } else {
          setSelectedPlanState(defaultSelectedPlanId(plans));
          openCreditsNotice({ insufficientCredits: true });
        }
      } else if (err.status === 401) {
        setToken(null);
        setUser(null);
        setAuthReturn(`${location.pathname}${location.search}${location.hash}`);
        setModals((m) => ({ ...m, auth: "login" }));
      } else if (previewScreen) {
        setPreviewActionError(err.message || "Odklepa ni bilo mogoče dokončati. Poskusite znova.");
      } else {
        alert(err.message || "Napaka pri iskanju.");
      }
    } finally {
      setLoading(false);
    }
  }

  const cancelSuggestions = useCallback(() => {
    suggestSeqRef.current += 1;
    lastSuggestionsRef.current = [];
    setSuggestions([]);
  }, []);

  const fetchSuggestions = useCallback(async (q: string, options?: { sticky?: boolean }) => {
    const trimmed = q.trim();
    if (trimmed.length < 3) {
      cancelSuggestions();
      lastSuggestionsRef.current = [];
      return;
    }

    const seq = ++suggestSeqRef.current;

    try {
      const results = await geocodeSuggest(trimmed, {
        previous: options?.sticky ? lastSuggestionsRef.current : undefined,
      });
      if (seq !== suggestSeqRef.current) return;
      lastSuggestionsRef.current = results;
      setSuggestions(results);
    } catch {
      if (seq !== suggestSeqRef.current) return;
      if (!options?.sticky) {
        lastSuggestionsRef.current = [];
        setSuggestions([]);
      }
    }
  }, [cancelSuggestions]);

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
      previewTokenNotice,
      previewActionError,
      searchResult,
      savedQueryId,
      activeQueryPdf,
      pdfDownloadError,
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
      fetchSuggestions,
      cancelSuggestions,
      runPreview: async () => {
        if (runPreviewInFlightRef.current) {
          return;
        }
        const rawQuery = locationQuery;
        if (!rawQuery.trim() && !selected) {
          alert("Vnesite naslov ali kraj.");
          return;
        }
        const periodErr = validateSearchPeriod(searchDateFrom, searchDateTo);
        if (periodErr) {
          alert(periodErr);
          return;
        }
        runPreviewInFlightRef.current = true;
        setLoading(true);
        setPreview(null);
        setPreviewScreen(null);
        setPreviewTokenNotice(null);
        try {
          let place = selected;
          if (!isValidGeocodePlace(place) || place.label.trim() !== rawQuery.trim()) {
            place = await resolveGeocodePlace(rawQuery);
            setSelected(place);
          }
          if (!isValidGeocodePlace(place)) {
            alert("Lokacija ni veljavna. Izberite naslov s seznama predlogov.");
            return;
          }
          const searchRange = clampSearchRange({
            from: searchDateFrom,
            to: searchDateTo,
          });
          if (
            searchRange.from !== searchDateFrom ||
            searchRange.to !== searchDateTo
          ) {
            setSearchDateFrom(searchRange.from);
            setSearchDateTo(searchRange.to);
          }
          const previewBody = buildPreviewRequestBody({
            lat: place.lat,
            lon: place.lon,
            radius_km: searchRadiusKm,
            label: place.label,
            date_from: searchRange.from,
            date_to: searchRange.to,
          });

          if (getToken()) {
            await refreshUser();
            const idempotencyKey = buildIdempotencyKey(
              place.lat,
              place.lon,
              searchRadiusKm,
              searchRange.from,
              searchRange.to
            );
            try {
              const out = await api.executeQuery({
                lat: place.lat,
                lon: place.lon,
                radius_km: searchRadiusKm,
                label: place.label,
                date_from: searchRange.from,
                date_to: searchRange.to,
                idempotency_key: idempotencyKey,
              });
              const res = savedQueryOutToSearchResult(out);
              if (!res || typeof res !== "object" || !Array.isArray(res.daily)) {
                alert(
                  "Odgovor strežnika ni v pričakovani obliki. Poskusite znova ali zmanjšajte obdobje/radij."
                );
                return;
              }
              commitLocalQueryResult(out, res);
              return;
            } catch (e) {
              const err = e as ApiError;
              if (err.status === 402) {
                const tokenDetail = parseInsufficientTokensDetail(err.data);
                const res = (await api.preview(previewBody)) as PreviewResult;
                commitPreviewResult(res, tokenDetail);
                return;
              }
              if (err.status === 401) {
                setToken(null);
                setModals((m) => ({ ...m, auth: "login" }));
                return;
              }
              alert(err.message || "Napaka pri iskanju.");
              return;
            }
          }

          const res = (await api.preview(previewBody)) as PreviewResult;
          if (!getToken()) {
            commitPreviewResult(res);
          } else {
            setPreview(res);
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
        const clamped = clampSearchRange(range);
        setSearchDateFrom(clamped.from);
        setSearchDateTo(clamped.to);
      },
      openPremiumUpsell: () => {
        setSelectedPlanState(defaultSelectedPlanId(plans));
        goToCenik();
      },
      openMeteoAlarmUpsell: () => {
        setSelectedPlanState(defaultSelectedPlanId(plans));
        if (alerts?.sms_eligible) {
          setModals((m) => ({ ...m, alerts: true }));
        } else {
          openCreditsNotice({ meteoalarmUpsell: true });
        }
      },
      runFullSearch: async () => {
        if (runFullSearchInFlightRef.current) return;
        if (!getToken()) {
          setAuthReturn(`${location.pathname}${location.search}${location.hash}`);
          setModals((m) => ({ ...m, auth: "login" }));
          return;
        }
        if (!user) {
          await refreshUser();
        }
        if (!getToken()) {
          setAuthReturn(`${location.pathname}${location.search}${location.hash}`);
          setModals((m) => ({ ...m, auth: "login" }));
          return;
        }
        runFullSearchInFlightRef.current = true;
        try {
          await runFullSearchInner();
        } finally {
          runFullSearchInFlightRef.current = false;
        }
      },
      downloadPdf: async () => {
        if (!searchResult || !savedQueryId || pdfDownloading) return;
        setPdfDownloading(true);
        setPdfDownloadError(null);
        try {
          const blob = await api.generateQueryPdf(savedQueryId);
          triggerPdfDownload(blob, `strelko-pregled-${searchResult.date_from}.pdf`);
          await refreshQueryPdfMeta(savedQueryId);
          void loadSavedQueries();
          await refreshUser();
        } catch (e) {
          const err = e as ApiError;
          if (err.status === 402) {
            setPdfDownloadError(
              `Za izdelavo PDF-poročila potrebujete ${tokenCountLabel(1, "accusative")}.`
            );
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
        const blob = await api.generateQueryPdf(queryId);
        triggerPdfDownload(blob, `strelko-pregled-${queryId.slice(0, 8)}.pdf`);
        await refreshQueryPdfMeta(queryId);
        void loadSavedQueries();
        await refreshUser();
        if (savedQueryId === queryId) {
          setPdfDownloadError(null);
        }
      },
      openAuth: (mode, returnTo) => {
        setAuthReturn(
          returnTo ?? `${location.pathname}${location.search}${location.hash}`
        );
        setModals((m) => ({
          ...m,
          auth: mode,
          forgotPassword: false,
          forgotPasswordEmail: "",
        }));
      },
      closeAuth: () => {
        clearAuthCheckoutIntent();
        setModals((m) => ({ ...m, auth: null }));
      },
      openForgotPassword: (email) =>
        setModals((m) => ({
          ...m,
          auth: null,
          forgotPassword: true,
          forgotPasswordEmail: email?.trim() || m.forgotPasswordEmail,
        })),
      closeForgotPassword: () =>
        setModals((m) => ({ ...m, forgotPassword: false, forgotPasswordEmail: "" })),
      login: async (email, password) => {
        const tok = await api.login(email, password);
        setToken(tok.access_token);
        await afterAuth();
      },
      register: async (email, password) => {
        await api.register(email, password);
      },
      loginGoogle: async (credential) => {
        const tok = await api.loginGoogle(credential);
        setToken(tok.access_token);
        await afterAuth();
      },
      logout: () => {
        clearAuthCheckoutIntent();
        setToken(null);
        setUser(null);
        setCredits(null);
        clearSearchState();
      },
      openCredits: (opts = {}) => openCreditsNotice(opts),
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
      checkout: async (quantity?: number, planOverride?: string) => {
        clearCheckoutPlanId();
        const plan = planOverride ?? selectedPlan;
        if (planOverride) {
          setSelectedPlanState(planOverride);
        }
        if (plan === "podpornik" && !canSubscribePodpornik(credits)) {
          goToCenik("Paket Podpornik je že aktiven.");
          return;
        }
        const resolvedQty = quantity ?? peekCheckoutQuantity();
        try {
          const { checkout_url } = await api.checkout({
            plan,
            ...(plan === "ob_skodi" && resolvedQty != null ? { quantity: resolvedQty } : {}),
          });
          clearCheckoutQuantity();
          window.location.href = checkout_url;
        } catch (e) {
          const err = e as ApiError;
          goToCenik(err.message || "Checkout trenutno ni na voljo.");
        }
      },
      openBillingPortal: async () => {
        if (billingPortalInFlightRef.current) return;
        billingPortalInFlightRef.current = true;
        try {
          await openStripeBillingPortalInNewTab(async () => {
            const { portal_url } = await api.billingPortal();
            return portal_url;
          });
        } catch (e) {
          const message =
            (e as Error).message ||
            "Portal za upravljanje naročnine trenutno ni na voljo.";
          window.alert(message);
        } finally {
          billingPortalInFlightRef.current = false;
        }
      },
      restoreSubscription: async () => {
        const updated = await api.restoreSubscription();
        setCredits(updated);
        await refreshUser();
      },
      acceptCookies: () => {
        localStorage.setItem("strelko_cookie_consent", "1");
        setCookieAccepted(true);
      },
      clearSearch,
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
          if (!canSubscribePodpornik(credits)) {
            window.alert("Paket Podpornik je že aktiven.");
            return;
          }
          setSelectedPlanState("podpornik");
          goToCenik();
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
      previewTokenNotice,
      previewActionError,
      searchResult,
      savedQueryId,
      activeQueryPdf,
      pdfDownloadError,
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
      fetchSuggestions,
      cancelSuggestions,
      loadUserWidget,
      loadWidgetObcine,
      loadWidgetSelection,
      resetWidget,
      afterAuth,
      navigate,
      goToCenik,
      openCreditsNotice,
      location.pathname,
      location.search,
      location.hash,
      clearSearch,
      loadSavedQueries,
      openSavedQuery,
      commitLocalQueryResult,
      commitPreviewResult,
      applySearchResult,
      setSavedQueryId,
      refreshQueryPdfMeta,
      triggerPdfDownload,
      applyQueryPdfMeta,
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
