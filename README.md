# Strelko

Spletna aplikacija za preverjanje udarov strel v bližini lokacije (slovenski jezik). Povezana s **StormAPI**.

## Zahteve

- Node.js 18+
- StormAPI z migracijo `strelko_user_credits`
- PostgreSQL funkcija `igranje.streloisk`

## Docker Compose (priporočeno)

Zagnano iz mape **StormAPI** (vključuje API, bazo in Strelko):

```bash
cd /home/maximus/projects/StormAPI

# Produkcijski build Strelko + nginx
docker compose build strelko
docker compose up -d strelko api db

# Strelko: http://localhost:8092  (nginx → proxy /api → api:3000)
```

Razvoj z Vite HMR:

```bash
docker compose --profile dev up -d strelko-dev api db
# http://localhost:5174
```

## Lokalni razvoj (brez Docker)

```bash
cd Strelko
npm install
npm run dev
# Proxy na API: VITE_API_PROXY=http://127.0.0.1:3000
```

## StormAPI – nastavitve (.env)

```env
STRELKO_WEB_URL=http://localhost:8090
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STRELKO_PRICE_ID=price_...   # opcijsko; setup skripta ga ustvari
```

V `docker-compose.yml` je `STRELKO_WEB_URL` že nastavljen za storitev `strelko` (port **8092**).

Stripe Checkout podpira kartice; Apple Pay in Google Pay prek Stripe Checkout.

## API končne točke

| Metoda | Pot | Opis |
|--------|-----|------|
| GET | `/api/v1/strelko/plans` | Seznam naročniških paketov |
| POST | `/api/v1/strelko/preview` | Javni predogled (brez kreditov) |
| POST | `/api/v1/strelko/search` | Podroben pregled (1 kredit, JWT) |
| GET | `/api/v1/strelko/credits` | Stanje kreditov in paket |
| POST | `/api/v1/strelko/checkout` | Stripe naročnina (`{"plan":"basic"|"premium"|"business"}`) |
| POST | `/api/v1/strelko/billing-portal` | Upravljanje naročnine (Stripe Portal) |
| POST | `/api/v1/strelko/checkout/verify` | Potrditev po redirectu |
| POST | `/api/v1/strelko/webhook/stripe` | Stripe webhook |
| GET | `/api/v1/strelko/alerts` | SMS opozorila – nastavitve |
| PUT | `/api/v1/strelko/alerts` | Shrani telefon + lokacijo za MeteoAlarm SMS |

## SMS opozorila (MeteoAlarm)

Ob vsakem osveževanju MeteoAlarm cache (`meteoalarm-warm-cron`) se po diff-u pošljejo SMS uporabnikom **Premium** in **Poslovni** z vklopljenimi opozorili.

Vir: [MeteoAlarm Slovenia Atom feed](https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-slovenia)

V `StormAPI/.env` (Twilio):

```env
STRELKO_SMS_ENABLED=1
SMSAPI_USERNAME=...
SMSAPI_PASSWORD=...
SMSAPI_FROM=040123456
# ali alfanumerični pošiljatelj (po odobritvi pri SMSapi.si):
# SMSAPI_USE_SENDER_ID=1
# SMSAPI_SENDER_ID=Meteoinfo
```

Registracija in API ključi: [smsapi.si](https://www.smsapi.si/). Brez API podatkov se SMS zabeleži v log (dry-run). V aplikaciji: **SMS opozorila** → telefon + naslov + vklop.

## Naročniški paketi

| Paket | Cena | Krediti / mesec | Ciljna skupina |
|-------|------|-----------------|----------------|
| **Osnovni** | 4,99 EUR | 5 | Posamezniki ob škodi |
| **Premium** | 9,99 EUR | 20 | Družine, več objektov |
| **Poslovni** | 149,00 EUR | 100 | Manjše ekipe, posredniki |
| **Po naročilu** | Po dogovoru | Po meri | Zavarovalnice, večje organizacije |

1 kredit = 1 podroben pregled lokacije z zemljevidom. Po prijavi: 1 brezplačen kredit.

## Produkcija

```bash
# Samo slika Strelko
docker build -t strelko-web ../Strelko

# Ali cel stack
cd ../StormAPI && docker compose up -d strelko api
```

Za javni domen `https://strelko.meteoinfo.si` posodobi `STRELKO_WEB_URL` in CORS v StormAPI.

### Stripe (kartica, Apple Pay, Google Pay)

V `StormAPI/.env`:

```env
STRIPE_SECRET_KEY=sk_live_...   # ali sk_test_... za test
STRIPE_PUBLISHABLE_KEY=pk_...
```

Webhook (za avtomatsko dodajanje kreditov):

```bash
cd StormAPI
docker compose exec api python scripts/setup_strelko_stripe.py
# izpiše STRIPE_WEBHOOK_SECRET → dodaj v .env → docker compose restart api
```

Webhook URL: `https://strelko.meteoinfo.si/api/v1/strelko/webhook/stripe`

Apple Pay: v Stripe Dashboard → Settings → Payment methods → Apple Pay → dodaj domeno `strelko.meteoinfo.si`.

## Opozorilo

Podatki so informativni (vir DHMZ). © Meteoinfo d.o.o.
