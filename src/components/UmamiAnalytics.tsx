import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useStrelko } from "../context/StrelkoContext";
import { loadUmamiScript, trackUmamiPageview, umamiEnabled } from "../lib/umami";

/** Naloži Umami po privolitvi in pošlje pageview ob spremembi poti. */
export function UmamiAnalytics() {
  const { cookieAccepted } = useStrelko();
  const location = useLocation();

  useEffect(() => {
    if (!umamiEnabled() || !cookieAccepted) return;
    loadUmamiScript();
  }, [cookieAccepted]);

  useEffect(() => {
    if (!umamiEnabled() || !cookieAccepted) return;
    trackUmamiPageview(location.pathname, location.search);
  }, [cookieAccepted, location.pathname, location.search]);

  return null;
}
