import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useStrelko } from "../context/StrelkoContext";
import { isAnalyticsAllowed } from "../lib/cookie-consent";
import {
  loadUmamiScript,
  setUmamiTrackingAllowed,
  trackUmamiPageview,
  umamiEnabled,
} from "../lib/umami";

/** Naloži Umami po privolitvi in pošlje pageview ob spremembi poti. */
export function UmamiAnalytics() {
  const { privacyConsent } = useStrelko();
  const location = useLocation();
  const analyticsOk = isAnalyticsAllowed(privacyConsent);

  useEffect(() => {
    setUmamiTrackingAllowed(analyticsOk);
    if (!umamiEnabled() || !analyticsOk) return;
    loadUmamiScript();
  }, [analyticsOk]);

  useEffect(() => {
    if (!umamiEnabled() || !analyticsOk) return;
    trackUmamiPageview(location.pathname, location.search);
  }, [analyticsOk, location.pathname, location.search]);

  return null;
}
