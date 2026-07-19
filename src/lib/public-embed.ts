/** Javni embedi grafov in občinskega zemljevida (meteoinfo.si). */

import { SITE_ORIGIN } from "./page-seo";
import {
  PUBLIC_CHART_PARENT_POINTER_TYPE,
  PUBLIC_CHART_TAP_SLOP_PX,
  isPublicChartTapGesture,
  publicEmbedTargetOrigin,
} from "./public-chart-pointer";

export const EMBED_CHARTS_PATH = "/embed/statistika-grafi";
export const EMBED_MAP_PATH = "/embed/obcine-zemljevid";

export const PUBLIC_EMBED_PARENT_ORIGINS = [
  "https://meteoinfo.si",
  "https://www.meteoinfo.si",
] as const;

export const PUBLIC_EMBED_CHILD_ORIGIN = SITE_ORIGIN;

export const PUBLIC_EMBED_RESIZE_TYPE = "strele-public-embed-resize";

/** @deprecated Uporabi PUBLIC_CHART_TAP_SLOP_PX */
export const PUBLIC_EMBED_ACTIVATE_SLOP_PX = PUBLIC_CHART_TAP_SLOP_PX;

/** Faktor višine grafov v javnem embedu (približno −20 %). */
export const PUBLIC_EMBED_CHART_HEIGHT_FACTOR = 0.8;

export const PUBLIC_CHART_PERIODS = [
  { id: "today", days: 1, label: "Danes" },
  { id: "7d", days: 7, label: "7 dni" },
  { id: "14d", days: 14, label: "14 dni" },
  { id: "30d", days: 30, label: "30 dni" },
  { id: "90d", days: 90, label: "90 dni" },
] as const;

export const PUBLIC_MAP_PERIODS = [
  { id: "today", days: 1, label: "Danes" },
  { id: "7d", days: 7, label: "7 dni" },
] as const;

export type PublicChartPeriodId = (typeof PUBLIC_CHART_PERIODS)[number]["id"];
export type PublicMapPeriodId = (typeof PUBLIC_MAP_PERIODS)[number]["id"];
export type PublicEmbedKind = "charts" | "map";

const CHART_PERIOD_IDS = new Set<string>(PUBLIC_CHART_PERIODS.map((p) => p.id));
const MAP_PERIOD_IDS = new Set<string>(PUBLIC_MAP_PERIODS.map((p) => p.id));

export function isPublicEmbedPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path === EMBED_CHARTS_PATH || path === EMBED_MAP_PATH;
}

export function parsePublicPeriodParam(
  kind: PublicEmbedKind,
  raw: string | null | undefined
): PublicChartPeriodId | PublicMapPeriodId {
  const value = (raw || "").trim().toLowerCase();
  if (kind === "charts") {
    if (CHART_PERIOD_IDS.has(value)) return value as PublicChartPeriodId;
    /* Sprejmi tudi "30", "30d", "30days". */
    const digits = value.match(/^(\d+)\s*d(?:ays?)?$/i) || value.match(/^(\d+)$/);
    if (digits) {
      const n = Number(digits[1]);
      if (n === 1) return "today";
      if (n === 7) return "7d";
      if (n === 14) return "14d";
      if (n === 30) return "30d";
      if (n === 90) return "90d";
    }
    return "7d";
  }
  if (MAP_PERIOD_IDS.has(value)) return value as PublicMapPeriodId;
  const mapDigits = value.match(/^(\d+)\s*d(?:ays?)?$/i) || value.match(/^(\d+)$/);
  if (mapDigits) {
    const n = Number(mapDigits[1]);
    if (n === 1) return "today";
    if (n === 7) return "7d";
  }
  return "7d";
}

/** Obdobje iz ?period= ali ?days= (za javni embed). */
export function resolvePublicEmbedPeriod(
  kind: PublicEmbedKind,
  search: URLSearchParams | { get: (k: string) => string | null }
): PublicChartPeriodId | PublicMapPeriodId {
  const period = search.get("period");
  if (period) return parsePublicPeriodParam(kind, period);
  const days = search.get("days");
  if (days) return parsePublicPeriodParam(kind, days);
  return parsePublicPeriodParam(kind, null);
}

export function periodDaysForId(kind: PublicEmbedKind, id: string): number {
  const list = kind === "charts" ? PUBLIC_CHART_PERIODS : PUBLIC_MAP_PERIODS;
  const found = list.find((p) => p.id === id);
  return found?.days ?? 7;
}

