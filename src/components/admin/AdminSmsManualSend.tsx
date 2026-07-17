import { useEffect, useMemo, useState, type FormEvent } from "react";
import { adminApi } from "../../api/client";
import type {
  AdminStrelkoSmsPreview,
  AdminStrelkoSmsScenario,
  AdminStrelkoSmsSubscriber,
} from "../../types";

const GSM_MAX = 160;

type Props = {
  busy: boolean;
  subscribers: AdminStrelkoSmsSubscriber[];
  onSend: (userId: number, scenarioId: string) => Promise<void>;
};

function estimateCredits(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / GSM_MAX);
}

export function AdminSmsManualSend({ busy, subscribers, onSend }: Props) {
  const [scenarios, setScenarios] = useState<AdminStrelkoSmsScenario[]>([]);
  const [productionScenarioId, setProductionScenarioId] = useState("standard");
  const [scenarioId, setScenarioId] = useState("standard");
  const [subscriberId, setSubscriberId] = useState("");
  const [preview, setPreview] = useState<AdminStrelkoSmsPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [scenariosError, setScenariosError] = useState<string | null>(null);

  const selectedScenario =
    scenarios.find((s) => s.id === scenarioId) ??
    scenarios.find((s) => s.id === productionScenarioId) ??
    null;

  const selected = subscribers.find((s) => String(s.user_id) === subscriberId) ?? null;

  const message = preview?.message ?? selectedScenario?.sample_message ?? "";
  const credits = useMemo(
    () => (preview ? preview.sms_credits_estimate : estimateCredits(message)),
    [preview, message]
  );
  const overLimit = credits > 1;

  useEffect(() => {
    let cancelled = false;
    void adminApi
      .smsScenarios()
      .then((res) => {
        if (cancelled) return;
        setScenarios(res.items);
        setProductionScenarioId(res.production_scenario_id);
        setScenarioId((current) =>
          res.items.some((item) => item.id === current) ? current : res.production_scenario_id
        );
      })
      .catch((err: Error) => {
        if (!cancelled) setScenariosError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!subscriberId) {
      setPreview(null);
      setPreviewError(null);
      return;
    }

    let cancelled = false;
    setLoadingPreview(true);
    setPreviewError(null);
    void adminApi
      .smsPreview(Number(subscriberId), scenarioId)
      .then((res) => {
        if (cancelled) return;
        setPreview(res);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setPreview(null);
        setPreviewError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingPreview(false);
      });

    return () => {
      cancelled = true;
    };
  }, [subscriberId, scenarioId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!subscriberId || !message || overLimit) return;
    await onSend(Number(subscriberId), scenarioId);
  };

  return (
    <form className="admin-form admin-sms-manual-form" onSubmit={(e) => void handleSubmit(e)}>
      <p className="admin-panel__muted">
        Izberite scenarij besedila in naročnika. Predogled prikaže celotno sporočilo (≤160 znakov,
        1 kredit). Avtomatska opozorila v produkciji uporabljajo scenarij «
        {scenarios.find((s) => s.id === productionScenarioId)?.title ?? "Standard"}».
      </p>

      {scenariosError ? <p className="admin-panel__error">{scenariosError}</p> : null}

      <label>
        Scenarij SMS
        <select
          value={scenarioId}
          required
          disabled={busy || scenarios.length === 0}
          onChange={(e) => setScenarioId(e.target.value)}
        >
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
              {s.production_default ? " (produkcija)" : ""}
            </option>
          ))}
        </select>
      </label>

      {selectedScenario ? (
        <p className="admin-panel__muted admin-sms-scenario-desc">{selectedScenario.description}</p>
      ) : null}

      <details className="admin-sms-scenario-catalog">
        <summary>Vsi scenariji (vzorčna sporočila)</summary>
        <ul className="admin-sms-scenario-list">
          {scenarios.map((s) => (
            <li key={s.id} className={s.id === scenarioId ? "is-selected" : undefined}>
              <strong>{s.title}</strong>
              <p className="admin-panel__muted">{s.description}</p>
              <pre className="admin-sms-scenario-sample">{s.sample_message}</pre>
              <p className="admin-panel__muted">
                {s.sample_length} znakov · {s.sample_credits} kredit
              </p>
            </li>
          ))}
        </ul>
      </details>

      <label>
        Naročnik
        <select
          value={subscriberId}
          required
          disabled={busy}
          onChange={(e) => setSubscriberId(e.target.value)}
        >
          <option value="">— izberite naročnika —</option>
          {subscribers.map((s) => (
            <option key={s.user_id} value={String(s.user_id)}>
              {s.email} {s.alert_phone ? `(${s.alert_phone})` : ""}
            </option>
          ))}
        </select>
      </label>

      {selected ? (
        <p className="admin-panel__muted">
          Lokacija: {selected.saved_label || "—"}
          {selected.saved_lat != null
            ? ` · ${selected.saved_lat.toFixed(3)}, ${selected.saved_lon?.toFixed(3)}`
            : null}
          {" · "}
          radij {selected.alert_radius_km} km
        </p>
      ) : null}

      <label>
        Telefon prejemnika
        <input type="tel" value={preview?.phone || selected?.alert_phone || ""} readOnly disabled />
      </label>

      <label>
        Celotno sporočilo
        {preview?.scenario_title ? (
          <span className="admin-panel__muted"> · {preview.scenario_title}</span>
        ) : selectedScenario ? (
          <span className="admin-panel__muted"> · {selectedScenario.title}</span>
        ) : null}
        <textarea
          rows={5}
          value={loadingPreview ? "Nalagam predogled …" : message}
          readOnly
          disabled
          className="admin-sms-readonly"
        />
      </label>

      {preview?.note ? <p className="admin-panel__muted">{preview.note}</p> : null}
      {!subscriberId && selectedScenario ? (
        <p className="admin-panel__muted">
          Vzorčni predogled (1 udara strel ~4.2 km od vaše izbrane lokacije). Izberite naročnika za
          LIVE predogled.
        </p>
      ) : null}
      {previewError ? <p className="admin-panel__error">{previewError}</p> : null}

      {message ? (
        <p className={`admin-sms-manual-meta${overLimit ? " admin-panel__error" : ""}`}>
          {message.length} znakov · {credits} kredit{credits === 1 ? "" : "a"}
          {preview?.preview_mode === "live"
            ? " · LIVE strele v radiju"
            : subscriberId
              ? " · vzorčni predogled"
              : " · vzorec scenarija"}
          {overLimit ? " — sporočilo presega 1 kredit." : null}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={busy || loadingPreview || !subscriberId || !message || overLimit}
      >
        {busy ? "Pošiljam …" : "Pošlji ročno (test)"}
      </button>
    </form>
  );
}
