import { FormEvent, useEffect, useState } from "react";
import { useStrelko } from "../../context/StrelkoContext";

export function WidgetSetupModal() {
  const {
    modals,
    closeWidgetSetup,
    saveUserWidget,
    searchResult,
    selected,
    userWidget,
  } = useStrelko();
  const open = modals.widget;

  const defaultLat = searchResult?.lat ?? selected?.lat ?? userWidget?.lat ?? "";
  const defaultLon = searchResult?.lon ?? selected?.lon ?? userWidget?.lon ?? "";
  const defaultLabel =
    searchResult?.location_label ?? selected?.label ?? userWidget?.label ?? "";

  const [label, setLabel] = useState(String(defaultLabel));
  const [domain, setDomain] = useState(userWidget?.domain ?? "");
  const [lat, setLat] = useState(defaultLat === "" ? "" : String(defaultLat));
  const [lon, setLon] = useState(defaultLon === "" ? "" : String(defaultLon));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setLabel(String(defaultLabel));
    setDomain(userWidget?.domain ?? "");
    setLat(defaultLat === "" ? "" : String(defaultLat));
    setLon(defaultLon === "" ? "" : String(defaultLon));
    setError("");
  }, [open, defaultLabel, defaultLat, defaultLon, userWidget?.domain]);

  if (!open) return null;

  const useSearchLocation = () => {
    if (searchResult) {
      setLat(String(searchResult.lat));
      setLon(String(searchResult.lon));
      setLabel(searchResult.location_label || "");
      return;
    }
    if (selected) {
      setLat(String(selected.lat));
      setLon(String(selected.lon));
      setLabel(selected.label || "");
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (!label.trim() || Number.isNaN(latNum) || Number.isNaN(lonNum)) {
      setError("Vnesite lokacijo.");
      return;
    }
    try {
      setError("");
      await saveUserWidget({
        lat: latNum,
        lon: lonNum,
        label: label.trim(),
        domain: domain.trim() || null,
      });
    } catch (err) {
      setError((err as Error).message || "Napaka");
    }
  };

  return (
    <div className="modal-overlay" id="widget-modal">
      <div className="modal">
        <h3>Widget za spletno stran</h3>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
          Prikaže zadnje strele v bližini vaše lokacije. Velja za 1 domeno.
        </p>
        <form id="widget-form" onSubmit={onSubmit}>
          <label htmlFor="widget-label">Lokacija</label>
          <input
            id="widget-label"
            name="label"
            type="text"
            placeholder="Naslov ali kraj"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
          <label htmlFor="widget-domain">Domena (npr. mojadomena.si)</label>
          <input
            id="widget-domain"
            name="domain"
            type="text"
            placeholder="mojadomena.si"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <input type="hidden" name="lat" id="widget-lat" value={lat} />
          <input type="hidden" name="lon" id="widget-lon" value={lon} />
          {(searchResult || selected) && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              id="btn-widget-use-search"
              onClick={useSearchLocation}
            >
              Uporabi trenutno iskanje
            </button>
          )}
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Shrani
          </button>
        </form>
        {userWidget?.embed_html && (
          <>
            <label className="widget-code-label">Koda za vdelavo</label>
            <textarea
              className="widget-embed-code"
              readOnly
              rows={3}
              value={userWidget.embed_html}
            />
          </>
        )}
        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: "100%", marginTop: "0.5rem" }}
          onClick={closeWidgetSetup}
        >
          Zapri
        </button>
      </div>
    </div>
  );
}