export function buildPublicEmbedPath(kind: PublicEmbedKind, periodId: string): string {
  const safe = parsePublicPeriodParam(kind, periodId);
  const base = kind === "charts" ? EMBED_CHARTS_PATH : EMBED_MAP_PATH;
  return `${base}?period=${encodeURIComponent(safe)}`;
}

export function buildPublicEmbedSrc(
  kind: PublicEmbedKind,
  periodId: string,
  origin: string = SITE_ORIGIN
): string {
  return `${origin.replace(/\/+$/, "")}${buildPublicEmbedPath(kind, periodId)}`;
}

export function publicEmbedTitle(kind: PublicEmbedKind): string {
  return kind === "charts"
    ? "Statistika strel — grafi (Strelko)"
    : "Zemljevid strel po občinah (Strelko)";
}

export function isAllowedPublicEmbedParentOrigin(origin: string): boolean {
  return (PUBLIC_EMBED_PARENT_ORIGINS as readonly string[]).includes(origin);
}

/** Ali je gesti dovoljen kratek klik/tap (ne drsenje). */
export function isPublicEmbedActivateGesture(
  deltaX: number,
  deltaY: number,
  slopPx = PUBLIC_CHART_TAP_SLOP_PX
): boolean {
  return isPublicChartTapGesture(deltaX, deltaY, slopPx);
}

/** Allowlista id-jev obdobja za grafični embed (brez Po meri). */
export function isAllowedPublicChartPeriodId(id: string): id is PublicChartPeriodId {
  return CHART_PERIOD_IDS.has(id);
}

function resizeListenerScript(minH: number, maxH: number): string {
  return `window.addEventListener("message",function(ev){
    if(ev.origin!==ORIGIN)return;
    if(!ev.data||ev.data.type!==RESIZE_TYPE)return;
    if(ev.source!==frame.contentWindow)return;
    var h=Math.max(${minH},Math.min(${maxH},+ev.data.height||0));
    if(h>0)frame.style.height=h+"px";
  });`;
}

/**
 * WP lupina: iframe PE:none + prozoren sloj (cel iframe).
 * Brez && / & — WordPress sicer pokvari skripto (&#038;).
 * Klik/tap → postMessage; drsenje strani ostane naravno.
 */
function chartsPointerScript(
  wrapId: string,
  frameId: string,
  minH: number,
  maxH: number
): string {
  const slop = PUBLIC_CHART_TAP_SLOP_PX;
  const target = publicEmbedTargetOrigin();
  return `<script>(function(){
  var ORIGIN=${JSON.stringify(PUBLIC_EMBED_CHILD_ORIGIN)};
  var TARGET=${JSON.stringify(target)};
  var RESIZE_TYPE=${JSON.stringify(PUBLIC_EMBED_RESIZE_TYPE)};
  var PTR_TYPE=${JSON.stringify(PUBLIC_CHART_PARENT_POINTER_TYPE)};
  var SLOP=${slop};
  var wrap=document.getElementById(${JSON.stringify(wrapId)});
  var frame=document.getElementById(${JSON.stringify(frameId)});
  if(!wrap)return;
  if(!frame)return;
  var overlay=wrap.querySelector(".strelko-pe__overlay");
  if(!overlay)return;
  var press=null;
  var hoverRaf=0;
  var hoverPending=null;
  var fine=false;
  try{
    fine=window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }catch(e){}

  function nid(){
    return "c"+Date.now().toString(36)+Math.random().toString(36).slice(2,9);
  }
  function clamp01(n){
    if(n<0)return 0;
    if(n>1)return 1;
    return n;
  }
  function relFromEvent(ev,rect){
    if(rect.width<1)return null;
    if(rect.height<1)return null;
    return {
      x:clamp01((ev.clientX-rect.left)/rect.width),
      y:clamp01((ev.clientY-rect.top)/rect.height)
    };
  }
  function postPtr(action,rel,id){
    var cw=frame.contentWindow;
    if(!cw)return;
    cw.postMessage({
      type:PTR_TYPE,
      action:action,
      relativeX:rel?rel.x:0,
      relativeY:rel?rel.y:0,
      interactionId:id
    },TARGET);
  }
  function applyHeight(h){
    var next=Math.max(${minH},Math.min(${maxH},+h||0));
    if(next>0){
      frame.style.height=next+"px";
      frame.style.minHeight="${minH}px";
    }
  }

  overlay.addEventListener("pointerdown",function(ev){
    if(ev.pointerType==="mouse"){
      if(ev.button!==0)return;
    }
    press={x:ev.clientX,y:ev.clientY,moved:false,id:nid()};
  });
  overlay.addEventListener("pointermove",function(ev){
    if(press){
      if(Math.hypot(ev.clientX-press.x,ev.clientY-press.y)>=SLOP)press.moved=true;
      return;
    }
    if(!fine)return;
    if(ev.pointerType==="touch")return;
    var rect=frame.getBoundingClientRect();
    var rel=relFromEvent(ev,rect);
    if(!rel)return;
    hoverPending={rel:rel,id:nid()};
    if(hoverRaf)return;
    hoverRaf=requestAnimationFrame(function(){
      hoverRaf=0;
      var p=hoverPending;
      hoverPending=null;
      if(p)postPtr("move",p.rel,p.id);
    });
  });
  function endPress(ev){
    var p=press;
    press=null;
    if(!p)return;
    if(p.moved)return;
    if(Math.hypot(ev.clientX-p.x,ev.clientY-p.y)>=SLOP)return;
    var rect=frame.getBoundingClientRect();
    var rel=relFromEvent(ev,rect);
    if(!rel)return;
    postPtr("click",rel,p.id);
  }
  overlay.addEventListener("pointerup",endPress);
  overlay.addEventListener("pointercancel",function(){press=null;});
  overlay.addEventListener("pointerleave",function(){
    if(press)return;
    postPtr("leave",null,nid());
  });

  window.addEventListener("message",function(ev){
    if(ev.origin!==ORIGIN)return;
    if(ev.source!==frame.contentWindow)return;
    if(!ev.data)return;
    if(ev.data.type===RESIZE_TYPE){
      applyHeight(ev.data.height);
    }
  });
  frame.style.pointerEvents="none";
  applyHeight(${minH});
})();<\/script>`;
}

