import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { installFrameGuard } from "../lib/frame-guard";

/** Minimalna lupina za javne embed poti — brez navigacije, noge in modalov. */
export function EmbedShell() {
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.add("public-embed-root");
    document.body.classList.add("public-embed-body");
    return () => {
      document.documentElement.classList.remove("public-embed-root");
      document.body.classList.remove("public-embed-body");
    };
  }, []);

  useEffect(() => {
    installFrameGuard(location.pathname);
  }, [location.pathname]);

  return (
    <div className="public-embed-shell">
      <Outlet />
    </div>
  );
}
