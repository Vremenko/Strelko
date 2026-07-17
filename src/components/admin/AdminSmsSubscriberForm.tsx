import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { adminApi } from "../../api/client";
import { geocodeSuggest, isValidGeocodePlace } from "../../lib/geocode";
import { formatMapCoordinate } from "../../lib/pick-location-map";
import type { GeocodeResult } from "../../types";
import { IconLatitude, IconLongitude, IconMap } from "../icons";
import { LocationPickerModal, type MapPickerView } from "../LocationPickerModal";

const SLOVENIA_CENTER = { lat: 46.1512, lon: 14.9955 };
const SLOVENIA_ZOOM = 8;
const MAP_PICKER_EMPTY_LABEL = "Izbrana lokacija na zemljevidu";

export type AdminSmsSubscriberFormData = {
  user_email: string;
  alert_phone: string;
  saved_label: string | null;
  saved_lat: number;
  saved_lon: number;
  alert_radius_km: number;
};

type Props = {
  busy: boolean;
  onSubmit: (data: AdminSmsSubscriberFormData) => Promise<void>;
};

async function resolveMapPickerView(
  place: GeocodeResult | null,
  query: string
): Promise<MapPickerView> {
  if (place && isValidGeocodePlace(place)) {
    return {
      center: { lat: place.lat, lon: place.lon },
      zoom: 16,
      marker: { lat: place.lat, lon: place.lon },
    };
  }
  const trimmed = query.trim();
  if (trimmed.length >= 3) {
    const suggestions = await geocodeSuggest(trimmed);
    const first = suggestions[0];
    if (first) {
      return {
        center: { lat: first.lat, lon: first.lon },
        zoom: 14,
        marker: null,
      };
    }
  }
  return { center: SLOVENIA_CENTER, zoom: SLOVENIA_ZOOM, marker: null };
}

