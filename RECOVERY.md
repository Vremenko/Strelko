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
| `dist/assets/index-DijleoXU.js` | `a2c49fd9a1dd9324d583ae8c2ee8efddfa6c8aae0a0646b43d63da9466e8fb47` |
| `dist/assets/index-b2ecBo4-.css` | `b9190d909f150788479eeeb10b07ec1cbcc12520c611c26b4b78561a92efcbc4` |
| `dist/index.html` | `1bb45324e793a1bc1ec2768110731709b8c1ec19c93e5ec11f8b35f8447786fb` |

Cache bust: `?v=202607050850`

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
