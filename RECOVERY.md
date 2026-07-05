# Obnova in backup (faza 6)

Operativni projekt vsebuje **samo** trenutni `dist/` in aktivne skripte.
Vse zgodovinsko / neuporabljeno je **izven** projekta.

## Backup lokacija

```
/home/maximus/backups/strelko-archive-20260705/
├── _archive-phases-0-5/     # faze čiščenja 0–5 (stari patchi, baseline, …)
├── dist-good-20260705/      # potrjen produkcijski dist (po vseh popravkih)
├── src-legacy/              # stari Vite src (main.js, map.js, …)
├── vite-legacy/             # index.html, vite.config.js, public/
└── (stari tarball)          # ~/backups/strelko-phase0-20260705.tar.gz — delno zastarel
```

## Trenutni produkcijski hash (2026-07-05)

| Datoteka | SHA-256 |
|----------|---------|
| `dist/assets/index-DijleoXU.js` | `0e3cb5a2e79edd627b114a3537b65159bb747c8665740da15379fad54608bdac` |
| `dist/assets/index-b2ecBo4-.css` | `3f406123d75c46068679e88636f659111301214dc249c3b9fdc32d141390969b` |
| `dist/index.html` | `a806cf31d61df3a3f40440edb559e0fce69adaa0433b8690fa237edfd8f4c101` |

Cache bust: `?v=202607051750`

## Zemljevid strel (zavarovalnica) — obnova gest

Samo SPA, brez embed sync:

```bash
cd /home/maximus/projects/Strelko
python3 scripts/patch-strike-map-gestures-restore.py
python3 scripts/patch-strike-map-zoom-hint-pan.py
python3 scripts/patch-strike-popup-style.py
node --check dist/assets/index-DijleoXU.js
bash scripts/deploy-strelko-spa.sh
```

**Ne obnavljaj** iz `_archive-phases-0-5/phase-0-baseline/dist/` — zastarel (npr. brez popravka zemljevida).

## Namerna obnova `dist/`

```bash
cp -a /home/maximus/backups/strelko-archive-20260705/dist-good-20260705/* \
  /home/maximus/projects/Strelko/dist/
bash /home/maximus/projects/Strelko/scripts/deploy-strelko.sh
```

## Po obnovi CSS (ne samo CSS!)

```bash
cd /home/maximus/projects/Strelko
python3 scripts/restore-css-before-widget.py
python3 scripts/patch-charts-interaction-restore.py
python3 scripts/patch-strike-map-gestures-restore.py
python3 scripts/patch-widget-obcine.py
python3 scripts/patch-zavarovalnica-intro.py
node --check dist/assets/index-DijleoXU.js
bash scripts/deploy-strelko.sh
```

## Kaj NE delati

- `npm run build` — prepisuje `dist/` s starim `src/`
- `cp` iz `_archive-phases-0-5/` brez preverbe hash
- zagon starih `patch-*.py` iz backupa (razen če veš, kaj delaš)

## Auth & naročnine

Ohranjeno v projektu: `src/api.js`, `dist/assets/index-DijleoXU.js`, `scripts/patch-google-signin.py`.
