// @ts-nocheck
/** Arhiv strel — lazy iframe mount in interakcija z grafi. */

import { archiveEmbedUrl, archiveMapEmbedUrl } from "./archive-embed";
import { hasArchiveFullAccess } from "./season";

function mountIframe(wrap, iframeId, createIframe) {
  if (!wrap || wrap.dataset.loaded === "1") return;
  const isMobile = window.matchMedia("(max-width:899px)").matches;
  const load = () => {
    if (wrap.dataset.loaded === "1") return;
    wrap.dataset.loaded = "1";
    const iframe = createIframe();
    iframe.id = iframeId;
    wrap.querySelector(".archive-charts-placeholder")?.remove();
    wrap.appendChild(iframe);
  };
  if (isMobile || !("IntersectionObserver" in window)) {
    load();
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        obs.disconnect();
        load();
      }
    },
    { rootMargin: "240px 0px" }
  );
  obs.observe(wrap);
}

export function mountArchiveChartEmbed(wrapId, iframeId, _loggedIn, scope) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;
  const height = scope === "preview" ? "200" : "900";
  mountIframe(wrap, iframeId, () => {
    const iframe = document.createElement("iframe");
    iframe.className = "archive-charts-embed";
    iframe.src = wrap.dataset.embedSrc || archiveEmbedUrl(scope, hasArchiveFullAccess());
    iframe.title =
      scope === "preview"
        ? "Dnevni graf strel — Slovenija"
        : "Arhiv strel — Slovenija";
    iframe.width = "100%";
    iframe.height = height;
    iframe.loading = window.matchMedia("(max-width:899px)").matches ? "eager" : "lazy";
    iframe.setAttribute("scrolling", "no");
    iframe.style.overflow = "hidden";
    return iframe;
  });
}

export function mountArchiveMapEmbed(wrapId, iframeId) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;
  mountIframe(wrap, iframeId, () => {
    const iframe = document.createElement("iframe");
    iframe.className = "archive-map-iframe";
    iframe.src = wrap.dataset.mapSrc || archiveMapEmbedUrl(30);
    iframe.title = "Zemljevid strel po občinah — Slovenija";
    iframe.width = "100%";
    iframe.height = window.matchMedia("(max-width:899px)").matches ? "480" : "560";
    iframe.loading = "eager";
    iframe.setAttribute("scrolling", "no");
    iframe.style.overflow = "hidden";
    iframe.onload = () => {
      iframe.contentWindow?.postMessage({ type: "strele-map-visible" }, "*");
    };
    return iframe;
  });
}

export function syncArchiveEmbedSrc(wrapId, iframeId, _loggedIn, scope) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;
  const src = archiveEmbedUrl(scope, hasArchiveFullAccess());
  wrap.dataset.embedSrc = src;
  const iframe = document.getElementById(iframeId);
  if (!iframe) return;
  if (iframe.src !== new URL(src, window.location.origin).href) {
    iframe.src = src;
    iframe.style.height = scope === "preview" ? "200px" : "400px";
  }
}

export function mountArchiveEmbedsForView(view, statTab, loggedIn) {
  if (view === "landing") {
    mountArchiveChartEmbed("archive-embed-wrap", "archive-embed", loggedIn, "preview");
    syncArchiveEmbedSrc("archive-embed-wrap", "archive-embed", loggedIn, "preview");
    return;
  }
  if (view === "statistika") {
    if (statTab !== "zemljevid") {
      mountArchiveChartEmbed("archive-embed-full-wrap", "archive-embed-full", loggedIn, "full");
      syncArchiveEmbedSrc("archive-embed-full-wrap", "archive-embed-full", loggedIn, "full");
    } else {
      mountArchiveMapEmbed("archive-map-wrap", "archive-map-iframe");
    }
  }
}

