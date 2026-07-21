/**
 * Prehodi pogleda na /pomoc-pri-zavarovalnici.
 *
 * Začetni marketing obrazec (“Vam je strela…”) sme biti samo v stanju "form".
 * Med aktivno poizvedbo (loading / pending / hold / ?query=) nikoli ne vrnemo "form",
 * sicer uporabnik vidi isti naslov kot blisk med results → … → results.
 */

export type QueryViewState = "form" | "loading" | "preview" | "unlocking" | "results";

export type ZavarovalnicaNoQueryDecision =
  | "noop"
  | "restore_snapshot"
  | "clear_stale_result";

export type ZavarovalnicaNoQueryInput = {
  hasQueryParam: boolean;
  /**
   * Prejšnji render je imel ?query=, zdaj ga ni — in to zaradi brskalnikovega Nazaj/Naprej
   * (popstate), ne zaradi vmesne Router dirke.
   */
  leftResultsUrl: boolean;
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
  /** Po Nazaj: rezultat ostane v spominu za Naprej — ne briši kot »stale«. */
  hasCachedResultAfterBack: boolean;
};

/**
 * Odločitev efekta »URL brez ?query=«.
 * Obnova obrazca samo ob pravem Nazaj (popstate).
 */
export function decideZavarovalnicaNoQueryAction(
  p: ZavarovalnicaNoQueryInput
): ZavarovalnicaNoQueryDecision {
  if (p.hasQueryParam) return "noop";

  if (p.leftResultsUrl) {
    if (p.hasBackSnapshot) return "restore_snapshot";
    if (p.hasSearchResult || p.hasSavedQueryId) return "restore_snapshot";
    return "noop";
  }

  return "noop";
}

/**
 * - results: imamo rezultat in nismo po Nazaj
 * - loading: aktivna poizvedba / sync URL — BREZ marketing obrazca
 * - form: samo prazen začetek ali pravi Nazaj (preferFormAfterBack)
 */
export function deriveZavarovalnicaViewState(
  searchResult: unknown,
  previewScreen: "teaser" | "no-strikes" | null,
  loading: boolean,
  hasQueryParam = true,
  pendingResultNavigation = false,
  holdResultsQueryId: string | null = null,
  savedQueryId: string | null = null,
  preferFormAfterBack = false
): QueryViewState {
  if (searchResult && !preferFormAfterBack) return "results";
  if (previewScreen) return loading ? "unlocking" : "preview";

  const activeFlow =
    loading ||
    pendingResultNavigation ||
    Boolean(holdResultsQueryId) ||
    Boolean(savedQueryId && !preferFormAfterBack) ||
    (hasQueryParam && !preferFormAfterBack);

  if (activeFlow) return "loading";
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
