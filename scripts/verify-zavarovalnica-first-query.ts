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

function viewsAfterFirstManualQuery(): string[] {
  const views: string[] = ["form"];
  views.push(deriveZavarovalnicaViewState(null, null, true, false)); // loading
  /* Rezultat pride, URL še brez ?query=, pendingNavigation = true → ostane loading */
  const mid: ZavarovalnicaNoQueryInput = {
    ...idleNoQuery,
    hasSearchResult: true,
    hasSavedQueryId: true,
    hasBackSnapshot: true,
    localSubmitLocked: true,
    pendingResultNavigation: true,
  };
  assert.equal(decideZavarovalnicaNoQueryAction(mid), "noop");
  views.push(deriveZavarovalnicaViewState({ ok: true }, null, false, false, true)); // loading while pending URL
  /* loading se konča — še vedno pending URL */
  const afterLoad: ZavarovalnicaNoQueryInput = {
    ...mid,
    loading: false,
    localSubmitLocked: true,
    pendingResultNavigation: true,
  };
  assert.equal(decideZavarovalnicaNoQueryAction(afterLoad), "noop");
  views.push(deriveZavarovalnicaViewState({ ok: true }, null, false, true)); // results once URL synced
  return views;
}

function viewsAfterFirstSavedQuery(): string[] {
  const views: string[] = ["form"];
  views.push(deriveZavarovalnicaViewState(null, null, true, false));
  const race: ZavarovalnicaNoQueryInput = {
    ...idleNoQuery,
    hasSearchResult: true,
    hasSavedQueryId: true,
    hasBackSnapshot: true,
    localSubmitLocked: true,
    pendingResultNavigation: true,
    loading: false,
  };
  assert.equal(
    decideZavarovalnicaNoQueryAction(race),
    "noop",
    "shranjena: ne sme restore_snapshot med čakanjem na ?query="
  );
  views.push(deriveZavarovalnicaViewState({ ok: true }, null, false, false, true)); // loading, ne form
  views.push(deriveZavarovalnicaViewState({ ok: true }, null, false, true)); // results
  return views;
}

/** Pred popravkom: loading false + snap + rezultat + brez pending → restore (trzanje). */
function legacyFlickerDecision(): string {
  return decideZavarovalnicaNoQueryAction({
    ...idleNoQuery,
    hasSearchResult: true,
    hasSavedQueryId: true,
    hasBackSnapshot: true,
    localSubmitLocked: false,
    pendingResultNavigation: false,
    loading: false,
  });
}

function simulateViewSequence(decisions: Array<"noop" | "restore_snapshot" | "clear_stale_result">) {
  const seq: string[] = ["form", "loading", "results"];
  for (const d of decisions) {
    if (d === "restore_snapshot" || d === "clear_stale_result") {
      seq.push("form");
      seq.push("results");
    }
  }
  return seq;
}

/* --- tests --- */

assert.equal(deriveZavarovalnicaViewState(null, null, false, false), "form");
assert.equal(deriveZavarovalnicaViewState(null, null, true, false), "loading");
assert.equal(deriveZavarovalnicaViewState({ a: 1 }, null, false, true), "results");
assert.equal(
  deriveZavarovalnicaViewState({ a: 1 }, null, false, false),
  "form",
  "brez ?query= ne kaži rezultata (Nazaj)"
);
assert.equal(
  deriveZavarovalnicaViewState({ a: 1 }, null, false, false, true),
  "loading",
  "med čakanjem na ?query= ostane loading (brez trzaja na obrazec)"
);
assert.equal(deriveZavarovalnicaViewState(null, "teaser", false, false), "preview");
assert.equal(deriveZavarovalnicaViewState(null, "teaser", true, false), "unlocking");

const manualSeq = viewsAfterFirstManualQuery();
assert.deepEqual(manualSeq, ["form", "loading", "loading", "results"]);
assert.equal(
  manualSeq.filter((v) => v === "results").length,
  1,
  "prva ročna: results šele po sync URL"
);
assert.equal(
  manualSeq.filter((v) => v === "form").length,
  1,
  "prva ročna: samo začetni obrazec, brez vmesnega"
);

const savedSeq = viewsAfterFirstSavedQuery();
assert.deepEqual(savedSeq, ["form", "loading", "loading", "results"]);
assert.equal(savedSeq.filter((v) => v === "form").length, 1);
assert.ok(savedSeq.includes("results"));

