import { FormEvent, useState } from "react";
import { useStrelko } from "../../context/StrelkoContext";
import { formatPlaceName } from "../../lib/utils";

export function AlertsModal() {
  const {
    modals,
    alerts,
    selected,
    closeAlerts,
    saveAlerts,
    openCredits,
  } = useStrelko();

  const a = alerts || {};
  const eligible = !!a.sms_eligible;
  const emailAvailable = !!a.email_available;
  const emailOk = !!a.email_verified;

  const initialPlace =
    a.saved_label ||
    (a.saved_lat != null ? `${a.saved_lat.toFixed(4)}, ${a.saved_lon?.toFixed(4)}` : "");

  const [alertEnabled, setAlertEnabled] = useState(!!a.alert_enabled);
  const [emailEnabled, setEmailEnabled] = useState(!!a.alert_email_enabled);
  const [phone, setPhone] = useState(a.alert_phone || "");
  const [label, setLabel] = useState(initialPlace);
  const [lat, setLat] = useState<number | "">(a.saved_lat ?? selected?.lat ?? "");
  const [lon, setLon] = useState<number | "">(a.saved_lon ?? selected?.lon ?? "");
  const [radius, setRadius] = useState(a.alert_radius_km ?? 20);
  const [error, setError] = useState("");

  const useSelected =
    selected && (!a.saved_lat || selected.label !== a.saved_label);

  if (!modals.alerts) return null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await saveAlerts({
        alert_enabled: alertEnabled,
        alert_email_enabled: emailEnabled,
        alert_phone: phone || null,
        saved_label: label || null,
        saved_lat: lat === "" ? null : Number(lat),
        saved_lon: lon === "" ? null : Number(lon),
        alert_radius_km: radius,
      });
    } catch (err) {
      setError((err as Error).message || "Napaka pri shranjevanju.");
    }
  };

  return (
    <div className="modal-overlay" id="alerts-modal">
      <div className="modal modal-plans">
        <h3>MeteoAlarm opozorila</h3>
        {!eligible ? (
          <>
            <p className="form-error">
              Opozorila so vključena v paketih <strong>Premium</strong> in <strong>Poslovni</strong>.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "100%", marginBottom: "0.75rem" }}
              onClick={() => {
                closeAlerts();
                openCredits();
              }}
            >
              Izberi paket
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              Obvestilo po SMS, ko ARSO / MeteoAlarm izda opozorilo v bližini shranjene lokacije.
              Vir:{" "}
              <a
                href="https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-slovenia"
                target="_blank"
                rel="noopener noreferrer"
              >
                MeteoAlarm SI
              </a>
              .
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              SMS ta mesec: <strong>{a.sms_sent_this_month ?? 0}</strong> / {a.sms_monthly_limit ?? 0}
              {emailAvailable && (
                <>
                  {" "}
                  · E-pošta: <strong>{a.emails_sent_this_month ?? 0}</strong> /{" "}
                  {a.email_monthly_limit ?? 0}
                </>
              )}
            </p>
          </>
        )}
        <form id="alerts-form" className="alerts-form" onSubmit={(e) => void onSubmit(e)}>
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={alertEnabled}
              disabled={!eligible}
              onChange={(e) => setAlertEnabled(e.target.checked)}
            />
            Vklopi SMS opozorila
          </label>
          <label htmlFor="alert-phone">Mobilna številka (E.164, npr. +38640123456)</label>
          <input
            id="alert-phone"
            type="tel"
            placeholder="+386…"
            value={phone}
            disabled={!eligible}
            onChange={(e) => setPhone(e.target.value)}
          />
          {emailAvailable && (
            <>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={emailEnabled}
                  disabled={!eligible || !emailOk}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                />
                Vklopi e-poštna opozorila
              </label>
              {eligible && !emailOk && (
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "0 0 0.5rem" }}>
                  E-pošta: potrdite e-poštni naslov v profilu (preverite mapo Prejeto).
                </p>
              )}
              {eligible && emailOk && a.account_email && (
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "0 0 0.5rem" }}>
                  E-pošta: <strong>{a.account_email}</strong>
                </p>
              )}
            </>
          )}
          <label htmlFor="alert-label">Lokacija za opozorila</label>
          <input
            id="alert-label"
            type="text"
            placeholder="Naslov ali kraj"
            value={label}
            disabled={!eligible}
            onChange={(e) => setLabel(e.target.value)}
          />
          {useSelected && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              id="btn-use-selected-loc"
              onClick={() => {
                if (!selected) return;
                setLat(selected.lat);
                setLon(selected.lon);
                setLabel(selected.label);
              }}
            >
              Uporabi trenutno iskanje: {formatPlaceName(selected.label)}
            </button>
          )}
          <label htmlFor="alert-radius">
            Radij opozorila: <span id="alert-radius-val">{radius}</span> km
          </label>
          <input
            id="alert-radius"
            type="range"
            min={5}
            max={50}
            step={5}
            value={radius}
            disabled={!eligible}
            onChange={(e) => setRadius(Number(e.target.value))}
          />
          {error && (
            <p className="form-error" id="alerts-error">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={!eligible}>
            Shrani
          </button>
        </form>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: "100%", marginTop: "0.5rem" }}
          onClick={closeAlerts}
        >
          Zapri
        </button>
      </div>
    </div>
  );
}
