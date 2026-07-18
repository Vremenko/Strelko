/**
 * Preverjanje logike admin statusov / iskanja (brez Vitest).
 * Zagon: npx tsx scripts/check-admin-invoice-pipeline.ts
 */
import {
  buildInvoicePipeline,
  invoiceActionAvailability,
  invoiceEmailSearchShouldFetch,
} from "../src/lib/adminInvoicePipeline";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const complete = buildInvoicePipeline({
  id: 1,
  invoice_number: "STRELKO-WEB1-1",
  furs_status: "fiscalized",
  has_pdf: true,
  email_sent_at: "2026-07-18T10:00:00Z",
  buyer_email: "a@b.si",
});
assert(complete.every((s) => s.state === "ok"), "kompletni račun: vsi koraki ok");

const missing = buildInvoicePipeline({ missing_invoice: true });
assert(missing[0].state === "ok", "plačilo ok");
assert(missing[1].state === "waiting", "račun čaka");
assert(invoiceActionAvailability({ missing_invoice: true }).issue_missing, "issue_missing");
assert(!invoiceActionAvailability({ missing_invoice: true }).retry_furs, "no furs");

const failedFurs = invoiceActionAvailability({
  id: 2,
  furs_status: "failed",
  has_pdf: true,
  buyer_email: "a@b.si",
});
assert(failedFurs.retry_furs, "retry furs");
assert(failedFurs.open_pdf, "open pdf");
assert(failedFurs.resend_email, "resend");

const noPdf = invoiceActionAvailability({
  id: 3,
  furs_status: "fiscalized",
  has_pdf: false,
  buyer_email: "a@b.si",
});
assert(noPdf.regenerate_pdf, "regen pdf");
assert(!noPdf.resend_email, "no resend without pdf");
assert(!noPdf.open_pdf, "no open without pdf");

assert(invoiceEmailSearchShouldFetch("a@", "a@") === true, "enako → fetch ok");
assert(invoiceEmailSearchShouldFetch("", "a") === false, "tipkanje ne sproži fetch");

console.log("check-admin-invoice-pipeline: OK");
