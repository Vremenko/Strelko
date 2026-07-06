// @ts-nocheck
/** Pravne informacije – vsebina strani (prej legal.js). */

export const COMPANY = {
  legalName: "Meteoinfo, vremenske informacije, raziskave in storitve, d.o.o.",
  shortName: "Meteoinfo d.o.o.",
  address: "Ženjak 4",
  postal: "2234 Benedikt",
  country: "Slovenija",
  email: "podpora@meteoinfo.si",
  privacyEmail: "info@meteoinfo.si",
  website: "https://meteoinfo.si",
  privacyPolicyUrl: "https://map.meteoinfo.si/privacy-policy.html",
  matična: "7514760000",
  davčna: "SI61712949",
  court: "Okrožno sodišče Maribor",
  updated: "17. 06. 2026",
};

export const LEGAL_PAGES = {
  impressum: {
    path: "/impressum",
    title: "Impressum",
    sections: [
      {
        title: "Podatki o podjetju",
        body: `
          <p><strong>${COMPANY.legalName}</strong><br />
          Kratko ime: ${COMPANY.shortName}<br />
          ${COMPANY.address}, ${COMPANY.postal}, ${COMPANY.country}</p>
          <ul>
            <li>Matična številka: ${COMPANY.matična}</li>
            <li>Davčna številka: ${COMPANY.davčna}</li>
            <li>Identifikacijska številka za DDV: podjetje ni davčni zavezanec</li>
            <li>Registrski organ: ${COMPANY.court}</li>
          </ul>`,
      },
      {
        title: "Storitev Strelko",
        body: `
          <p>Strelko je spletna storitev za informativni pregled udarov strel v bližini izbrane lokacije,
          opozorila ob vremenskih opozorilih (MeteoAlarm) in pomoč pri pripravi podatkov za zavarovalnico.
          Storitev je na voljo na naslovu <strong>strelko.meteoinfo.si</strong>.</p>`,
      },
      {
        title: "Kontakt",
        body: `
          <p>Splošna podpora in vprašanja o storitvi Strelko:<br />
          <a href="mailto:${COMPANY.email}">${COMPANY.email}</a></p>
          <p>Vprašanja glede zasebnosti in osebnih podatkov:<br />
          <a href="mailto:${COMPANY.privacyEmail}">${COMPANY.privacyEmail}</a></p>
          <p>Spletna stran podjetja: <a href="${COMPANY.website}" target="_blank" rel="noopener">meteoinfo.si</a></p>`,
      },
    ],
  },
  terms: {
    path: "/pogoji-uporabe",
    title: "Pogoji uporabe",
    sections: [
      {
        title: "1. Splošno",
        body: `
          <p>Ti pogoji uporabe urejajo uporabo spletne storitve <strong>Strelko</strong>,
          ki jo upravlja ${COMPANY.shortName}. Z registracijo računa, prijavo ali uporabo storitve
          potrjujete, da ste seznanjeni s temi pogoji in se z njimi strinjate.</p>`,
      },
      {
        title: "2. Namen storitve",
        body: `
          <p>Strelko omogoča:</p>
          <ul>
            <li>javni brezplačen predogled prisotnosti udarov strel v izbranem radiju,</li>
            <li>podroben pregled udarov (zemljevid, časi, razdalje) z uporabo kreditov,</li>
            <li>SMS in/ali e-poštna opozorila ob MeteoAlarm opozorilih (paketi Premium in Poslovni),</li>
            <li>izvoz PDF poročila (paket Poslovni).</li>
          </ul>
          <p>Vsi prikazani podatki so <strong>izključno informativne narave</strong>. Strelko ne nadomešča
          uradnih evidenc DHMZ, ARSO, zavarovalnice ali sodnih postopkov.</p>`,
      },
      {
        title: "3. Uporabniški račun",
        body: `
          <ul>
            <li>Uporabnik mora biti starel najmanj 16 let.</li>
            <li>Uporabnik je odgovoren za pravilnost podanih podatkov in varnost gesla.</li>
            <li>En račun je namenjen osebni uporabi; deljenje dostopov je dovoljeno le v okviru poslovnega paketa po dogovoru.</li>
            <li>Upravljavec lahko začasno ali trajno omeji dostop ob zlorabi, kršitvi pogojev ali sumu nepooblaščene uporabe.</li>
          </ul>`,
      },
      {
        title: "4. Plačljivi paketi in krediti",
        body: `
          <p>Naročnine in enkratni nakupi kreditov potekajo prek plačilnega ponudnika <strong>Stripe</strong>.
          Cene so prikazane v evrih (EUR) in vključujejo davke, kjer je to zakonsko zahtevano.</p>
          <ul>
            <li>Mesečna naročnina se samodejno podaljša, dokler jo uporabnik ne prekliče v portalu za naročnino.</li>
            <li>Ne porabljeni krediti se ne prenašajo v naslednji mesec, razen če je drugače izrecno navedeno ob nakupu.</li>
            <li>Ob registraciji lahko uporabnik prejme en brezplačen dobrodošel kredit za preizkus storitve.</li>
          </ul>
          <p>Podrobnosti o pravicah potrošnikov (odstop od pogodbe, reklamacije) so na strani
          <a href="/pravice-potrosnikov" data-legal="consumer">Pravice potrošnikov</a>.</p>`,
      },
      {
        title: "5. Prepovedana uporaba",
        body: `
          <p>Uporabnik se zavezuje, da storitve ne bo uporabljal za:</p>
          <ul>
            <li>avtomatizirano množično poizvedovanje brez predhodnega pisnega soglasja,</li>
            <li>poskuse nepooblaščenega dostopa do sistemov,</li>
            <li>objavo ali širjenje zavajajočih trditve, da gre za uradno potrdilo zavarovalnice ali državnega organa,</li>
            <li>kakršno koli nezakonito dejavnost.</li>
          </ul>`,
      },
      {
        title: "6. Intelektualna lastnina",
        body: `
          <p>Vsebina storitve (programska koda, oblikovanje, besedila, logotipi) je zaščitena.
          Podatke o udarih strel lahko uporabnik uporablja za osebne in poslovne namene v okviru
          kupljenega paketa, ne sme pa jih sistematično preprodajati ali javno objavljati kot lasten vir brez soglasja.</p>`,
      },
      {
        title: "7. Omejitev odgovornosti",
        body: `
          <p>Storitev je na voljo po načelu „kot je“. ${COMPANY.shortName} ne jamči za neprekinjeno
          delovanje, popolno točnost podatkov tretjih virov (DHMZ, ARSO / MeteoAlarm) ali izid postopkov
          pri zavarovalnici. V največji meri, ki jo dovoljuje zakon, upravljavec ne odgovarja za posredno
          ali neposredno škodo zaradi uporabe ali nezmožnosti uporabe storitve.</p>`,
      },
      {
        title: "8. Zasebnost",
        body: `
          <p>Obdelava osebnih podatkov je opisana v
          <a href="/zasebnost" data-legal="privacy">politiki zasebnosti Strelko</a> in
          <a href="${COMPANY.privacyPolicyUrl}" target="_blank" rel="noopener">politiki zasebnosti Meteoinfo</a>.</p>`,
      },
      {
        title: "9. Spremembe in prenehanje",
        body: `
          <p>Upravljavec lahko storitev ali te pogoje posodobi. Posodobljena različica začne veljati z objavo
          na tej strani. Uporabnik lahko kadar koli preneha uporabljati storitev in izbriše račun s prošnjo na
          <a href="mailto:${COMPANY.email}">${COMPANY.email}</a>.</p>`,
      },
      {
        title: "10. Veljavno pravo",
        body: `
          <p>Za te pogoje velja pravo Republike Slovenije. Pristojno je stvarno pristojno sodišče v Sloveniji,
          razen če zakonodaja o varstvu potrošnikov ne določa drugače.</p>`,
      },
    ],
  },
  privacy: {
    path: "/zasebnost",
    title: "Politika zasebnosti",
    sections: [
      {
        title: "Splošna politika Meteoinfo",
        body: `
          <p>Za ${COMPANY.shortName} velja tudi skupna
          <a href="${COMPANY.privacyPolicyUrl}" target="_blank" rel="noopener">politika zasebnosti Meteoinfo</a>.
          Spodnja določila dopolnjujejo splošno politiko posebej za storitev <strong>Strelko</strong>.</p>`,
      },
      {
        title: "1. Upravljavec",
        body: `
          <p>Upravljavec osebnih podatkov je <strong>${COMPANY.legalName}</strong>,
          ${COMPANY.address}, ${COMPANY.postal} (${COMPANY.shortName}).</p>
          <p>Kontakt za zasebnost: <a href="mailto:${COMPANY.privacyEmail}">${COMPANY.privacyEmail}</a></p>`,
      },
      {
        title: "2. Katere podatke obdelujemo",
        body: `
          <ul>
            <li><strong>Račun:</strong> e-poštni naslov, geslo (shranjeno v zgoščeni obliki), status potrditve e-pošte.</li>
            <li><strong>Iskanje:</strong> koordinate in oznaka lokacije, ki jo vnesete ali izberete pri iskanju.</li>
            <li><strong>Opozorila:</strong> mobilna telefonska številka, shranjena lokacija za opozorila, radij, nastavitve SMS/e-pošte.</li>
            <li><strong>Naročnina:</strong> podatki o paketu, stanju kreditov, ID seje plačila pri Stripe (ne shranjujemo številk plačilnih kartic).</li>
            <li><strong>Tehnični podatki:</strong> IP naslov, čas dostopa, user-agent ob prijavi in varnostnih dogodkih.</li>
            <li><strong>Lokalna shramba brskalnika:</strong> žeton za prijavo (localStorage) – glejte tudi <a href="/piskotki" data-legal="cookies">Politiko piškotkov</a>.</li>
          </ul>`,
      },
      {
        title: "3. Nameni in pravne podlage",
        body: `
          <ul>
            <li><strong>Izvedba pogodbe</strong> – registracija, prijava, izvajanje iskanj, naročnine, opozorila.</li>
            <li><strong>Zakoniti interes</strong> – varnost sistema, preprečevanje zlorab, tehnični dnevniki.</li>
            <li><strong>Privolitev</strong> – kjer jo zahteva zakon (npr. neobvezna e-poštna obvestila, če jih vklopite).</li>
            <li><strong>Zakonske obveznosti</strong> – računovodstvo in davčna dokumentacija plačil.</li>
          </ul>`,
      },
      {
        title: "4. Pogodbeni obdelovalci",
        body: `
          <p>Podatke lahko obdelujejo zaupanja vredni pogodbeni partnerji, ki zagotavljajo delovanje storitve:</p>
          <ul>
            <li><strong>Stripe</strong> – obdelava plačil in naročnin,</li>
            <li><strong>ponudnik gostovanja / strežnikov</strong> – tehnično delovanje API-ja in baze,</li>
            <li><strong>ponudnik SMS storitve</strong> – pošiljanje MeteoAlarm opozoril (če jih vklopite),</li>
            <li><strong>ponudnik e-pošte</strong> – transakcijska sporočila (potrditev računa, opozorila).</li>
          </ul>
          <p>Podatkov ne prodajamo tretjim osebam za trženjske namene.</p>`,
      },
      {
        title: "5. Hramba",
        body: `
          <ul>
            <li>Podatki računa: do izbrisa računa ali preklica soglasja, nato le še kolikor to zahteva zakon.</li>
            <li>Zgodovina iskanj in kreditov: za čas trajanja računa in zakonsko predpisano obdobje.</li>
            <li>Varnostni dnevniki: omejeno obdobje (običajno do 12 mesecev).</li>
          </ul>`,
      },
      {
        title: "6. Vaše pravice (GDPR)",
        body: `
          <p>Imate pravico do dostopa, popravka, izbrisa, omejitve obdelave, ugovora in prenosljivosti podatkov,
          kjer to velja. Zahteve pošljite na <a href="mailto:${COMPANY.privacyEmail}">${COMPANY.privacyEmail}</a>.</p>
          <p>Pritožbo lahko vložite pri Informacijskem pooblaščencu RS:
          <a href="https://www.ip-rs.si" target="_blank" rel="noopener">www.ip-rs.si</a>.</p>`,
      },
      {
        title: "7. Varnost in otroci",
        body: `
          <p>Uporabljamo ustrezne tehnične in organizacijske ukrepe za zaščito podatkov.
          Storitev ni namenjena osebam, mlajšim od 16 let.</p>`,
      },
      {
        title: "8. Spremembe",
        body: `
          <p>Politiko lahko občasno posodobimo. Datum zadnje spremembe je naveden na dnu strani.</p>`,
      },
    ],
  },
  cookies: {
    path: "/piskotki",
    title: "Politika piškotkov",
    sections: [
      {
        title: "1. Kaj so piškotki",
        body: `
          <p>Piškotki so majhne datoteke, ki jih spletna stran shrani v vaš brskalnik.
          Strelko uporablja le nujno potrebne mehanizme za delovanje storitve.</p>`,
      },
      {
        title: "2. Kaj uporabljamo",
        body: `
          <table class="legal-table">
            <thead><tr><th>Ime / vrsta</th><th>Namen</th><th>Trajanje</th></tr></thead>
            <tbody>
              <tr>
                <td><code>strelko_token</code> (localStorage)</td>
                <td>Ohranjanje prijave uporabnika</td>
                <td>Do odjave ali ročnega izbrisa</td>
              </tr>
              <tr>
                <td><code>strelko_cookie_consent</code> (localStorage)</td>
                <td>Shranitev vaše izbire glede obvestila o piškotkih</td>
                <td>12 mesecev</td>
              </tr>
            </tbody>
          </table>
          <p>Trenutno ne uporabljamo analitičnih ali oglaševalskih piškotkov tretjih oseb na Strelko.</p>`,
      },
      {
        title: "3. Upravljanje",
        body: `
          <p>Prijavni žeton lahko izbrišete z odjavo ali brisanjem podatkov spletne strani v nastavitvah brskalnika.
          Brez nujnih piškotkov / localStorage prijava ne bo delovala.</p>`,
      },
    ],
  },
  consumer: {
    path: "/pravice-potrosnikov",
    title: "Pravice potrošnikov",
    sections: [
      {
        title: "1. Identiteta trgovca",
        body: `
          <p>${COMPANY.legalName}, ${COMPANY.address}, ${COMPANY.postal}.<br />
          E-pošta: <a href="mailto:${COMPANY.email}">${COMPANY.email}</a></p>`,
      },
      {
        title: "2. Cene in plačilo",
        body: `
          <p>Cene paketov so jasno prikazane pred nakupom v modalu za izbiro paketa.
          Plačilo poteka varno prek Stripe. Račun za plačilo prejmete v skladu z davčnimi predpisi.</p>`,
      },
      {
        title: "3. Pravica do odstopa od pogodbe",
        body: `
          <p>Kot potrošnik imate pri sklenitvi pogodbe na daljavo na splošno pravico do odstopa v 14 dneh,
          razen v primerih, ki jih določa Zakon o varstvu potrošnikov (ZVPot-1).</p>
          <p>Pri digitalnih vsebinah, ki se začnejo izvajati takoj po nakupu (npr. dodelitev mesečnih kreditov
          ali takojšnja aktivacija naročnine), z nakupom izrecno soglašate, da se izvajanje storitve začne pred
          potekom roka za odstop; v tem primeru lahko odstop velja le za neporabljene storitve, kolikor to zakon dopušča.</p>`,
      },
      {
        title: "4. Preklic naročnine",
        body: `
          <p>Mesečno naročnino lahko kadar koli prekličete v razdelku <strong>Naročnina</strong> (Stripe portal)
          v uporabniškem meniju. Preklic začne veljati ob koncu tekočega obračunskega obdobja, razen če
          Stripe prikaže drugačen datum.</p>`,
      },
      {
        title: "5. Reklamacije",
        body: `
          <p>Na nepravilnosti v delovanju storitve ali plačilih nas obvestite na
          <a href="mailto:${COMPANY.email}">${COMPANY.email}</a>. Odgovorili bomo v razumnem roku, najpozneje v 15 dneh.</p>`,
      },
      {
        title: "6. Izvensodno reševanje sporov",
        body: `
          <p>Potrošnik lahko spor posreduje v izvensodno reševanje pri subjektu za izvensodno reševanje
          potrošniških sporov. Seznam je na voljo na spletni strani
          <a href="https://www.gov.si" target="_blank" rel="noopener">Vlade RS</a>.</p>
          <p>Platforma EU za spletno reševanje sporov (ODR):
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener">ec.europa.eu/consumers/odr</a></p>`,
      },
    ],
  },
};

