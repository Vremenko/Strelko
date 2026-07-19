/**
 * Prehodi pogleda na /pomoc-pri-zavarovalnici.
 * Loči pravi »Nazaj« (URL brez ?query=) od dirke, kjer je rezultat že v stanju,
 * URL pa še nima ?query= (React Router navigate v transition).
 */

export type QueryViewState = "form" | "loading" | "preview" | "unlocking" | "results";

export type ZavarovalnicaNoQueryDecision =
  | "noop"
  | "restore_snapshot"
  | "clear_stale_result";

export type ZavarovalnicaNoQueryInput = {
  hasQueryParam: boolean;
  localSubmitLocked: boolean;
  loading: boolean;
  /** true, dokler lokalni commit/odpiranje čaka na ?query= v URL-ju */
  pendingResultNavigation: boolean;
  hasPreviewScreen: boolean;
  hasBackSnapshot: boolean;
  hasPendingScrollRestore: boolean;
  skipFormScroll: boolean;
  hasSearchResult: boolean;
  hasSavedQueryId: boolean;
};

/**
 * Odločitev efekta »URL brez ?query=«: kdaj obnoviti obrazec (Nazaj) in kdaj ne posegati
 * (prva poizvedba še čaka na sync URL-ja).
 */
export function decideZavarovalnicaNoQueryAction(
  p: ZavarovalnicaNoQueryInput
): ZavarovalnicaNoQueryDecision {
  if (p.hasQueryParam) return "noop";
  if (p.localSubmitLocked || p.loading) return "noop";
  /* Rezultat že nastavljen, navigate še ni zavezal ?query= — NE skoči na obrazec. */
  if (p.pendingResultNavigation) return "noop";
  if (p.hasPreviewScreen) return "noop";
  if (p.hasBackSnapshot) return "restore_snapshot";
  if (p.hasPendingScrollRestore || p.skipFormScroll) return "noop";
  if (!p.hasSearchResult && !p.hasSavedQueryId) return "noop";
  return "clear_stale_result";
}

export function deriveZavarovalnicaViewState(
  searchResult: unknown,
  previewScreen: "teaser" | "no-strikes" | null,
  loading: boolean
): QueryViewState {
  if (searchResult) return "results";
  if (previewScreen) return loading ? "unlocking" : "preview";
  if (loading) return "loading";
  return "form";
}

/** Ali sme začetni bootstrap (user / shranjene poizvedbe) še nastaviti privzeti obrazec. */
export function canBootstrapResetToForm(p: {
  userTriggeredQuery: boolean;
  hasSavedQuerySelected: boolean;
  hasActiveResult: boolean;
  requestInFlight: boolean;
}): boolean {
  if (p.userTriggeredQuery) return false;
  if (p.hasSavedQuerySelected) return false;
  if (p.hasActiveResult) return false;
  if (p.requestInFlight) return false;
  return true;
}
