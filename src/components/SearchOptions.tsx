import { useRef } from "react";
import { useStrelko } from "../context/StrelkoContext";
import { openSearchDatePicker } from "../lib/search-date-picker";
import {
  SEARCH_RADIUS_OPTIONS,
  formatSearchDateLabel,
  rangeFromEnd,
  rangeFromStart,
  todayIso,
} from "../lib/search-dates";

interface SearchOptionsProps {
  disabled?: boolean;
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

  const onRadiusChange = (value: string) => {
    setSearchRadiusKm(Number(value));
  };

  const onFromChange = (value: string) => {
    if (!value) return;
    setSearchDateRange(rangeFromStart(value));
  };

  const onToChange = (value: string) => {
    if (!value) return;
    setSearchDateRange(rangeFromEnd(value));
  };

  return (
    <div className="search-options" id="search-options">
      <div className="search-options-row search-options-row--radius">
        <label className="search-option search-option--radius">
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
        <label className="search-option">
          <span>Od</span>
          <div
            className="search-date-wrap"
            onClick={(e) => openSearchDatePicker(fromRef.current, e)}
          >
            <span className="search-date-label" id="search-date-from-label">
              {formatSearchDateLabel(searchDateFrom)}
            </span>
            <input
              ref={fromRef}
              id="search-date-from"
              className="search-date-input search-date-input--picker"
              type="date"
              value={searchDateFrom}
              max={today}
              disabled={busy}
              onChange={(e) => onFromChange(e.target.value)}
              onInput={(e) => onFromChange((e.target as HTMLInputElement).value)}
            />
          </div>
        </label>
        <label className="search-option">
          <span>Do</span>
          <div
            className="search-date-wrap"
            onClick={(e) => openSearchDatePicker(toRef.current, e)}
          >
            <span className="search-date-label" id="search-date-to-label">
              {formatSearchDateLabel(searchDateTo)}
            </span>
            <input
              ref={toRef}
              id="search-date-to"
              className="search-date-input search-date-input--picker"
              type="date"
              value={searchDateTo}
              max={today}
              disabled={busy}
              onChange={(e) => onToChange(e.target.value)}
              onInput={(e) => onToChange((e.target as HTMLInputElement).value)}
            />
          </div>
        </label>
      </div>
      <p className="search-options-hint">
        14-dnevno obdobje — spremenite začetek ali konec, drug datum se nastavi samodejno.
      </p>
    </div>
  );
}
