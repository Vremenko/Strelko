/**
 * Preverjanje števca poizvedb na kartici (agregati, ne queries.length).
 * Zagon: npx tsx scripts/check-portal-query-totals.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

function queryCountLabel(count: number): string {
  if (count === 1) return "1 poizvedba";
  if (count === 2) return "2 poizvedbi";
  if (count >= 3 && count <= 4) return `${count} poizvedbe`;
  return `${count} poizvedb`;
}

assert.equal(queryCountLabel(1), "1 poizvedba");
assert.equal(queryCountLabel(2), "2 poizvedbi");
assert.equal(queryCountLabel(3), "3 poizvedbe");
assert.equal(queryCountLabel(5), "5 poizvedb");
assert.equal(queryCountLabel(51), "51 poizvedb");

const overview = readFileSync(join(root, "src/components/portal/PortalOverview.tsx"), "utf8");
assert.match(overview, /savedQueriesTotal/);
assert.match(overview, /savedQueriesCreditsSpent/);
assert.doesNotMatch(overview, /savedQueries\.length/);
assert.doesNotMatch(overview, /savedQueries\.reduce/);

const types = readFileSync(join(root, "src/types/index.ts"), "utf8");
assert.match(types, /total_queries\?:/);
assert.match(types, /total_credits_spent\?:/);

const ctx = readFileSync(join(root, "src/context/StrelkoContext.tsx"), "utf8");
assert.match(ctx, /res\.total_queries/);
assert.match(ctx, /res\.total_credits_spent/);

console.log("check-portal-query-totals: OK");
