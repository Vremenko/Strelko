import Chart from "chart.js/auto";

const HOURLY_Y_MAX = 300;
const fmt = new Intl.NumberFormat("sl-SI");

let hourlyChartInstance = null;

function isMobile() {
  return window.matchMedia("(max-width: 639px)").matches;
}

function formatHour(h) {
  return `${String(h).padStart(2, "0")}.00`;
}

function hourEndLabel(ura) {
  return ura === 23 ? "24.00" : formatHour(ura + 1);
}

function hourIntervalLabel(ura) {
  const end = ura === 23 ? "24.00" : hourEndLabel(ura);
  return `${formatHour(ura)}–${end}`;
}

function hourlyYMax(values) {
  const peak = values.length ? Math.max(...values) : 0;
  if (peak <= HOURLY_Y_MAX) return HOURLY_Y_MAX;
  return Math.ceil((peak * 1.08) / 100) * 100;
}

function applyChartTheme() {
  Chart.defaults.color = "#999999";
  Chart.defaults.borderColor = "#4d4d4d";
  Chart.defaults.font.family = '"Nunito Sans", system-ui, sans-serif';
  Chart.defaults.font.size = isMobile() ? 10 : 12;
}

function renderStats(container, items) {
  if (!container) return;
  container.innerHTML = items
    .map(
      ({ label, value }) =>
        `<div class="stat"><div class="label">${label}</div><div class="value">${value}</div></div>`
    )
    .join("");
}

function normalizeHours(hours) {
  if (!hours?.length) return Array.from({ length: 24 }, (_, ura) => ({ ura, stevilo: 0 }));
  return hours.map((h) => ({
    ura: h.ura ?? h.hour,
    stevilo: h.stevilo ?? h.count ?? 0,
  }));
}

export function destroyHourlyChart() {
  if (hourlyChartInstance) {
    hourlyChartInstance.destroy();
    hourlyChartInstance = null;
  }
}

export function mountHourlyChart({ canvasId, statsId, wrapId, hours }) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  destroyHourlyChart();
  applyChartTheme();

  const data = normalizeHours(hours);
  const values = data.map((d) => d.stevilo);
  const mobile = isMobile();

  const wrap = wrapId ? document.getElementById(wrapId) : null;
  if (wrap) wrap.style.height = mobile ? "210px" : "240px";

  hourlyChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels: data.map((d) => hourEndLabel(d.ura)),
      datasets: [
        {
          label: "Strele / uro",
          data: values,
          borderColor: "#05a5ce",
          backgroundColor: "rgba(5, 165, 206, 0.15)",
          fill: true,
          tension: 0.25,
          pointRadius: mobile ? 0 : 2,
          pointHitRadius: 14,
          borderWidth: mobile ? 2 : 2.5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 4, right: mobile ? 4 : 8 } },
      plugins: {
        legend: { display: false },
        tooltip: {
          intersect: false,
          callbacks: {
            title(items) {
              return hourIntervalLabel(items[0].dataIndex);
            },
            label(ctx) {
              return `Strele: ${fmt.format(ctx.parsed.y)}`;
            },
          },
        },
      },
      scales: {
        y: {
          min: 0,
          max: hourlyYMax(values),
          beginAtZero: true,
          grid: { color: "#4d4d4d" },
          ticks: { precision: 0, font: { size: mobile ? 10 : 12 }, color: "#999999" },
        },
        x: {
          grid: { color: "#333333" },
          ticks: {
            font: { size: mobile ? 9 : 11 },
            color: "#999999",
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: mobile ? 6 : 24,
          },
        },
      },
    },
  });

  const total = values.reduce((s, n) => s + n, 0);
  const peak = data.reduce(
    (best, d) => (d.stevilo > best.stevilo ? d : best),
    { ura: 0, stevilo: 0 }
  );
  renderStats(document.getElementById(statsId), [
    { label: "Skupaj", value: fmt.format(total) },
    {
      label: "Konica",
      value: peak.stevilo ? `${hourIntervalLabel(peak.ura)} (${fmt.format(peak.stevilo)})` : "—",
    },
  ]);
}