function mapListenerScript(frameId: string, minH: number, maxH: number): string {
  return `<script>(function(){
  var ORIGIN=${JSON.stringify(PUBLIC_EMBED_CHILD_ORIGIN)};
  var RESIZE_TYPE=${JSON.stringify(PUBLIC_EMBED_RESIZE_TYPE)};
  var frame=document.getElementById(${JSON.stringify(frameId)});
  if(!frame)return;
  ${resizeListenerScript(minH, maxH)}
})();<\/script>`;
}

function chartsEmbedStyles(): string {
  return `<style>
.strelko-pe{position:relative;width:100%;max-width:none;box-sizing:border-box;background:transparent}
.strelko-pe__box{position:relative;width:100%;max-width:none;background:transparent}
.strelko-pe__frame{display:block;width:100%;max-width:none;border:0;background:transparent;overflow:hidden;pointer-events:none}
.strelko-pe__overlay{position:absolute;inset:0;z-index:2;background:transparent;touch-action:pan-y;cursor:default;-webkit-tap-highlight-color:transparent}
</style>`;
}

/**
 * Celotna kopirljiva koda.
 * Grafi: prozoren sloj + višina (brez aktivacije / gumba Pomikanje strani).
 * Zemljevid: samo iframe + višina.
 */
export function buildPublicEmbedHtml(
  kind: PublicEmbedKind,
  periodId: string,
  options?: { origin?: string; frameId?: string }
): string {
  const origin = options?.origin ?? SITE_ORIGIN;
  const frameId =
    options?.frameId ??
    `strelko-embed-${kind}-${Math.random().toString(36).slice(2, 8)}`;
  const safePeriod = parsePublicPeriodParam(kind, periodId);
  const src = buildPublicEmbedSrc(kind, safePeriod, origin);
  const title = publicEmbedTitle(kind);
  const minH = kind === "charts" ? 850 : 560;
  const maxH = kind === "charts" ? 2400 : 1800;

  if (kind === "map") {
    return `<iframe
  id="${frameId}"
  src="${src}"
  title="${title}"
  width="100%"
  loading="lazy"
  frameborder="0"
  allowtransparency="true"
  style="display:block;width:100%;max-width:none;border:0;background:transparent;min-height:${minH}px;overflow:hidden"
></iframe>
${mapListenerScript(frameId, minH, maxH)}`;
  }

  const wrapId = `${frameId}-wrap`;
  return `${chartsEmbedStyles()}
<div id="${wrapId}" class="strelko-pe" data-strelko-embed="charts">
  <div class="strelko-pe__box">
    <iframe
      id="${frameId}"
      class="strelko-pe__frame"
      src="${src}"
      title="${title}"
      width="100%"
      height="${minH}"
      loading="lazy"
      frameborder="0"
      scrolling="no"
      allowtransparency="true"
      style="min-height:${minH}px;height:${minH}px"
    ></iframe>
    <div class="strelko-pe__overlay" aria-hidden="true"></div>
  </div>
</div>
${chartsPointerScript(wrapId, frameId, minH, maxH)}`;
}

