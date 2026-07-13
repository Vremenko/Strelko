import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  pageJsonLd,
  resolvePageSeo,
  socialMetaFromPageSeo,
} from "../../lib/page-seo";

const JSON_LD_ID = "strelko-page-jsonld";

function upsertMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
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

function upsertJsonLd(data: Record<string, unknown>) {
  let el = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = JSON_LD_ID;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function PageMeta() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const seo = resolvePageSeo(pathname, search);
    const social = socialMetaFromPageSeo(seo);

    document.title = seo.title;
    upsertMeta("description", seo.description);
    upsertMeta("robots", seo.robots);
    upsertCanonical(seo.canonical);

    upsertProperty("og:title", social.ogTitle);
    upsertProperty("og:description", social.ogDescription);
    upsertProperty("og:url", social.ogUrl);
    upsertProperty("og:image", social.ogImage);
    upsertProperty("og:image:alt", social.ogImageAlt);
    upsertProperty("og:site_name", social.ogSiteName);
    upsertProperty("og:locale", social.ogLocale);
    upsertProperty("og:type", social.ogType);

    upsertMeta("twitter:card", social.twitterCard);
    upsertMeta("twitter:title", social.twitterTitle);
    upsertMeta("twitter:description", social.twitterDescription);
    upsertMeta("twitter:image", social.twitterImage);
    upsertMeta("twitter:image:alt", social.ogImageAlt);

    upsertJsonLd(pageJsonLd(seo));
  }, [pathname, search]);

  return null;
}
