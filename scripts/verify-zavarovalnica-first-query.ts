/**
 * Regresijski testi: prva poizvedba + Nazaj/Naprej na /pomoc-pri-zavarovalnici.
 * Zagon: npx tsx scripts/verify-zavarovalnica-first-query.ts
 */
import assert from "node:assert/strict";
import {
  canBootstrapResetToForm,
  decideZavarovalnicaNoQueryAction,
  deriveZavarovalnicaViewState,
  type ZavarovalnicaNoQueryInput,
} from "../src/lib/zavarovalnica-view-transition.ts";

const idleNoQuery: ZavarovalnicaNoQueryInput = {
  hasQueryParam: false,
  leftResultsUrl: false,
  localSubmitLocked: false,
  loading: false,
  pendingResultNavigation: false,
  hasPreviewScreen: false,
  hasBackSnapshot: false,
  hasPendingScrollRestore: false,
  skipFormScroll: false,
  hasSearchResult: false,
  hasSavedQueryId: false,
  hasCachedResultAfterBack: false,
};

/* --- tests --- */

assert.equal(deriveZavarovalnicaViewState(null, null, false, false), "form");
assert.equal(deriveZavarovalnicaViewState(null, null, true, false), "loading");
assert.equal(deriveZavarovalnicaViewState({ a: 1 }, null, false, true), "results");
assert.equal(
  deriveZavarovalnicaViewState({ a: 1 }, null, false, false, false, null, null, false),
  "results",
  "rezultat brez ?query= → results"
);
assert.equal(
  deriveZavarovalnicaViewState({ a: 1 }, null, false, false, false, null, null, true),
  "form",
  "po Nazaj: preferFormAfterBack → form"
);
assert.equal(
  deriveZavarovalnicaViewState(null, null, false, false, true),
  "loading",
  "pending brez rezultata → loading (ne marketing form)"
);
assert.equal(
  deriveZavarovalnicaViewState(null, null, false, true, false, "qid", null, false),
  "loading",
  "?query= brez rezultata → loading (ne marketing form)"
);
assert.equal(
  deriveZavarovalnicaViewState(null, null, false, false, false, "qid", null, false),
  "loading",
  "hold brez rezultata → loading (ne marketing form)"
);
assert.equal(deriveZavarovalnicaViewState(null, "teaser", false, false), "preview");
assert.equal(deriveZavarovalnicaViewState(null, "teaser", true, false), "unlocking");

/* Prva ročna: form → loading → results (brez vmesnega form) */
const manualSeq = [
  deriveZavarovalnicaViewState(null, null, false, false),
  deriveZavarovalnicaViewState(null, null, true, false),
  deriveZavarovalnicaViewState({ ok: true }, null, false, false, true, "id", "id", false),
  deriveZavarovalnicaViewState({ ok: true }, null, false, true, false, "id", "id", false),
];
assert.deepEqual(manualSeq, ["form", "loading", "results", "results"]);
assert.ok(!manualSeq.slice(1).includes("form"), "po začetku ni bliska marketing obrazca");

/* Dirka: snap + rezultat brez popstate → noop */
assert.equal(
  decideZavarovalnicaNoQueryAction({
    ...idleNoQuery,
    hasSearchResult: true,
    hasSavedQueryId: true,
    hasBackSnapshot: true,
    pendingResultNavigation: false,
  }),
  "noop"
);

assert.equal(
  decideZavarovalnicaNoQueryAction({
    ...idleNoQuery,
    leftResultsUrl: true,
    hasBackSnapshot: true,
    hasSearchResult: true,
  }),
  "restore_snapshot"
);

assert.equal(
  canBootstrapResetToForm({
    userTriggeredQuery: true,
    hasSavedQuerySelected: false,
    hasActiveResult: false,
    requestInFlight: false,
  }),
  false
);

console.log("verify-zavarovalnica-first-query: OK");
