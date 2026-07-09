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
  const el = document.getElementById("stat-days-overlay");
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

  const skipChartUi = (node) => node?.closest?.(".stat-days-overlay");

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

export function deactivateStatDaysOverlay(wrapId?: string) {
  initArchiveDaysOverlay();
  window.__streleDaysOverlayApi?.deactivate(wrapId);
}

/** Aktivira overlay samo za polni prikaz grafov na /statistika (ne preview). */
export function activateStatDaysOverlayForGrafi(wrapId: string, iframeId: string) {
  initArchiveDaysOverlay();
  window.__streleDaysOverlayApi?.activateGrafi(wrapId, iframeId);
}

export function initArchiveDaysOverlay() {
  if (window.__streleDaysOverlay) return;
  window.__streleDaysOverlay = 1;

  const FULL_WRAP_ID = "archive-embed-full-wrap";

  let overlay = null;
  let control = null;
  let activeIframe = null;
  let activeWrapId = null;
  let resizeTimer = null;
  let statGrafiTabActive = false;

  const isFullStatWrap = (wrapId) => wrapId === FULL_WRAP_ID;

  const isWrapChartsVisible = (wrap) =>
    !!wrap && !wrap.classList.contains("stat-panel--hidden");

  const canShowOverlay = (wrapId, wrap) => {
    if (!isWrapChartsVisible(wrap)) return false;
    if (isFullStatWrap(wrapId)) return statGrafiTabActive;
    return true;
  };

  const removeOverlay = () => {
    overlay?.remove();
    overlay = null;
    control = null;
  };

  const prepareWrapHost = (wrap) => {
    if (!wrap) return;
    wrap.classList.add("archive-charts-embed-wrap--overlay-host");
    wrap.querySelector("#stat-days-hit")?.remove();
  };

  const mountOverlayFromRect = (wrap, iframe, data) => {
    removeOverlay();
    prepareWrapHost(wrap);
    overlay = document.createElement("div");
    overlay.id = "stat-days-overlay";
    overlay.className = "stat-days-overlay";
    overlay.hidden = true;
    overlay.innerHTML =
      '<select id="stat-days-overlay-select" aria-label="Obdobje">' +
      '<option value="7">7 dni</option><option value="14">14 dni</option>' +
      '<option value="30">30 dni</option><option value="90">90 dni</option></select>';
    wrap.insertBefore(overlay, iframe);
    control = overlay.querySelector("select");
    const wrapRect = wrap.getBoundingClientRect();
    const iframeRect = iframe.getBoundingClientRect();
    // Embed pošlje rect relativno na iframe dokument; za absolute v wrapu
    // je treba prišteti iframe offset znotraj wrapa.
    overlay.style.top = `${(+data.top || 0) + iframeRect.top - wrapRect.top}px`;
    overlay.style.left = `${(+data.left || 0) + iframeRect.left - wrapRect.left}px`;
    overlay.style.width = `${+data.width || 0}px`;
    overlay.style.height = `${+data.height || 0}px`;
    const days = String(data.days || 30);
    if (control && control.value !== days) control.value = days;
    overlay.hidden = false;
  };

  const deactivate = (wrapId?: string) => {
    clearTimeout(resizeTimer);
    if (wrapId && activeWrapId && wrapId !== activeWrapId) return;
    statGrafiTabActive = false;
    removeOverlay();
    activeIframe = null;
    activeWrapId = null;
  };

  const activateGrafi = (wrapId: string, iframeId: string) => {
    if (!isFullStatWrap(wrapId)) return;
    clearTimeout(resizeTimer);
    statGrafiTabActive = true;
    removeOverlay();
    const wrap = document.getElementById(wrapId);
    if (!wrap) {
      statGrafiTabActive = false;
      activeWrapId = null;
      activeIframe = null;
      return;
    }
    activeWrapId = wrapId;
    prepareWrapHost(wrap);
    const iframe = document.getElementById(iframeId);
    activeIframe = iframe || null;
    if (iframe?.contentWindow) {
      requestDaysRect();
    }
  };

  window.__streleDaysOverlayApi = { deactivate, activateGrafi };

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

  const requestDaysRect = () => {
    removeOverlay();
    if (!activeIframe || !activeWrapId) return;
    const wrap = activeIframe.parentElement;
    if (!canShowOverlay(activeWrapId, wrap)) return;
    activeIframe.contentWindow?.postMessage({ type: "strele-embed-request-days-rect" }, "*");
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
          activeWrapId = el.parentElement?.id || null;
          prepareWrapHost(el.parentElement);
          removeOverlay();
          if (!canShowOverlay(activeWrapId, el.parentElement)) return;
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
      removeOverlay();
      return;
    }
    const el = document.getElementById(frame);
    const wrap = el?.parentElement;
    const wrapId = wrap?.id || null;
    if (!el || !wrap || !wrapId) {
      removeOverlay();
      return;
    }
    if (!canShowOverlay(wrapId, wrap)) {
      removeOverlay();
      return;
    }
    activeIframe = el;
    activeWrapId = wrapId;
    const nextWidth = +data.width || 0;
    const nextHeight = +data.height || 0;
    if (!nextWidth || !nextHeight) {
      removeOverlay();
      return;
    }
    mountOverlayFromRect(wrap, el, data);
  });

  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!activeIframe || !activeWrapId) {
          removeOverlay();
          return;
        }
        const wrap = activeIframe.parentElement;
        if (!canShowOverlay(activeWrapId, wrap)) {
          removeOverlay();
          return;
        }
        requestDaysRect();
      }, 40);
    },
    { passive: true }
  );
}