export type LegalPageId = keyof typeof LEGAL_PAGES;

const COOKIE_CONSENT_KEY = "strelko_cookie_consent";

export function resolveLegalPageId(pathname: string): LegalPageId | null {
  const path = (pathname || "/").replace(/\/$/, "") || "/";
  const entry = Object.entries(LEGAL_PAGES).find(([, page]) => page.path === path);
  return entry ? (entry[0] as LegalPageId) : null;
}

export function hasCookieConsent() {
  return localStorage.getItem(COOKIE_CONSENT_KEY) === "1";
}

export function setCookieConsent() {
  localStorage.setItem(COOKIE_CONSENT_KEY, "1");
}

export function renderLegalNav(currentId) {
  return `
    <nav class="legal-nav" aria-label="Pravne informacije">
      ${Object.entries(LEGAL_PAGES)
        .map(
          ([id, page]) =>
            `<a href="${page.path}" class="legal-nav-link${id === currentId ? " is-active" : ""}" data-legal="${id}">${page.title}</a>`
        )
        .join("")}
    </nav>`;
}

export function renderLegalPage(pageId) {
  const page = LEGAL_PAGES[pageId];
  if (!page) return "";
  const sections = page.sections
    .map(
      (s) => `
      <section class="legal-section">
        <h2>${s.title}</h2>
        ${s.body}
      </section>`
    )
    .join("");

  return `
    <article class="legal-page">
      <p class="legal-back"><a href="/" data-nav="landing">← Nazaj na Strelko</a></p>
      <h1 class="legal-title">${page.title}</h1>
      <p class="legal-meta">Zadnja posodobitev: ${COMPANY.updated}</p>
      ${renderLegalNav(pageId)}
      <div class="legal-card">${sections}</div>
    </article>`;
}

export function renderCookieBanner() {
  if (hasCookieConsent()) return "";
  return `
    <div class="cookie-banner" id="cookie-banner" role="dialog" aria-label="Obvestilo o piškotkih">
      <div class="cookie-banner-inner">
        <p>
          Za delovanje prijave uporabljamo nujne piškotke oziroma localStorage.
          <a href="/piskotki" data-legal="cookies">Več o piškotkih</a>
        </p>
        <button type="button" class="btn btn-primary btn-sm" data-action="accept-cookies">Razumem</button>
      </div>
    </div>`;
}