export function AdminSmsSubscriberForm({ busy, onSubmit }: Props) {
  const [formError, setFormError] = useState<string | null>(null);

  const [emailQuery, setEmailQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [emailSuggestions, setEmailSuggestions] = useState<{ id: number; email: string }[]>([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [activeEmailIdx, setActiveEmailIdx] = useState(-1);
  const emailSeqRef = useRef(0);

  const [phone, setPhone] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<GeocodeResult | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<GeocodeResult[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [activeLocationIdx, setActiveLocationIdx] = useState(-1);
  const locationSeqRef = useRef(0);

  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [radius, setRadius] = useState(20);

  const [mapOpen, setMapOpen] = useState(false);
  const [mapView, setMapView] = useState<MapPickerView | null>(null);
  const [showCoords, setShowCoords] = useState(false);

  const locationFromMap = Boolean(selectedPlace?.fromMap);

  useEffect(() => {
    const trimmed = emailQuery.trim();
    if (trimmed.length < 2) {
      setEmailSuggestions([]);
      setShowEmailSuggestions(false);
      return;
    }
    if (selectedEmail && trimmed.toLowerCase() === selectedEmail.toLowerCase()) {
      setShowEmailSuggestions(false);
      return;
    }

    const seq = ++emailSeqRef.current;
    const timer = window.setTimeout(async () => {
      try {
        const res = await adminApi.userSuggest(trimmed);
        if (seq !== emailSeqRef.current) return;
        setEmailSuggestions(res.items);
        setShowEmailSuggestions(res.items.length > 0);
        setActiveEmailIdx(-1);
      } catch {
        if (seq !== emailSeqRef.current) return;
        setEmailSuggestions([]);
        setShowEmailSuggestions(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [emailQuery, selectedEmail]);

  useEffect(() => {
    const trimmed = locationQuery.trim();
    if (trimmed.length < 3) {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
      return;
    }

    const seq = ++locationSeqRef.current;
    const timer = window.setTimeout(async () => {
      try {
        const results = await geocodeSuggest(trimmed);
        if (seq !== locationSeqRef.current) return;
        setLocationSuggestions(results);
        setShowLocationSuggestions(results.length > 0);
        setActiveLocationIdx(-1);
      } catch {
        if (seq !== locationSeqRef.current) return;
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [locationQuery]);

  const pickEmail = useCallback((email: string) => {
    setEmailQuery(email);
    setSelectedEmail(email);
    setShowEmailSuggestions(false);
    setActiveEmailIdx(-1);
  }, []);

  const pickPlace = useCallback((place: GeocodeResult) => {
    setSelectedPlace(place);
    setLocationQuery(place.label);
    setLat(String(place.lat));
    setLon(String(place.lon));
    setShowLocationSuggestions(false);
    setActiveLocationIdx(-1);
  }, []);

  const openMapPicker = useCallback(() => {
    setShowCoords(true);

    const latNum = Number(lat);
    const lonNum = Number(lon);
    const hasCoords = Number.isFinite(latNum) && Number.isFinite(lonNum);
    const marker =
      hasCoords
        ? { lat: latNum, lon: lonNum }
        : selectedPlace && isValidGeocodePlace(selectedPlace)
          ? { lat: selectedPlace.lat, lon: selectedPlace.lon }
          : null;

    setMapView({
      center: marker ?? SLOVENIA_CENTER,
      zoom: marker ? 16 : SLOVENIA_ZOOM,
      marker,
    });
    setMapOpen(true);

    void resolveMapPickerView(selectedPlace, locationQuery).then(setMapView);
  }, [lat, lon, locationQuery, selectedPlace]);

  const confirmMap = useCallback((mapLat: number, mapLon: number) => {
    const label = locationQuery.trim() || MAP_PICKER_EMPTY_LABEL;
    pickPlace({ label, lat: mapLat, lon: mapLon, fromMap: true });
    setMapOpen(false);
  }, [locationQuery, pickPlace]);

  const mapPickerView = useMemo(() => mapView, [mapView]);

  const onEmailKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showEmailSuggestions || !emailSuggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveEmailIdx((i) => Math.min(emailSuggestions.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveEmailIdx((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter" && activeEmailIdx >= 0) {
      event.preventDefault();
      const item = emailSuggestions[activeEmailIdx];
      if (item) pickEmail(item.email);
    } else if (event.key === "Escape") {
      setShowEmailSuggestions(false);
    }
  };

  const onLocationKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showLocationSuggestions || !locationSuggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveLocationIdx((i) => Math.min(locationSuggestions.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveLocationIdx((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter" && activeLocationIdx >= 0) {
      event.preventDefault();
      const item = locationSuggestions[activeLocationIdx];
      if (item) pickPlace(item);
    } else if (event.key === "Escape") {
      setShowLocationSuggestions(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const emailInput = emailQuery.trim().toLowerCase();
    if (!emailInput) {
      setFormError("Izberite uporabnika iz seznama (e-pošta iz baze).");
      return;
    }

    let email = selectedEmail?.toLowerCase() || emailInput;
    if (!selectedEmail || selectedEmail.toLowerCase() !== emailInput) {
      try {
        const verify = await adminApi.userSuggest(emailInput, 20);
        const exact = verify.items.find((x: { email: string }) => x.email.toLowerCase() === emailInput);
        if (!exact) {
          setFormError("Uporabnik mora biti iz baze — izberite e-pošto iz predlogov.");
          return;
        }
        email = exact.email.toLowerCase();
        setSelectedEmail(exact.email);
      } catch {
        setFormError("Preverjanje uporabnika ni uspelo.");
        return;
      }
    }

    if (!phone.trim()) {
      setFormError("Telefon je obvezen.");
      return;
    }

    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
      setFormError("Izberite kraj iz predlogov ali na zemljevidu (lat/lon).");
      return;
    }

    await onSubmit({
      user_email: email,
      alert_phone: phone.trim(),
      saved_label: locationQuery.trim() || selectedPlace?.label || null,
      saved_lat: latNum,
      saved_lon: lonNum,
      alert_radius_km: radius,
    });

    setEmailQuery("");
    setSelectedEmail(null);
    setPhone("");
    setLocationQuery("");
    setSelectedPlace(null);
    setLat("");
    setLon("");
    setRadius(20);
    setShowCoords(false);
  };

  return (
    <>
      <form className="admin-form admin-sms-subscriber-form" onSubmit={(e) => void handleSubmit(e)}>
        <label className="admin-autocomplete-field">
          E-pošta uporabnika (iz baze)
          <div className="location-field">
            <input
              type="email"
              value={emailQuery}
              autoComplete="off"
              placeholder="Začnite tipkati e-pošto …"
              disabled={busy}
              onChange={(e) => {
                setEmailQuery(e.target.value);
                setSelectedEmail(null);
              }}
              onFocus={() => {
                if (emailSuggestions.length) setShowEmailSuggestions(true);
              }}
              onBlur={() => {
                window.setTimeout(() => setShowEmailSuggestions(false), 150);
              }}
              onKeyDown={onEmailKeyDown}
            />
            <ul className={`suggestions${showEmailSuggestions && emailSuggestions.length ? "" : " hidden"}`}>
              {emailSuggestions.map((item, index) => (
                <li key={item.id} className={index === activeEmailIdx ? "active" : undefined}>
                  <button
                    type="button"
                    onPointerDown={(ev) => ev.preventDefault()}
                    onClick={() => pickEmail(item.email)}
                  >
                    {item.email}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {selectedEmail ? (
            <span className="admin-field-hint">Izbrano: {selectedEmail}</span>
          ) : null}
        </label>

        <label>
          Telefon
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+38640123456"
            required
            disabled={busy}
          />
        </label>

        <label className="admin-autocomplete-field">
          Kraj / naslov
          <div className="admin-location-row">
            <div className="location-field admin-location-field">
              <input
                type="text"
                value={locationQuery}
                autoComplete="off"
                placeholder="Vpišite kraj ali naslov …"
                disabled={busy}
                onChange={(e) => {
                  setLocationQuery(e.target.value);
                  setSelectedPlace(null);
                }}
                onFocus={() => {
                  if (locationSuggestions.length) setShowLocationSuggestions(true);
                }}
                onBlur={() => {
                  window.setTimeout(() => setShowLocationSuggestions(false), 150);
                }}
                onKeyDown={onLocationKeyDown}
              />
              <ul
                className={`suggestions${showLocationSuggestions && locationSuggestions.length ? "" : " hidden"}`}
              >
                {locationSuggestions.map((s, index) => (
                  <li
                    key={`${s.lat}-${s.lon}-${s.label}`}
                    className={index === activeLocationIdx ? "active" : undefined}
                  >
                    <button
                      type="button"
                      onPointerDown={(ev) => ev.preventDefault()}
                      onClick={() => pickPlace(s)}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              className={`btn btn-ghost admin-map-picker-btn${locationFromMap ? " admin-map-picker-btn--active" : ""}`}
              aria-expanded={showCoords}
              disabled={busy}
              onClick={openMapPicker}
            >
              <IconMap />
              Zemljevid
            </button>
          </div>
          {locationFromMap && selectedPlace && !showCoords ? (
            <div className="location-map-selected" role="status">
              <p className="location-map-selected-label">Lokacija iz zemljevida</p>
              <p className="location-map-coords">
                <span>Lat: {formatMapCoordinate(selectedPlace.lat)}</span>
                <span>Lon: {formatMapCoordinate(selectedPlace.lon)}</span>
              </p>
            </div>
          ) : null}
        </label>

        {showCoords ? (
          <div className="admin-form-coords">
            <label className="admin-coord-field">
              <span className="admin-coord-field__label">
                <IconLatitude />
                Lat
              </span>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="46.051"
                disabled={busy}
              />
            </label>
            <label className="admin-coord-field">
              <span className="admin-coord-field__label">
                <IconLongitude />
                Lon
              </span>
              <input
                type="number"
                step="any"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="14.505"
                disabled={busy}
              />
            </label>
          </div>
        ) : null}

        <label>
          Radij (km): {radius}
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            disabled={busy}
          />
        </label>

        {formError ? <p className="admin-panel__error">{formError}</p> : null}

        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Shranjujem …" : "Shrani naročnika"}
        </button>
      </form>

      <LocationPickerModal
        open={mapOpen}
        view={mapPickerView}
        onClose={() => setMapOpen(false)}
        onConfirm={confirmMap}
      />
    </>
  );
}
