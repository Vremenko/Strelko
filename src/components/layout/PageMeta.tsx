import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { resolvePageSeo } from "../../lib/page-seo";

function upsertMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function PageMeta() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const seo = resolvePageSeo(pathname, search);
    document.title = seo.title;
    upsertMeta("description", seo.description);
    upsertMeta("robots", seo.robots);
    upsertCanonical(seo.canonical);
  }, [pathname, search]);

  return null;
}
