import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useStrelko } from "../context/StrelkoContext";
import type { GeocodeResult } from "../types";
import {
  queryCostHintMessage,
  querySubmitButtonLabel,
} from "../lib/query-billing";
import { clampSearchRange, queryTokenCost } from "../lib/search-dates";
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
    locationQuery,
    setLocationQuery,
    selected,
    selectPlace,
    suggestions,
    fetchSuggestions,
    loading,
    preview,
    previewScreen,
    runPreview,
    openAuth,
    clearSearch,
  } = useStrelko();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const locationFieldRef = useRef<HTMLDivElement>(null);

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

  const onInput = (value: string) => {
    setLocationQuery(value);
    if (selected && selected.label.trim() !== value.trim()) selectPlace(null);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => void fetchSuggestions(value), 400);
    setShowSuggestions(true);
  };

  const pickSuggestion = (s: GeocodeResult) => {
    selectPlace(s);
    setLocationQuery(s.label);
    setShowSuggestions(false);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runPreview();
  };

  const overlayActive = (loading || (preview && showOverlay)) && !previewScreen;

  const searchRange = useMemo(
    () => clampSearchRange({ from: searchDateFrom, to: searchDateTo }),
    [searchDateFrom, searchDateTo]
  );
  const queryCost = showOptions ? queryTokenCost(searchRange.from, searchRange.to) : 0;
  const availableTokens = credits?.credits_balance ?? 0;
  const costHint =
    showOptions && user && queryCost > 0
      ? queryCostHintMessage(queryCost, availableTokens)
      : null;
  const submitLabel = querySubmitButtonLabel(
    queryCost,
    availableTokens,
    Boolean(user),
    buttonText
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
            onFocus={() => suggestions.length && setShowSuggestions(true)}
          />
          <ul className={`suggestions${showSuggestions && suggestions.length ? "" : " hidden"}`}>
            {suggestions.map((s: GeocodeResult) => (
              <li key={`${s.lat}-${s.lon}`}>
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
