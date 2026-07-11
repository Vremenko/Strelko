import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const scrollToTarget = () => {
        const target = document.getElementById(id);
        if (!target) return false;
        target.scrollIntoView({ behavior: "auto", block: "start" });
        return true;
      };
      const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });

      if (scrollToTarget()) return;

      requestAnimationFrame(() => {
        if (!scrollToTarget()) scrollToTop();
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