function embedAtPoint(x, y) {
  for (const id of ["archive-embed-full", "archive-embed"]) {
    const el = document.getElementById(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return el;
  }
  return null;
}

function daysOverlayHit(x, y) {
  const el =
    document.getElementById("stat-days-overlay") ||
    document.getElementById("stat-days-hit");
  if (!el || el.hidden) return false;
  const r = el.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

function forwardChartTap(iframe, x, y) {
  iframe?.contentWindow?.postMessage(
    { type: "strele-embed-chart-tap", clientX: x, clientY: y },
    "*"
  );
}

export function initArchiveEmbedTap() {
  if (window.__streleEmbedTap) return;
  window.__streleEmbedTap = 1;

  let touchFrame = null;
  let touchX = 0;
  let touchY = 0;
  let lastTap = 0;
  let hoverFrame = null;
  let hoverRaf = 0;
  let hoverX = 0;
  let hoverY = 0;

  const skipChartUi = (node) =>
    node?.closest?.(".stat-days-overlay") || node?.closest?.("#stat-days-hit");

  const hoverAt = (frame, x, y) => {
    frame?.contentWindow?.postMessage(
      { type: "strele-embed-chart-hover", clientX: x, clientY: y },
      "*"
    );
  };
  const hoverLeave = (frame) => {
    frame?.contentWindow?.postMessage({ type: "strele-embed-chart-leave" }, "*");
  };
  const scheduleHover = (frame, x, y) => {
    hoverFrame = frame;
    hoverX = x;
    hoverY = y;
    if (hoverRaf) return;
    hoverRaf = requestAnimationFrame(() => {
      hoverRaf = 0;
      hoverAt(hoverFrame, hoverX, hoverY);
    });
  };

  document.addEventListener(
    "touchstart",
    (ev) => {
      if (ev.touches.length !== 1) return;
      const x = ev.touches[0].clientX;
      const y = ev.touches[0].clientY;
      if (skipChartUi(ev.target) || daysOverlayHit(x, y)) return;
      const frame = embedAtPoint(x, y);
      if (!frame) return;
      touchFrame = frame;
      touchX = x;
      touchY = y;
      scheduleHover(frame, x, y);
    },
    { passive: true }
  );

  document.addEventListener(
    "touchmove",
    (ev) => {
      if (!touchFrame || ev.touches.length !== 1) return;
      const x = ev.touches[0].clientX;
      const y = ev.touches[0].clientY;
      const frame = embedAtPoint(x, y);
      if (!frame || frame !== touchFrame) {
        hoverLeave(touchFrame);
        touchFrame = null;
        return;
      }
      scheduleHover(touchFrame, x, y);
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    (ev) => {
      if (!touchFrame) return;
      const frame = touchFrame;
      const x = ev.changedTouches[0].clientX;
      const y = ev.changedTouches[0].clientY;
      hoverLeave(frame);
      const moved = Math.hypot(x - touchX, y - touchY);
      if (moved <= 18) {
        const r = frame.getBoundingClientRect();
        if (
          x >= r.left &&
          x <= r.right &&
          y >= r.top &&
          y <= r.bottom &&
          !daysOverlayHit(x, y) &&
          !skipChartUi(ev.target)
        ) {
          forwardChartTap(frame, x, y);
          lastTap = Date.now();
        }
      }
      touchFrame = null;
    },
    { passive: true }
  );

  document.addEventListener("click", (ev) => {
    if (Date.now() - lastTap < 500 || skipChartUi(ev.target)) return;
    if (daysOverlayHit(ev.clientX, ev.clientY)) return;
    const frame = embedAtPoint(ev.clientX, ev.clientY);
    if (frame) forwardChartTap(frame, ev.clientX, ev.clientY);
  });

  document.addEventListener(
    "mousemove",
    (ev) => {
      if (skipChartUi(ev.target) || daysOverlayHit(ev.clientX, ev.clientY)) {
        if (hoverFrame) {
          hoverLeave(hoverFrame);
          hoverFrame = null;
        }
        return;
      }
      const frame = embedAtPoint(ev.clientX, ev.clientY);
      if (!frame) {
        if (hoverFrame) {
          hoverLeave(hoverFrame);
          hoverFrame = null;
        }
        return;
      }
      scheduleHover(frame, ev.clientX, ev.clientY);
    },
    { passive: true }
  );
}

export function initArchiveDaysOverlay() {
  if (window.__streleDaysOverlay) return;
  window.__streleDaysOverlay = 1;

  let overlay = null;
  let control = null;
  let activeIframe = null;
  let resizeTimer = null;
  let top = 0;
  let left = 0;
  let width = 0;
  let height = 0;

  const isMobile = () => window.matchMedia("(max-width:899px)").matches;

  const applyFrameHeight = (iframe, frameId, reported) => {
    if (!iframe || !reported) return;
    let min: number;
    let max: number;
    if (frameId === "archive-embed") {
      min = 200;
      max = 520;
    } else if (frameId === "archive-map-iframe") {
      min = 560;
      max = 1200;
    } else {
      min = 320;
      max = 2400;
    }
    const h = Math.max(min, Math.min(max, Math.round(reported)));
    iframe.height = String(h);
    iframe.style.height = `${h}px`;
  };

  const ensureOverlay = (wrap, iframe) => {
    if (!wrap || !iframe) return null;
    wrap.classList.add("archive-charts-embed-wrap--overlay-host");
    if (isMobile()) {
      overlay = wrap.querySelector("#stat-days-overlay");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "stat-days-overlay";
        overlay.className = "stat-days-overlay";
        overlay.hidden = true;
        overlay.innerHTML =
          '<select id="stat-days-overlay-select" aria-label="Obdobje">' +
          '<option value="7">7 dni</option><option value="14">14 dni</option>' +
          '<option value="30">30 dni</option><option value="90">90 dni</option></select>';
        wrap.insertBefore(overlay, iframe);
      }
      control = overlay.querySelector("select");
      wrap.querySelector("#stat-days-hit")?.remove();
    } else {
      overlay = wrap.querySelector("#stat-days-hit");
      if (!overlay) {
        overlay = document.createElement("button");
        overlay.type = "button";
        overlay.id = "stat-days-hit";
        overlay.className = "stat-days-hit";
        overlay.hidden = true;
        overlay.setAttribute("aria-label", "Obdobje");
        wrap.insertBefore(overlay, iframe);
      }
      control = null;
      wrap.querySelector("#stat-days-overlay")?.remove();
    }
    return overlay;
  };

  const positionOverlay = () => {
    if (!overlay || overlay.hidden) return;
    overlay.style.top = `${top}px`;
    overlay.style.left = `${left}px`;
    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;
  };

  const requestDaysRect = () => {
    activeIframe?.contentWindow?.postMessage({ type: "strele-embed-request-days-rect" }, "*");
  };

  document.addEventListener(
    "change",
    (ev) => {
      if (ev.target?.id !== "stat-days-overlay-select") return;
      activeIframe?.contentWindow?.postMessage(
        { type: "strele-embed-set-days", days: Number(ev.target.value) },
        "*"
      );
    },
    true
  );

  document.addEventListener("click", (ev) => {
    if (isMobile()) return;
    if (ev.target?.id !== "stat-days-hit") return;
    ev.preventDefault();
    ev.stopPropagation();
    activeIframe?.contentWindow?.postMessage({ type: "strele-embed-open-days" }, "*");
  }, true);

  document.addEventListener("touchend", (ev) => {
    if (isMobile()) return;
    if (ev.target?.id !== "stat-days-hit") return;
    ev.preventDefault();
    activeIframe?.contentWindow?.postMessage({ type: "strele-embed-open-days" }, "*");
  }, true);

  window.addEventListener("message", (ev) => {
    const data = ev.data;
    if (!data || typeof data !== "object") return;

    if (data.type === "strele-embed-resize") {
      const frame = ["archive-embed", "archive-embed-full", "archive-map-iframe"].find((id) => {
        const el = document.getElementById(id);
        return el && el.contentWindow === ev.source;
      });
      if (frame) {
        const el = document.getElementById(frame);
        applyFrameHeight(el, frame, +data.height || 0);
        if (frame !== "archive-map-iframe") {
          activeIframe = el;
          ensureOverlay(el.parentElement, el);
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(requestDaysRect, 60);
        }
      }
      return;
    }

    if (data.type !== "strele-embed-days-rect") return;

    const frame = ["archive-embed", "archive-embed-full"].find((id) => {
      const el = document.getElementById(id);
      return el && el.contentWindow === ev.source;
    });
    if (!frame) {
      if (overlay) overlay.hidden = true;
      return;
    }
    const el = document.getElementById(frame);
    activeIframe = el;
    if (!ensureOverlay(el.parentElement, el)) {
      if (overlay) overlay.hidden = true;
      return;
    }
    top = +data.top || 0;
    left = +data.left || 0;
    width = +data.width || 0;
    height = +data.height || 0;
    if (!width || !height) {
      overlay.hidden = true;
      return;
    }
    overlay.hidden = false;
    const days = String(data.days || 30);
    if (control && control.value !== days) control.value = days;
    positionOverlay();
  });

  window.addEventListener("scroll", () => positionOverlay(), { passive: true });
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (activeIframe) ensureOverlay(activeIframe.parentElement, activeIframe);
        positionOverlay();
        requestDaysRect();
      }, 40);
    },
    { passive: true }
  );
}
