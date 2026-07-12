import Chart from "chart.js/auto";

const HOURLY_Y_MAX = 300;
const HOURLY_Y_MIN_AUTO = 50;
const fmt = new Intl.NumberFormat("sl-SI");

let hourlyChartInstance: Chart | null = null;

function isMobile() {
  return window.matchMedia("(max-width: 639px)").matches;
}

function formatHour(h: number) {
  return `${String(h).padStart(2, "0")}.00`;
}

function hourEndLabel(ura: number) {
  return ura === 23 ? "24.00" : formatHour(ura + 1);
}

function hourIntervalLabel(ura: number) {
  const end = ura === 23 ? "24.00" : hourEndLabel(ura);
  return `${formatHour(ura)} - ${end}`;
}

function hourlyYMax(values: number[]) {
  const peak = values.length ? Math.max(...values) : 0;
  if (peak < HOURLY_Y_MIN_AUTO) return HOURLY_Y_MIN_AUTO;
  if (peak <= HOURLY_Y_MAX) return HOURLY_Y_MAX;
  return Math.ceil((peak * 1.08) / 100) * 100;
}

function applyChartTheme() {
  Chart.defaults.color = "#999999";
  Chart.defaults.borderColor = "#4d4d4d";
  Chart.defaults.font.family = '"Nunito Sans", system-ui, sans-serif';
  Chart.defaults.font.size = isMobile() ? 10 : 12;
}

export interface HourBucket {
  hour: number;
  count: number;
}

function normalizeHours(hours: { hour?: number; ura?: number; count?: number; stevilo?: number }[]) {
  if (!hours?.length) return Array.from({ length: 24 }, (_, ura) => ({ hour: ura, count: 0 }));
  return hours.map((h) => ({
    hour: h.hour ?? h.ura ?? 0,
    count: h.count ?? h.stevilo ?? 0,
  }));
}

export function destroyHourlyChart() {
  if (hourlyChartInstance) {
    hourlyChartInstance.destroy();
    hourlyChartInstance = null;
  }
}

export function mountHourlyChart({
  canvas,
  statsEl,
  wrapEl,
  hours,
}: {
  canvas: HTMLCanvasElement;
  statsEl: HTMLElement | null;
  wrapEl: HTMLElement | null;
  hours: { hour?: number; ura?: number; count?: number; stevilo?: number }[];
}) {
  destroyHourlyChart();
  applyChartTheme();

  const data = normalizeHours(hours);
  const values = data.map((d) => d.count);
  const mobile = isMobile();

  if (wrapEl) wrapEl.style.height = mobile ? "210px" : "240px";

  hourlyChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels: data.map((d) => hourEndLabel(d.hour)),
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
          borderWidth: 2,
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
              return `Strele: ${fmt.format(ctx.parsed.y ?? 0)}`;
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
    (best, d) => (d.count > best.count ? d : best),
    { hour: 0, count: 0 }
  );

  if (statsEl) {
    statsEl.innerHTML = [
      { label: "Skupaj", value: fmt.format(total) },
      {
        label: "Vrh",
        value: peak.count
          ? `${hourIntervalLabel(peak.hour)} (${fmt.format(peak.count)})`
          : "—",
      },
    ]
      .map(
        ({ label, value }) =>
          `<div class="stat"><div class="label">${label}</div><div class="value">${value}</div></div>`
      )
      .join("");
  }
}
