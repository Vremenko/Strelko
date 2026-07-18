import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStrelko } from "../context/StrelkoContext";
import { consumeAuthReturn } from "../lib/auth-intent";

/** Po uspešni prijavi preusmeri na shranjeno pot; če smo že tam, ostani (brez remounta). */
export function useAuthReturn(): void {
  const { user } = useStrelko();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    const returnTo = consumeAuthReturn();
    if (!returnTo) return;
    const current = `${location.pathname}${location.search}${location.hash}`;
    if (returnTo === current) return;
    navigate(returnTo, { replace: true });
  }, [user, navigate, location.pathname, location.search, location.hash]);
}
