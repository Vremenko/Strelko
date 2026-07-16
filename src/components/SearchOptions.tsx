import { useRef } from "react";
import { useStrelko } from "../context/StrelkoContext";
import { openSearchDatePicker } from "../lib/search-date-picker";
import {
  SEARCH_ARCHIVE_MIN_ISO,
  SEARCH_RADIUS_OPTIONS,
  adjustRangeFromEnd,
  adjustRangeFromStart,
  formatSearchDateLabel,
  maxEndDateForStart,
  searchPeriodHint,
  todayIso,
  validateSearchPeriod,
} from "../lib/search-dates";

interface SearchOptionsProps {
  disabled?: boolean;
}

function SearchDateCalendarIcon() {
  return (
    <span className="search-date-icon" aria-hidden="true">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" focusable="false">
        <rect
          x="3"
          y="4"
          width="18"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
        <path
          d="M8 2v4M16 2v4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function SearchOptions({ disabled = false }: SearchOptionsProps) {
  const {
    searchRadiusKm,
    searchDateFrom,
    searchDateTo,
    setSearchRadiusKm,
    setSearchDateRange,
    loading,
  } = useStrelko();

  const busy = disabled || loading;
  const today = todayIso();
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  const fromMin = SEARCH_ARCHIVE_MIN_ISO;
  const fromMax = today;
  const toMin = searchDateFrom;
  const toMax = maxEndDateForStart(searchDateFrom, today);
  const periodError = validateSearchPeriod(searchDateFrom, searchDateTo, today);

  const onRadiusChange = (value: string) => {
    setSearchRadiusKm(Number(value));
  };

  const onFromChange = (value: string) => {
    if (!value) return;
    setSearchDateRange(adjustRangeFromStart(value, searchDateTo, today));
  };

  const onToChange = (value: string) => {
    if (!value) return;
    setSearchDateRange(adjustRangeFromEnd(value, searchDateFrom, today));
  };

  return (
    <div className="search-options" id="search-options">
      <div className="search-options-row search-options-row--radius">
        <label className="search-option search-option--radius field-labeled">
          <span>Radij</span>
          <select
            id="search-radius-km"
            value={searchRadiusKm}
            disabled={busy}
            onChange={(e) => onRadiusChange(e.target.value)}
          >
            {SEARCH_RADIUS_OPTIONS.map((km) => (
              <option key={km} value={km}>
                {km} km
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="search-options-row">
        <label className="search-option field-labeled">
          <span>Od</span>
          <div className="search-date-wrap">
            <span className="search-date-label" id="search-date-from-label">
              {formatSearchDateLabel(searchDateFrom)}
            </span>
            <SearchDateCalendarIcon />
            <input
              ref={fromRef}
              id="search-date-from"
              className="search-date-input search-date-input--picker"
              type="date"
              value={searchDateFrom}
              min={fromMin}
              max={fromMax}
              disabled={busy}
              onClick={(event) =>
                openSearchDatePicker(fromRef.current, event)
              }
              onChange={(e) => onFromChange(e.target.value)}
              onInput={(e) => onFromChange((e.target as HTMLInputElement).value)}
            />
          </div>
        </label>
        <label className="search-option field-labeled">
          <span>Do</span>
          <div className="search-date-wrap">
            <span className="search-date-label" id="search-date-to-label">
              {formatSearchDateLabel(searchDateTo)}
            </span>
            <SearchDateCalendarIcon />
            <input
              ref={toRef}
              id="search-date-to"
              className="search-date-input search-date-input--picker"
              type="date"
              value={searchDateTo}
              min={toMin}
              max={toMax}
              disabled={busy}
              onClick={(event) =>
                openSearchDatePicker(toRef.current, event)
              }
              onChange={(e) => onToChange(e.target.value)}
              onInput={(e) => onToChange((e.target as HTMLInputElement).value)}
            />
          </div>
        </label>
      </div>
      {periodError ? (
        <p className="search-options-error" role="alert">
          {periodError}
        </p>
      ) : (
        <p className="search-options-hint">{searchPeriodHint()}</p>
      )}
    </div>
  );
}