assert.equal(
  legacyFlickerDecision(),
  "restore_snapshot",
  "brez pending/lock: snap še vedno obnovi obrazec"
);
assert.deepEqual(
  simulateViewSequence(["restore_snapshot"]),
  ["form", "loading", "results", "form", "results"],
  "stari bug: vmesni obrazec"
);
assert.deepEqual(
  simulateViewSequence(["noop", "noop"]),
  ["form", "loading", "results"],
  "po popravku: brez vmesnega obrazca"
);

/* Bootstrap med poizvedbo ne sme resetirati */
assert.equal(
  canBootstrapResetToForm({
    userTriggeredQuery: true,
    hasSavedQuerySelected: false,
    hasActiveResult: false,
    requestInFlight: false,
  }),
  false
);
assert.equal(
  canBootstrapResetToForm({
    userTriggeredQuery: false,
    hasSavedQuerySelected: true,
    hasActiveResult: false,
    requestInFlight: false,
  }),
  false
);
assert.equal(
  canBootstrapResetToForm({
    userTriggeredQuery: false,
    hasSavedQuerySelected: false,
    hasActiveResult: true,
    requestInFlight: false,
  }),
  false
);
assert.equal(
  canBootstrapResetToForm({
    userTriggeredQuery: false,
    hasSavedQuerySelected: false,
    hasActiveResult: false,
    requestInFlight: true,
  }),
  false
);
assert.equal(
  canBootstrapResetToForm({
    userTriggeredQuery: false,
    hasSavedQuerySelected: false,
    hasActiveResult: false,
    requestInFlight: false,
  }),
  true
);

/* Nalaganje userja / shranjenih med poizvedbo → noop */
assert.equal(
  decideZavarovalnicaNoQueryAction({
    ...idleNoQuery,
    hasSearchResult: true,
    hasSavedQueryId: true,
    hasBackSnapshot: true,
    pendingResultNavigation: true,
  }),
  "noop"
);

/* Zakasnjen starejši odgovor: nov pending/lock zmaga — starejši clear ne sme prepisati */
assert.equal(
  decideZavarovalnicaNoQueryAction({
    ...idleNoQuery,
    hasSearchResult: true,
    hasSavedQueryId: true,
    localSubmitLocked: true,
    pendingResultNavigation: true,
  }),
  "noop"
);

/* Druga poizvedba z že prisotnim ?query= */
assert.equal(
  decideZavarovalnicaNoQueryAction({
    ...idleNoQuery,
    hasQueryParam: true,
    hasSearchResult: true,
    hasSavedQueryId: true,
  }),
  "noop"
);

/* Nova poizvedba / Nazaj: snap + ni pending → restore */
assert.equal(
  decideZavarovalnicaNoQueryAction({
    ...idleNoQuery,
    hasBackSnapshot: true,
    hasSearchResult: true,
    hasSavedQueryId: true,
  }),
  "restore_snapshot"
);

/* Pravi Nazaj: URL izgubi ?query= — tudi ob stuck pending */
assert.equal(
  decideZavarovalnicaNoQueryAction({
    ...idleNoQuery,
    leftResultsUrl: true,
    hasBackSnapshot: true,
    hasSearchResult: true,
    hasSavedQueryId: true,
    pendingResultNavigation: true,
    localSubmitLocked: true,
  }),
  "restore_snapshot",
  "Nazaj mora obnoviti obrazec tudi če pending ni počiščen"
);

/* Po Nazaj: cache za Naprej — ne clear_stale */
assert.equal(
  decideZavarovalnicaNoQueryAction({
    ...idleNoQuery,
    hasSearchResult: true,
    hasSavedQueryId: true,
    hasCachedResultAfterBack: true,
  }),
  "noop",
  "cache po Nazaj ne sme biti pobrisan (Naprej brez nove poizvedbe)"
);

/* Napaka pomožnega nalaganja (brez rezultata, brez snap) → ne clear */
assert.equal(decideZavarovalnicaNoQueryAction(idleNoQuery), "noop");

/* Stale result brez snap (npr. tuj state) → clear */
assert.equal(
  decideZavarovalnicaNoQueryAction({
    ...idleNoQuery,
    hasSearchResult: true,
  }),
  "clear_stale_result"
);

console.log("verify-zavarovalnica-first-query: OK");
