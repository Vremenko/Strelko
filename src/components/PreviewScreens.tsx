import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useStrelko } from "../context/StrelkoContext";
import { portalTabPath } from "../lib/auth-intent";
import { isValidGeocodePlace } from "../lib/geocode";
import { tokenCountLabel } from "../lib/ob-skodi-tokens";
import { previewInsufficientTokensNotice, previewUnlockTokenRequirementMessage } from "../lib/query-billing";
import { clampSearchRange, queryTokenCost } from "../lib/search-dates";
import { resultLocationTitle } from "../lib/pick-location-map";
import { formatPlaceName } from "../lib/utils";
import type { InsufficientTokensDetail, QueryQuoteOut } from "../types";
import { ResultsPeriod, ResultsStats, formatResultsPeriodLabel } from "./ResultsSummary";

function LockedStatValue() {
  return (
    <span className="stat-value-locked" aria-label="Zaklenjeno">
      <span className="stat-value-locked__icon" aria-hidden="true">
        🔒
      </span>
    </span>
  );
}

const FAKE_ROWS = Array.from({ length: 6 }, (_, i) => (
  <tr key={i}>
    <td>●●●●-●●-●●</td>
    <td>●●</td>
    <td>●● km</td>
    <td>●●.●●</td>
  </tr>
));

const NO_STRIKES_METEO_ALARM_SUFFIX =
  /\s*Prijavite se za MeteoAlarm SMS ob nevihtah v vaši okolici\.?\s*$/;

const PREVIEW_UNLOCK_INTRO =
  "Za dostop do natančnih podatkov o strelah se prijavite in kupite žetone. Z odklepom pridobite celoten pregled izbranega območja in obdobja.";

const PREVIEW_UNLOCK_PERKS = [
  "Interaktivni zemljevid vseh zaznanih udarov strel",
  "Datum, natančen čas in oddaljenost vsake strele",
  "Dnevni pregled aktivnosti strel",
  "Izdelava PDF-poročila za zavarovalnico",
] as const;

const PREVIEW_BASIC_HINT =
  "Datumi, natančen čas in lokacije posameznih udarov niso prikazani v osnovnem predogledu.";

function previewNoStrikesLead(message: string): string {
  return message.replace(NO_STRIKES_METEO_ALARM_SUFFIX, "").trim();
}

function PreviewUnlockBackdrop() {
  return (
    <div className="preview-blur-content" aria-hidden="true">
      <div className="preview-fake-map">
        <span className="preview-fake-pin" style={{ left: "22%", top: "35%" }} />
        <span className="preview-fake-pin" style={{ left: "58%", top: "48%" }} />
        <span className="preview-fake-pin" style={{ left: "41%", top: "62%" }} />
        <span className="preview-fake-radius" />
      </div>
      <table className="daily-table preview-fake-table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Št. strel</th>
            <th>Najbližje</th>
            <th>Čas</th>
          </tr>
        </thead>
        <tbody>{FAKE_ROWS}</tbody>
      </table>
    </div>
  );
}

function previewUnlockButtonLabel(requiredTokens: number, quote: QueryQuoteOut | null): string {
  if (quote && quote.query_tokens_cost === 0) {
    return quote.query_button_label || "Odkleni pregled";
  }
  if (requiredTokens > 0) {
    return `Odkleni pregled – ${tokenCountLabel(requiredTokens, "accusative")}`;
  }
  return "Odkleni pregled";
}

