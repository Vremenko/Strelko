# Navodilo: MapTiler-podobna podlaga (2 sloja) — ločeno od Strelka

**Status:** odloženo — lotiti se proti koncu, v **ločeni mapi + novem Cursor klepetu**, ne v Strelko kontekstu.

**Namen:** narediti „kopijo“ MapTilerja na enak način kot podlaga v Strelku: **dva sloja** (podlaga + kartografske oznake), najprej temna tema, potem svetla.

---

## Sporočilo za Domna (kopiraj po potrebi)

Zdaj tega ne delamo znotraj Strelka, da ne mešamo konteksta.

Prosim kratek zapis za ločen Cursor projekt samo za zemljevide. Cilj: MapLibre z **dvema slojema** (podlaga + oznake krajev/mej), temno najprej, nato svetlo — čim bolj kot MapTiler slogi.

V zapis: URL/id slogov, MapLibre (ne en zlit slog), oznake ne blokirajo klikov, API ključ samo v `.env` (ne v git), dokler se ne dogovorimo — **ni** del produkcijskega Strelka.

---

## Navodilo za kasnejši Cursor pogovor

### Delovni prostor

- Nova mapa, npr. `~/projects/meteoinfo-maps` (ali podobno).
- **Nov** Cursor Agent chat v tistem workspace-u.
- Ne nadaljevati Strelko klepeta; Strelko samo **beri** kot referenco.

### Cilj

MapLibre zemljevid čim bolj podoben MapTilerju:

1. **Sloj A — podlaga** (relief / kopno / voda; brez ali skoraj brez napisov).
2. **Sloj B — kartografske oznake** (kraji, državne meje, geografske oznake) **nad** podlago.
3. Sloj B: `pointer-events: none` (kliki grejo skozi na podatkovne sloje).
4. Najprej **temna** tema; po potrditvi še **svetla**.

### MapTiler style ID-ji (brez ključa v tej datoteki)

| Vloga | Tema | Style ID |
|--------|------|----------|
| Podlaga | temna | `019c91be-c9e9-7eac-9e88-83d4e8cf7691` |
| Oznake | temna | `019cdeec-2c48-7778-9774-ad2176fec7cd` |
| Podlaga | svetla | `019cde7d-3f45-7c4a-974c-c31f0757f24d` |
| Oznake | svetla | `019cf131-5fa7-7706-ab76-3b3fa0899d6e` |

URL oblika: `https://api.maptiler.com/maps/{id}/style.json?key=…`  
Ključ: samo v `.env` (`MAPTILER_KEY`), nikoli v git.

### Referenca v Strelku (samo branje)

- `src/lib/strike-map-labels.ts` — konstante slogov, pane za overlay.
- `src/lib/strike-map-basemap.ts` — sestava podlage + krajev.
- Arhivski zemljevid (`strele2` map-embed) trenutno uporablja tudi OpenFreeMap; **ta naloga** je MapTiler 2-slojni vzorec kot pri zavarovalnici / StrikeMap.

### Zahteve / omejitve

- Ne vgrajevati v produkcijski Strelko, dokler ni izrecno naročeno.
- Ne commitati API ključev.
- Primerjava z MapTiler predogledom pred „končano“.
- Po želji kasneje: isti motor za radarski overlay (ločena naloga).

### Predlagan prvi prompt v novem projektu

> Naredi minimalen MapLibre (ali Leaflet + MapLibre) demo: temna MapTiler podlaga + temne kartografske oznake kot drugi sloj (pointer-events: none). Style ID-ji: podlaga `019c91be-…`, oznake `019cdeec-…`. Ključ iz `.env`. Referenca vzorca: Strelko `strike-map-basemap.ts` / `strike-map-labels.ts` (samo beri). Ne spreminjaj Strelka.

---

*Shranjeno: 2026-07-22 — za kasnejši ločen zemljevidni projekt.*
