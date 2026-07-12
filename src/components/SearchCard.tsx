import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useStrelko } from "../context/StrelkoContext";
import type { GeocodeResult, QueryQuoteOut } from "../types";
import { isSameSuggestBase, isValidGeocodePlace } from "../lib/geocode";
import {
  queryCostHintFromQuote,
  querySubmitButtonLabelFromQuote,
} from "../lib/query-billing";
import { clampSearchRange } from "../lib/search-dates";
import { api } from "../api/client";
import { SearchScanBolt } from "./icons";
import { SearchOptions } from "./SearchOptions";

interface SearchCardProps {
  busy?: boolean;
  label?: string;
  placeholder?: string;
  buttonText?: string;
  showOverlay?: boolean;
  showOptions?: boolean;
  inline?: boolean;
  title?: string;
  intro?: string;
}

export function SearchCard({
  busy: _busy = false,
  label = "Vnesite naslov ali kraj (Slovenija in okolica)",
  placeholder = "npr. Celje, Slovenska 1",
  buttonText = "Preveri",
  showOverlay = true,
  showOptions = false,
  inline = false,
  title,
  intro,
}: SearchCardProps) {
  const {
    user,
    credits,
    searchDateFrom,
    searchDateTo,
    searchRadiusKm,
    locationQuery,
    setLocationQuery,
    selected,
    selectPlace,
    suggestions,
    fetchSuggestions,
    cancelSuggestions,
    loading,
    preview,
    previewScreen,
    runPreview,
    openAuth,
    clearSearch,
  } = useStrelko();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [queryQuote, setQueryQuote] = useState<QueryQuoteOut | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const quoteDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const quoteRequestSeq = useRef(0);
  const locationFieldRef = useRef<HTMLDivElement>(null);
  const previousInputRef = useRef(locationQuery);

  useEffect(() => {
    setActiveSuggestion(-1);
  }, [suggestions, locationQuery]);

  useEffect(() => {
    const trimmed = locationQuery.trim();
    if (trimmed.length >= 3 && suggestions.length > 0) {
      setShowSuggestions(true);
    } else if (suggestions.length === 0) {
      setShowSuggestions(false);
    }
  }, [suggestions, locationQuery]);

  useEffect(() => {
    if (!showSuggestions) return;

    const onPointerDown = (event: PointerEvent) => {
      const root = locationFieldRef.current;
      if (!root || root.contains(event.target as Node)) return;
      setShowSuggestions(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowSuggestions(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showSuggestions]);

  const searchRange = useMemo(
    () => clampSearchRange({ from: searchDateFrom, to: searchDateTo }),
    [searchDateFrom, searchDateTo]
  );

  useEffect(() => {
    clearTimeout(quoteDebounce.current);
    if (!showOptions || !user || !isValidGeocodePlace(selected)) {
      quoteRequestSeq.current += 1;
      setQueryQuote(null);
      setQuoteLoading(false);
      return;
    }

    const requestId = ++quoteRequestSeq.current;
    setQueryQuote(null);
    setQuoteLoading(true);
    quoteDebounce.current = setTimeout(() => {
      void (async () => {
        try {
          const quote = await api.queryQuote({
            lat: selected.lat,
            lon: selected.lon,
            radius_km: searchRadiusKm,
            date_from: searchRange.from,
            date_to: searchRange.to,
          });
          if (requestId !== quoteRequestSeq.current) return;
          setQueryQuote(quote);
        } catch {
          if (requestId !== quoteRequestSeq.current) return;
          setQueryQuote(null);
        } finally {
          if (requestId === quoteRequestSeq.current) {
            setQuoteLoading(false);
          }
        }
      })();
    }, 250);

    return () => clearTimeout(quoteDebounce.current);
  }, [
    showOptions,
    user,
    selected,
    searchRadiusKm,
    searchRange.from,
    searchRange.to,
  ]);

  const onInput = (value: string) => {
    const previousValue = previousInputRef.current;
    previousInputRef.current = value;
    setLocationQuery(value);
    if (selected && selected.label.trim() !== value.trim()) selectPlace(null);
    clearTimeout(debounce.current);

    const trimmed = value.trim();
    if (trimmed.length < 3) {
      cancelSuggestions();
      setShowSuggestions(false);
      setActiveSuggestion(-1);
      return;
    }

    const baseChanged = !isSameSuggestBase(previousValue, value);
    if (baseChanged) {
      cancelSuggestions();
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }

    debounce.current = setTimeout(() => {
      void fetchSuggestions(value, { sticky: !baseChanged });
    }, 250);
  };

  const pickSuggestion = (s: GeocodeResult) => {
    clearTimeout(debounce.current);
    cancelSuggestions();
    selectPlace(s);
    setLocationQuery(s.label);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const onLocationKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
      return;
    }

    const listOpen = showSuggestions && suggestions.length > 0;
    if (!listOpen) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestion((index) => Math.min(suggestions.length - 1, index + 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestion((index) => Math.max(0, index - 1));
      return;
    }

    if (event.key === "Enter" && activeSuggestion >= 0) {
      event.preventDefault();
      const picked = suggestions[activeSuggestion];
      if (picked) pickSuggestion(picked);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runPreview();
  };

  const overlayActive = (loading || (preview && showOverlay)) && !previewScreen;

  const availableTokens = credits?.credits_balance ?? queryQuote?.token_balance ?? 0;
  const quoteReady = Boolean(user && showOptions && !quoteLoading && queryQuote);
  const costHint =
    quoteReady ? queryCostHintFromQuote(queryQuote, availableTokens) : null;
  const submitLabel = querySubmitButtonLabelFromQuote(
    queryQuote,
    availableTokens,
    Boolean(user),
    buttonText,
    buttonText,
    quoteReady
  );

  return (
    <div
      className={`search-card${inline ? " search-card--inline" : ""}${overlayActive ? " search-card--busy" : ""}`}
    >
      {showOverlay && overlayActive && (
        <div
          className={`search-overlay${preview && !loading ? " search-overlay--result is-active" : " is-active"}`}
          role={loading ? "status" : "region"}
          aria-live="polite"
        >
          {loading ? (
            <div className="search-scanning">
              <SearchScanBolt />
              <p className="search-scan-title">Iskanje strel</p>
              <p className="search-scan-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </p>
            </div>
          ) : preview ? (
            <div className={`search-overlay-result alert-card ${preview.has_nearby_strikes ? "warn" : "ok"}`}>
              <h3>
                {preview.has_nearby_strikes
                  ? "⚡ Strele zaznane v bližini"
                  : "✓ Brez udarov v radiju"}
              </h3>
              <p className="search-overlay-msg">{preview.message_sl}</p>
              <div className="search-overlay-actions">
                {preview.requires_login && (
                  <button type="button" className="btn btn-primary" onClick={() => openAuth("login")}>
                    Prijavite se za podrobnosti
                  </button>
                )}
                <button type="button" className="btn btn-ghost" onClick={clearSearch}>
                  Zahtevajte novo lokacijo
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
      <form className="search-card-body" onSubmit={onSubmit}>
        {title && <h3 className="search-card-title">{title}</h3>}
        {intro && <p className="search-card-intro">{intro}</p>}
        {!title && <label htmlFor="location-input">{label}</label>}
        {title && (
          <label className="visually-hidden" htmlFor="location-input">
            {label}
          </label>
        )}
        <div className="location-field" ref={locationFieldRef}>
          <input
            id="location-input"
            className="search-input"
            type="text"
            placeholder={placeholder}
            autoComplete="off"
            value={locationQuery}
            disabled={loading}
            onChange={(e) => onInput(e.target.value)}
            onKeyDown={onLocationKeyDown}
            onFocus={() => {
              if (locationQuery.trim().length >= 3 && suggestions.length) {
                setShowSuggestions(true);
              }
            }}
          />
          <ul className={`suggestions${showSuggestions && suggestions.length ? "" : " hidden"}`}>
            {suggestions.map((s: GeocodeResult, index) => (
              <li key={`${s.lat}-${s.lon}-${s.label}`} className={index === activeSuggestion ? "active" : undefined}>
                <button
                  type="button"
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => pickSuggestion(s)}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {showOptions && <SearchOptions />}
        {costHint && (
          <p className="search-cost-hint" role="status">
            {costHint}
          </p>
        )}
        <button
          type="submit"
          className="btn btn-primary btn-search-full"
          id="btn-search"
          disabled={loading}
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
