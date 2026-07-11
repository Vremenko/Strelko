import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStrelko } from "../context/StrelkoContext";
import { consumeAuthReturn } from "../lib/auth-intent";

/** Po uspešni prijavi preusmeri na shranjeno pot (npr. /moj-strelko). */
export function useAuthReturn(): void {
  const { user } = useStrelko();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    const returnTo = consumeAuthReturn();
    if (!returnTo) return;
    const current = `${location.pathname}${location.search}`;
    if (returnTo === current) return;
    navigate(returnTo, { replace: true });
  }, [user, navigate, location.pathname, location.search]);
}