export function assertPublicEmbedHtml(html: string, kind: PublicEmbedKind): void {
  const srcMatch = html.match(/src="([^"]+)"/);
  if (!srcMatch) throw new Error("Embed koda ne vsebuje iframe URL-ja.");
  const url = new URL(srcMatch[1], SITE_ORIGIN);
  const expectedPath = kind === "charts" ? EMBED_CHARTS_PATH : EMBED_MAP_PATH;
  if (url.pathname.replace(/\/+$/, "") !== expectedPath) {
    throw new Error("Embed koda ne vsebuje pravilne poti.");
  }
  const period = url.searchParams.get("period");
  parsePublicPeriodParam(kind, period);
  for (const [key] of url.searchParams.entries()) {
    if (key !== "period") {
      throw new Error("Embed koda vsebuje nedovoljene parametre.");
    }
  }
  if (!html.includes(PUBLIC_EMBED_RESIZE_TYPE)) {
    throw new Error("Embed koda nima skripta za višino.");
  }
  if (!html.includes(PUBLIC_EMBED_CHILD_ORIGIN)) {
    throw new Error("Embed koda ne preverja pravilnega izvora.");
  }
  if (!html.includes("background:transparent") && !html.includes("background: transparent")) {
    throw new Error("Embed koda nima prozornega ozadja.");
  }
  if (!html.includes('allowtransparency="true"')) {
    throw new Error("Embed koda nima allowtransparency.");
  }
  if (!html.includes("max-width:none") && !html.includes("max-width: none")) {
    throw new Error("Embed koda nima max-width:none.");
  }
  if (html.includes("strele-public-embed-wheel") || html.includes("strele-public-embed-scroll")) {
    throw new Error("Embed ne sme vsebovati scroll relay sporočil.");
  }
  if (html.includes("scrollBy")) {
    throw new Error("Embed ne sme uporabljati scrollBy za pomikanje.");
  }
  if (html.includes("strelko-pe__period-select") || html.includes("strelko-pe__period-label")) {
    throw new Error("Izbirnik obdobja ne sme biti v zunanji lupini.");
  }
  if (html.includes("Kliknite za uporabo grafov") || html.includes("Dotaknite se za uporabo grafov")) {
    throw new Error("Aktivacijski napis mora biti odstranjen.");
  }
  if (html.includes("Pomikanje strani")) {
    throw new Error("Gumb Pomikanje strani mora biti odstranjen.");
  }
  if (html.includes("strelko-pe__scroll-btn") || html.includes("is-active") || html.includes("setActive")) {
    throw new Error("Ostanki aktivacijskega načina morajo biti odstranjeni.");
  }
  if (html.includes("&&")) {
    throw new Error("WP skripta ne sme vsebovati && (WordPress jo pokvari).");
  }
  if (html.includes("strelko-pe__badge")) {
    throw new Error("Badge oznake morajo biti odstranjene.");
  }
  if (html.includes("Po meri")) {
    throw new Error("Javni embed ne sme vsebovati obdobja Po meri.");
  }
  if (html.includes('targetOrigin="*"') || html.includes(",\"*\")") || html.includes(", '*')")) {
    throw new Error("Embed ne sme uporabljati targetOrigin=\"*\".");
  }
  if (kind === "charts") {
    if (!html.includes("pointer-events:none") && !html.includes("pointer-events: none")) {
      throw new Error("Koda grafov nima pointer-events:none.");
    }
    if (!html.includes("strelko-pe__overlay")) {
      throw new Error("Koda grafov nima prozornega interakcijskega sloja.");
    }
    if (!html.includes(PUBLIC_CHART_PARENT_POINTER_TYPE)) {
      throw new Error("Koda grafov nima protokola strele-public-chart-pointer.");
    }
    if (!html.includes("touch-action:pan-y") && !html.includes("touch-action: pan-y")) {
      throw new Error("Interakcijski sloj nima touch-action:pan-y.");
    }
  } else if (
    html.includes("strelko-pe__overlay") ||
    html.includes("Pomikanje strani") ||
    html.includes("strelko-pe__period-select") ||
    html.includes(PUBLIC_CHART_PARENT_POINTER_TYPE)
  ) {
    throw new Error("Zemljevidni embed ne sme imeti interakcije grafov.");
  }
}
