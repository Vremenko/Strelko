# Strelko — operativne skripte

Produkcija = `dist/` (`index-DijleoXU.js`). **Ne** `npm run build` za deploy.

## Deploy

```bash
bash scripts/deploy-strelko.sh
```

## Aktivni patchi (po potrebi)

```bash
python3 scripts/patch-charts-interaction-restore.py
python3 scripts/patch-strike-map-gestures-restore.py
python3 scripts/patch-widget-obcine.py
python3 scripts/patch-zavarovalnica-intro.py
node --check dist/assets/index-DijleoXU.js
bash scripts/deploy-strelko.sh
```

## Obnova CSS po nesreči

Glej **`RECOVERY.md`** v korenu projekta — polni vrstni red + hash `dist/`.

```bash
python3 scripts/restore-css-before-widget.py
python3 scripts/patch-charts-interaction-restore.py
python3 scripts/patch-strike-map-gestures-restore.py
python3 scripts/patch-widget-obcine.py
python3 scripts/patch-zavarovalnica-intro.py
node --check dist/assets/index-DijleoXU.js
bash scripts/deploy-strelko.sh
```

## Zaščiteno (auth & naročnine)

- `dist/assets/index-DijleoXU.js` — ne rezati
- `src/api.js` — API kontrakt
- `scripts/patch-google-signin.py`
- `scripts/patch-search-results-view.py`

## Backup (izven projekta)

| Lokacija | Vsebina |
|----------|---------|
| `~/backups/strelko-archive-20260705/` | `dist-good-20260705`, `src-legacy`, `_archive-phases-0-5` |
| `~/backups/strelko-NEUPORABLJENO-20260705/` | Zastareli patch poskusi, podvojeni dist, `embed.html.recovered` |

Operativno v repu: samo skripte v `scripts/` (brez `patch-mobile-v*`, `patch-native-scroll-v*`, …).

Pred dokončnim brisanjem backupa — preveri stran in potrdi.

## Razvoj

`npm run build` **ni podprt** (Vite config in `src/main.js` sta v backupu).
Produkcija = `dist/` + patch skripte.
