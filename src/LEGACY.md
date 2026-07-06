# Strelko frontend (React + TypeScript)

## Razvoj

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # tsc + vite → dist/
```

## Struktura

```
src/
  main.tsx              # entry
  App.tsx               # react-router routes
  AppLayout.tsx         # header, footer, modali
  context/StrelkoContext.tsx   # stanje + API akcije
  api/client.ts         # StormAPI
  types/index.ts        # TypeScript tipi
  pages/                # Landing, Statistika, Widget, …
  components/           # UI komponente
  lib/                  # pomožne funkcije (geocode, archive-embed, legal, …)
  styles.css            # obstoječi slogi
  pages-extra.css
src-legacy/             # stari vanilla JS (referenca)
```

Stari vanilla vir je v `src-legacy/`. Patch skripte: `scripts/legacy-patches/`.
