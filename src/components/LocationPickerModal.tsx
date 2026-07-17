import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { createPickLocationMap, formatMapCoordinate } from "../lib/pick-location-map";

export interface MapPickerView {
  center: { lat: number; lon: number };
  zoom: number;
  marker: { lat: number; lon: number } | null;
}

interface LocationPickerModalProps {
  open: boolean;
  view: MapPickerView | null;
  anchorRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  onConfirm: (lat: number, lon: number) => void;
}

type GeolocationState = "idle" | "loading" | "error";

const DESKTOP_ANCHOR_MIN_WIDTH = 768;
const VIEWPORT_MARGIN_PX = 16;

const GEO_ERROR_GENERIC =
  "Lokacije ni bilo mogoče pridobiti. Točko lahko izberete ročno.";
const GEO_ERROR_DENIED = "Dostop do lokacije ni dovoljen.";

export function LocationPickerModal({
  open,
  view,
  anchorRef,
  onClose,
  onConfirm,
}: LocationPickerModalProps) {
  const mapHostRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const mapHandleRef = useRef<ReturnType<typeof createPickLocationMap> | null>(null);
  const [picked, setPicked] = useState<{ lat: number; lon: number } | null>(null);
  const [geolocationState, setGeolocationState] = useState<GeolocationState>("idle");
  const [geoErrorMessage, setGeoErrorMessage] = useState(GEO_ERROR_GENERIC);

  useEffect(() => {
    if (!open) {
      setPicked(null);
      setGeolocationState("idle");
      setGeoErrorMessage(GEO_ERROR_GENERIC);
      mapHandleRef.current = null;
      return;
    }

    if (view?.marker) {
      setPicked(view.marker);
    } else {
      setPicked(null);
    }
    setGeolocationState("idle");
    setGeoErrorMessage(GEO_ERROR_GENERIC);
  }, [open, view]);

  useLayoutEffect(() => {
    if (!open || !view) return;

    let handle: ReturnType<typeof createPickLocationMap> | null = null;
    let cancelled = false;
    let rafId = 0;

    const mountMap = () => {
      if (cancelled || !mapHostRef.current) return false;

      handle?.destroy();
      handle = createPickLocationMap(
        mapHostRef.current,
        view.center,
        view.zoom,
        view.marker,
        (lat, lon) => setPicked({ lat, lon })
      );
      mapHandleRef.current = handle;
      return true;
    };

    if (!mountMap()) {
      rafId = window.requestAnimationFrame(() => {
        if (!mountMap()) {
          rafId = window.requestAnimationFrame(mountMap);
        }
      });
    }

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      handle?.destroy();
      if (mapHandleRef.current === handle) {
        mapHandleRef.current = null;
      }
    };
  }, [open, view]);

  useLayoutEffect(() => {
    if (!open || !modalRef.current) return;

    const modal = modalRef.current;

    const clearAnchoredPosition = () => {
      modal.classList.remove("location-picker-modal--anchored");
      modal.style.left = "";
      modal.style.top = "";
    };

    const positionModal = () => {
      if (window.innerWidth < DESKTOP_ANCHOR_MIN_WIDTH) {
        clearAnchoredPosition();
        return;
      }

      const anchor = anchorRef?.current;
      if (!anchor) {
        clearAnchoredPosition();
        return;
      }

      const anchorRect = anchor.getBoundingClientRect();
      const modalWidth = modal.offsetWidth;
      const modalHeight = modal.offsetHeight;

      let left = anchorRect.left + (anchorRect.width - modalWidth) / 2;
      let top = anchorRect.top + (anchorRect.height - modalHeight) / 2;

      left = Math.max(
        VIEWPORT_MARGIN_PX,
        Math.min(left, window.innerWidth - modalWidth - VIEWPORT_MARGIN_PX)
      );
      top = Math.max(
        VIEWPORT_MARGIN_PX,
        Math.min(top, window.innerHeight - modalHeight - VIEWPORT_MARGIN_PX)
      );

      modal.classList.add("location-picker-modal--anchored");
      modal.style.left = `${left}px`;
      modal.style.top = `${top}px`;
    };

    positionModal();

    const resizeObserver =
      anchorRef?.current && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(positionModal)
        : null;
    if (anchorRef?.current && resizeObserver) {
      resizeObserver.observe(anchorRef.current);
    }

    window.addEventListener("resize", positionModal);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", positionModal);
      clearAnchoredPosition();
    };
  }, [open, anchorRef, view]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoErrorMessage(GEO_ERROR_GENERIC);
      setGeolocationState("error");
      return;
    }

    setGeoErrorMessage(GEO_ERROR_GENERIC);
    setGeolocationState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const handle = mapHandleRef.current;
        if (handle) {
          handle.setMarker(lat, lon);
          handle.flyTo(lat, lon);
        }
        setPicked({ lat, lon });
        setGeolocationState("idle");
      },
      (error) => {
        setGeoErrorMessage(error.code === error.PERMISSION_DENIED ? GEO_ERROR_DENIED : GEO_ERROR_GENERIC);
        setGeolocationState("error");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  if (!open || !view) return null;

  return createPortal(
    <div
      className="modal-overlay location-picker-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-picker-title"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div ref={modalRef} className="modal location-picker-modal">
        <div className="location-picker-header">
          <h3 id="location-picker-title">Izberite natančno lokacijo</h3>
          <button
            type="button"
            className="modal-close-btn location-picker-close-btn"
            aria-label="Zapri"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="location-picker-map" ref={mapHostRef} />
        {geolocationState === "loading" && (
          <p className="location-picker-geo-status" role="status">
            Pridobivam lokacijo …
          </p>
        )}
        {geolocationState === "error" && (
          <p className="location-picker-geo-error" role="alert">
            {geoErrorMessage}
          </p>
        )}
        {picked && (
          <p className="location-picker-coords" aria-live="polite">
            <span>Lat: {formatMapCoordinate(picked.lat)}</span>
            <span>Lon: {formatMapCoordinate(picked.lon)}</span>
          </p>
        )}
        <div className="location-picker-actions">
          <button
            type="button"
            className="btn btn-ghost location-picker-action-btn"
            disabled={geolocationState === "loading"}
            onClick={useMyLocation}
          >
            Moja lokacija
          </button>
          <button
            type="button"
            className="btn btn-primary location-picker-action-btn"
            disabled={!picked}
            onClick={() => {
              if (!picked) return;
              onConfirm(picked.lat, picked.lon);
            }}
          >
            Potrdi lokacijo
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