function usePreviewUnlockQuote(
  loggedIn: boolean,
  tokenNotice: InsufficientTokensDetail | null
) {
  const { selected, searchRadiusKm, searchDateFrom, searchDateTo, credits } = useStrelko();
  const [quote, setQuote] = useState<QueryQuoteOut | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => {
    if (!loggedIn || !isValidGeocodePlace(selected)) {
      setQuote(null);
      setQuoteLoading(false);
      return;
    }

    let cancelled = false;
    setQuoteLoading(true);
    const searchRange = clampSearchRange({
      from: searchDateFrom,
      to: searchDateTo,
    });

    void (async () => {
      try {
        const nextQuote = await api.queryQuote({
          lat: selected.lat,
          lon: selected.lon,
          radius_km: searchRadiusKm,
          date_from: searchRange.from,
          date_to: searchRange.to,
        });
        if (!cancelled) setQuote(nextQuote);
      } catch {
        if (!cancelled) setQuote(null);
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loggedIn, selected, searchRadiusKm, searchDateFrom, searchDateTo]);

  const availableTokens =
    tokenNotice?.available_tokens ?? credits?.credits_balance ?? quote?.token_balance ?? 0;
  const requiredTokens = tokenNotice?.required_tokens ?? quote?.query_tokens_cost ?? 0;
  const canUnlock = loggedIn && requiredTokens >= 0 && availableTokens >= requiredTokens;
  const needsTokens = loggedIn && requiredTokens > 0 && availableTokens < requiredTokens;

  return {
    quote,
    quoteLoading,
    availableTokens,
    requiredTokens,
    canUnlock,
    needsTokens,
  };
}

function PreviewUnlockBlock({
  openAuth,
  onUnlock,
  unlockBusy,
}: {
  openAuth: (mode: "login" | "register") => void;
  onUnlock: () => void;
  unlockBusy: boolean;
}) {
  const { user, previewTokenNotice, searchDateFrom, searchDateTo } = useStrelko();
  const loggedIn = Boolean(user);
  const { quote, quoteLoading, requiredTokens, canUnlock, needsTokens, availableTokens } =
    usePreviewUnlockQuote(loggedIn, previewTokenNotice);
  const searchRange = clampSearchRange({
    from: searchDateFrom,
    to: searchDateTo,
  });
  const periodTokenCost = queryTokenCost(searchRange.from, searchRange.to);
  const unlockTokenCost =
    loggedIn && !quoteLoading && requiredTokens > 0 ? requiredTokens : periodTokenCost;

  let notice: ReactNode = null;
  let actions: ReactNode = null;

  if (!loggedIn) {
    actions = (
      <div className="preview-blur-actions">
        <button type="button" className="btn btn-primary" onClick={() => openAuth("login")}>
          Prijava
        </button>
        <Link to="/cenik" className="btn btn-ghost">
          Cenik
        </Link>
      </div>
    );
  } else if (needsTokens) {
    notice = (
      <p className="preview-blur-notice" role="status">
        {previewInsufficientTokensNotice(requiredTokens, availableTokens)}
      </p>
    );
    actions = (
      <div className="preview-blur-actions">
        <Link to={portalTabPath("narocnina")} className="btn btn-primary">
          Kupi žetone
        </Link>
        <Link to="/cenik" className="btn btn-ghost">
          Cenik
        </Link>
      </div>
    );
  } else if (canUnlock) {
    actions = (
      <div className="preview-blur-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={unlockBusy || quoteLoading}
          onClick={onUnlock}
        >
          {quoteLoading ? "Preračunavam ceno …" : previewUnlockButtonLabel(requiredTokens, quote)}
        </button>
        <Link to="/cenik" className="btn btn-ghost">
          Cenik
        </Link>
      </div>
    );
  } else {
    actions = (
      <div className="preview-blur-actions">
        <Link to={portalTabPath("narocnina")} className="btn btn-primary">
          Kupi žetone
        </Link>
        <Link to="/cenik" className="btn btn-ghost">
          Cenik
        </Link>
      </div>
    );
  }

  return (
    <div className="preview-blur-block">
      <PreviewUnlockBackdrop />
      <div className="preview-blur-cta">
        <h4>Odklenite celoten pregled</h4>
        {unlockTokenCost > 0 ? (
          <p className="preview-blur-token-cost">
            {previewUnlockTokenRequirementMessage(unlockTokenCost)}
          </p>
        ) : null}
        <p>{PREVIEW_UNLOCK_INTRO}</p>
        <ul className="preview-blur-perks">
          {PREVIEW_UNLOCK_PERKS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {notice}
        {actions}
      </div>
    </div>
  );
}

export function PreviewTeaser() {
  const {
    preview,
    selected,
    searchRadiusKm,
    openAuth,
    clearSearch,
    runFullSearch,
    loading,
  } = useStrelko();
  if (!preview) return null;

  const place = resultLocationTitle(
    selected?.fromMap,
    selected?.lat ?? 0,
    selected?.lon ?? 0,
    preview.location_label || formatPlaceName(selected?.label)
  );
  const periodLabel = formatResultsPeriodLabel(searchRadiusKm, preview);

  return (
    <section className="results-panel preview-teaser">
      <p className="preview-teaser-badge">Osnovni predogled</p>
      <h3 className="results-panel-title">⚡ Strele zaznane — {place}</h3>
      <ResultsPeriod label={periodLabel} />
      <ResultsStats
        items={[
          { label: "Št. strel", value: preview.total_strikes ?? 0 },
          { label: "Št. dni s strelami", value: preview.days_with_strikes ?? 0 },
          { label: "Najbližja strela", value: <LockedStatValue /> },
        ]}
      />
      <PreviewUnlockBlock
        openAuth={openAuth}
        onUnlock={() => void runFullSearch()}
        unlockBusy={loading}
      />
      <button type="button" className="btn btn-ghost preview-teaser-back" onClick={clearSearch}>
        Nova poizvedba
      </button>
    </section>
  );
}

export function PreviewNoStrikes() {
  const {
    preview,
    selected,
    searchRadiusKm,
    openAuth,
    clearSearch,
    runFullSearch,
    loading,
  } = useStrelko();
  if (!preview) return null;

  const place = resultLocationTitle(
    selected?.fromMap,
    selected?.lat ?? 0,
    selected?.lon ?? 0,
    preview.location_label || formatPlaceName(selected?.label)
  );
  const periodLabel = formatResultsPeriodLabel(searchRadiusKm, preview);

  return (
    <section className="results-panel preview-teaser preview-no-strikes">
      <p className="preview-teaser-badge preview-teaser-badge--ok">Brez udarov v radiju</p>
      <h3 className="results-panel-title">✓ Brez strel — {place}</h3>
      <p className="preview-teaser-lead">{previewNoStrikesLead(preview.message_sl)}</p>
      <ResultsPeriod label={periodLabel} />
      <ResultsStats
        items={[
          { label: "Št. strel", value: 0 },
          { label: "Št. dni s strelami", value: 0 },
          { label: "Najbližja strela", value: "—" },
        ]}
      />
      <p className="preview-teaser-hint">{PREVIEW_BASIC_HINT}</p>
      <PreviewUnlockBlock
        openAuth={openAuth}
        onUnlock={() => void runFullSearch()}
        unlockBusy={loading}
      />
      <button type="button" className="btn btn-ghost preview-teaser-back" onClick={clearSearch}>
        Nova poizvedba
      </button>
    </section>
  );
}
