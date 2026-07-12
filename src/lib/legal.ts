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

export const DISCLAIMER_TEXT =
  "Prikazani podatki so izključno informativne narave in se lahko razlikujejo od uradnih evidenc. Meteoinfo d.o.o. ne prevzema odgovornosti za odločitve zavarovalnic ali točnost podatkov v posameznem primeru. Za uradne postopke in dokazovanje škode se obrnite na zavarovalnico oziroma pristojne institucije.";

export const LEGAL_PAGES = {
  impressum: {
    path: "/impressum",
    title: "Impressum",
    updated: "12. 7. 2026",
    sections: [
      {
        title: "Podatki o podjetju",
        body: `
          <p><strong>${COMPANY.legalName}</strong></p>
          <p>Kratka firma: ${COMPANY.shortName}</p>
          <p>Sedež: ${COMPANY.address}, ${COMPANY.postal}, ${COMPANY.country}</p>
          <p>Podjetje zastopata: Amadej Krepek in Rok Nosan</p>
          <ul>
            <li>Matična številka: ${COMPANY.matična}</li>
            <li>Davčna številka: 61712949</li>
            <li>Identifikacijska številka za DDV: SI61712949</li>
            <li>Družba je vpisana v sodni register pri Okrožnem sodišču v Mariboru.</li>
            <li>Osnovni kapital: 7.500,00 €</li>
          </ul>`,
      },
      {
        title: "Storitev Strelko",
        body: `
          <p>Strelko je spletna storitev podjetja ${COMPANY.shortName} za informativni pregled zaznanih udarov strel,
          arhivske in statistične prikaze ter izdelavo PDF-poročil kot pomoč pri komunikaciji z zavarovalnico.</p>
          <p>Storitev je dostopna na naslovu strelko.meteoinfo.si.</p>`,
      },
      {
        title: "Kontakt",
        body: `
          <p>Podpora uporabnikom in vprašanja o storitvi Strelko:<br />
          <a href="mailto:${COMPANY.email}">${COMPANY.email}</a></p>
          <p>Vprašanja glede zasebnosti in varstva osebnih podatkov:<br />
          <a href="mailto:${COMPANY.privacyEmail}">${COMPANY.privacyEmail}</a></p>
          <p>Spletna stran podjetja:<br />
          <a href="${COMPANY.website}" target="_blank" rel="noopener">meteoinfo.si</a></p>`,
      },
    ],
  },
  terms: {
    path: "/pogoji-uporabe",
    title: "Pogoji uporabe storitve Strelko",
    navTitle: "Pogoji uporabe",
    updated: "12. 7. 2026",
    sections: [
      {
        title: "1. Splošno",
        body: `
          <p>Ti pogoji uporabe urejajo dostop do spletne storitve Strelko, uporabo brezplačnih in plačljivih funkcij,
          nakup ter porabo žetonov, uporabo paketa Podpornik in izdelavo PDF-poročil.</p>
          <p>Z uporabo storitve oziroma z izvedbo nakupa uporabnik potrjuje, da je te pogoje prebral in se z njimi strinja.</p>
          <p>Ponudnik storitve je:</p>
          <p><strong>${COMPANY.legalName}</strong><br />
          ${COMPANY.address}, ${COMPANY.postal}, ${COMPANY.country}</p>
          <p>E-pošta: <a href="mailto:${COMPANY.email}">${COMPANY.email}</a></p>
          <p>Celotni podatki o ponudniku so objavljeni v <a href="/impressum">Impressumu</a>.</p>`,
      },
      {
        title: "2. Namen storitve",
        body: `
          <p>Strelko omogoča informativni pregled zaznanih udarov strel, iskanje udarov v bližini izbrane lokacije,
          arhivske in statistične prikaze ter izdelavo PDF-poročil kot pomoč pri komunikaciji z zavarovalnico.</p>
          <p>Storitev ne ugotavlja nastanka ali vzroka škode in ne nadomešča uradnega poročila, izvedenskega mnenja,
          dokazila zavarovalnice ali podatkov pristojnih institucij.</p>`,
      },
      {
        title: "3. Narava podatkov",
        body: `
          <p>Podatki v storitvi Strelko so informativne narave. Zaradi načina merjenja, obdelave in prenosa podatkov
          so mogoča odstopanja v času, lokaciji, oddaljenosti, številu ali drugih lastnostih zaznanih udarov strel.</p>
          <p>Podatki o času udarov strel so približni in lahko od dejanskega časa odstopajo za nekaj minut.</p>
          <p>Ponudnik ne zagotavlja, da so v storitvi prikazani vsi dejanski udari strel ali da se podatki popolnoma
          ujemajo z drugimi merilnimi sistemi oziroma uradnimi evidencami.</p>
          <p>Uporabnik mora pred sprejetjem pomembnih odločitev podatke preveriti tudi pri ustrezni zavarovalnici,
          pristojni instituciji ali drugem strokovnem viru.</p>`,
      },
      {
        title: "4. Uporabniški račun",
        body: `
          <p>Za uporabo plačljivih funkcij mora uporabnik ustvariti račun in se prijaviti.</p>
          <p>Uporabnik je odgovoren za:</p>
          <ul>
            <li>pravilnost vnesenih podatkov,</li>
            <li>varovanje svojih prijavnih podatkov,</li>
            <li>vse dejavnosti, izvedene prek njegovega računa,</li>
            <li>pravočasno obvestilo ponudniku ob sumu nepooblaščenega dostopa.</li>
          </ul>
          <p>Uporabniškega računa, žetonov ali dostopa do paketa Podpornik ni dovoljeno prodajati, posojati ali
          drugače prenašati na drugo osebo.</p>`,
      },
      {
        title: "5. Brezplačni osnovni pregled",
        body: `
          <p>Uporabnik lahko pred odklepom podrobnega pregleda prejme omejen osnovni prikaz rezultatov.</p>
          <p>Obseg brezplačnega prikaza se lahko razlikuje glede na vrsto poizvedbe in trenutno različico storitve.
          Natančnejši podatki, zemljevid, podrobni rezultati in PDF-poročila so lahko dostopni šele po prijavi
          in porabi ustreznega števila žetonov.</p>`,
      },
      {
        title: "6. Žetoni",
        body: `
          <p>Žetoni so namenjeni odklepanju podrobnih pregledov za izbrano lokacijo in izdelavi PDF-poročil.</p>
          <p>En žeton omogoča pregled ene lokacije za obdobje do 10 dni.</p>
          <p>Daljše obdobje se obračuna po začetih desetdnevnih obdobjih:</p>
          <ul>
            <li>od 1 do 10 dni: 1 žeton,</li>
            <li>od 11 do 20 dni: 2 žetona,</li>
            <li>od 21 do 30 dni: 3 žetoni.</li>
          </ul>
          <p>Pred potrditvijo odklepa je uporabniku prikazano število žetonov, ki bodo porabljeni.</p>
          <p>Sprememba lokacije se šteje kot nova poizvedba. Žetoni se pri novi poizvedbi ponovno obračunajo glede
          na izbrano obdobje.</p>
          <p>Kupljeni žetoni se pripišejo uporabniškemu računu in ne potečejo. Žetonov ni mogoče zamenjati za denar,
          razen kadar vračilo zahteva veljavna zakonodaja.</p>`,
      },
      {
        title: "7. Shranjevanje poizvedb",
        body: `
          <p>Plačane poizvedbe se samodejno shranijo v razdelku <a href="/moj-strelko">Moj Strelko</a>.</p>
          <p>Uporabnik si lahko že plačano poizvedbo kadar koli ponovno ogleda brez dodatne porabe žetonov.</p>
          <p>Brezplačni ponovni ogled velja za shranjeno poizvedbo z istimi parametri. Sprememba lokacije oziroma
          druga sprememba, zaradi katere nastane nova poizvedba, se obračuna po veljavnih pravilih porabe žetonov.</p>`,
      },
      {
        title: "8. PDF-poročila",
        body: `
          <p>Prva izdelava PDF-poročila za posamezno plačano poizvedbo porabi en dodaten žeton.</p>
          <p>Ponovna izdelava ali prenos PDF-poročila za isto lokacijo in radij ter za enako ali krajše obdobje
          znotraj že plačanega obdobja je brezplačna.</p>
          <p>PDF-poročilo je informativni izpis podatkov storitve Strelko. Ni uradno potrdilo o udaru strele,
          dokaz o vzroku škode ali zagotovilo, da bo zavarovalnica zahtevek sprejela.</p>`,
      },
      {
        title: "9. Paket Podpornik",
        body: `
          <p>Paket Podpornik je plačljiva digitalna storitev, ki omogoča dostop do dodatnih prikazov in funkcij,
          navedenih na strani <a href="/cenik">Cenik</a>.</p>
          <p>Paket lahko vključuje zlasti:</p>
          <ul>
            <li>celoten arhiv strel,</li>
            <li>napredne statistične prikaze,</li>
            <li>widget za spletno stran.</li>
          </ul>
          <p>Paket Podpornik ne vključuje žetonov za pregled udarov strel ob škodnem dogodku ali izdelave PDF-poročil.
          Žetone je treba kupiti posebej.</p>
          <p>Uporabnik lahko hkrati uporablja paket Podpornik in žetone.</p>`,
      },
      {
        title: "10. Trajanje in podaljševanje paketa Podpornik",
        body: `
          <p>Paket Podpornik velja 30 dni od uspešno izvedenega plačila.</p>
          <p>Če uporabnik naročnine ne prekliče, se paket po izteku plačanega obdobja samodejno podaljša za nadaljnjih
          30 dni, uporabniku pa se obračuna takrat veljavna cena.</p>
          <p>Uporabnik lahko samodejno podaljševanje kadar koli prekliče v razdelku <a href="/moj-strelko">Moj Strelko</a>.</p>
          <p>Po preklicu novih plačil ne bo, dostop do paketa Podpornik pa ostane aktiven do konca že plačanega obdobja.</p>
          <p>Trajanje pogodbe, način samodejnega podaljševanja in pogoji preklica so uporabniku prikazani tudi pred
          končno potrditvijo nakupa.</p>`,
      },
      {
        title: "11. Cene in plačilo",
        body: `
          <p>Veljavne cene so objavljene na strani <a href="/cenik">Cenik</a> in prikazane pred zaključkom nakupa.</p>
          <p>Vse cene za potrošnike vključujejo DDV, razen če je izrecno navedeno drugače.</p>
          <p>Plačilo se izvede prek izbranega ponudnika plačilnih storitev. Ponudnik Strelka praviloma ne prejme
          ali hrani celotnih podatkov o plačilni kartici.</p>
          <p>Po uspešnem plačilu se žetoni pripišejo uporabniškemu računu oziroma se aktivira paket Podpornik.
          Potrdilo o plačilu oziroma račun se uporabniku pošlje po e-pošti in je lahko dostopen tudi v razdelku
          <a href="/moj-strelko">Moj Strelko</a>.</p>`,
      },
      {
        title: "12. Sklenitev pogodbe",
        body: `
          <p>Uporabnik pred oddajo plačljivega naročila prejme povzetek izbrane ponudbe, cene, morebitnega samodejnega
          podaljševanja in drugih bistvenih pogojev.</p>
          <p>Pogodba je sklenjena, ko uporabnik potrdi naročilo z gumbom, ki jasno označuje obveznost plačila,
          in je plačilo uspešno izvedeno.</p>
          <p>Potrdilo o sklenjeni pogodbi se uporabniku pošlje na njegov e-poštni naslov oziroma shrani v uporabniškem računu.</p>
          <p>Pogodba se sklepa v slovenskem jeziku.</p>`,
      },
      {
        title: "13. Pravica potrošnika do odstopa",
        body: `
          <p>Potrošnik ima pri pogodbi, sklenjeni na daljavo, pravico do odstopa v roku 14 dni, razen v primerih,
          ko veljavna zakonodaja določa izjemo ali prenehanje te pravice.</p>
          <p>Kadar uporabnik zahteva takojšnjo aktivacijo paketa, odklep poizvedbe ali izdelavo PDF-poročila pred
          potekom odstopnega roka, mora pred izvedbo podati izrecno zahtevo oziroma soglasje, kadar ga zahteva zakon.</p>
          <p>Posledice takojšnjega začetka izvajanja, morebitno sorazmerno plačilo že opravljene storitve ter prenehanje
          pravice do odstopa se presojajo skladno z veljavno zakonodajo.</p>
          <p>Odstop lahko uporabnik sporoči na <a href="mailto:${COMPANY.email}">${COMPANY.email}</a> z nedvoumno izjavo.</p>`,
      },
      {
        title: "14. Skladnost digitalne storitve in reklamacije",
        body: `
          <p>Ponudnik zagotavlja storitev skladno z opisom ponudbe in veljavno zakonodajo.</p>
          <p>Če storitev ni dobavljena, ne deluje ali ni skladna z dogovorjenimi lastnostmi, lahko uporabnik ponudnika
          o tem obvesti na <a href="mailto:${COMPANY.email}">${COMPANY.email}</a>.</p>
          <p>Uporabnik naj v sporočilu navede:</p>
          <ul>
            <li>e-poštni naslov uporabniškega računa,</li>
            <li>opis težave,</li>
            <li>čas nastanka težave,</li>
            <li>številko poizvedbe ali plačila, kadar je na voljo.</li>
          </ul>
          <p>Ta določila ne omejujejo zakonskih pravic potrošnika zaradi neskladnosti digitalne vsebine ali digitalne storitve.</p>`,
      },
      {
        title: "15. Dostopnost in spremembe storitve",
        body: `
          <p>Ponudnik si prizadeva zagotavljati zanesljivo delovanje storitve, vendar ne zagotavlja neprekinjene
          dostopnosti brez začasnih prekinitev.</p>
          <p>Dostop je lahko začasno omejen zaradi vzdrževanja, varnostnih posodobitev, izpadov zunanjih ponudnikov,
          višje sile ali drugih tehničnih razlogov.</p>
          <p>Ponudnik lahko storitev posodablja in spreminja, kadar je to potrebno zaradi varnosti, tehničnega razvoja,
          sprememb podatkovnih virov ali zakonodaje. Spremembe ne smejo neupravičeno zmanjševati že plačanih pravic uporabnika.</p>`,
      },
      {
        title: "16. Prepovedana uporaba",
        body: `
          <p>Uporabnik storitve ne sme uporabljati za:</p>
          <ul>
            <li>nepooblaščeno avtomatizirano pridobivanje podatkov,</li>
            <li>poseganje v delovanje ali varnost sistema,</li>
            <li>izogibanje plačilnim ali dostopnim omejitvam,</li>
            <li>posredovanje zavajajočih ali neresničnih predstavitev podatkov,</li>
            <li>kršitve pravic ponudnika ali tretjih oseb,</li>
            <li>druga nezakonita ravnanja.</li>
          </ul>
          <p>Ponudnik lahko ob resni ali ponavljajoči se kršitvi začasno omeji ali ukine dostop, pri čemer upošteva
          zakonske in že plačane pravice uporabnika.</p>`,
      },
      {
        title: "17. Avtorske in druge pravice",
        body: `
          <p>Programska oprema, grafična podoba, besedila, zbirke podatkov, zemljevidi, logotipi in druge vsebine Strelka
          so varovane z avtorskimi in drugimi pravicami ponudnika oziroma njegovih partnerjev.</p>
          <p>Uporabnik lahko rezultate in PDF-poročila uporablja za lastne potrebe in komunikacijo v zvezi s konkretnim primerom.</p>
          <p>Množično kopiranje, nadaljnja prodaja, javno objavljanje podatkovnih zbirk ali komercialna ponovna uporaba
          brez dovoljenja ponudnika niso dovoljeni.</p>`,
      },
      {
        title: "18. Omejitev odgovornosti",
        body: `
          <p>Ponudnik ne odgovarja za odločitve uporabnika, zavarovalnice ali tretjih oseb, ki temeljijo izključno
          na informativnih podatkih storitve.</p>
          <p>Ponudnik prav tako ne odgovarja za začasne prekinitve ali napake, ki nastanejo zaradi zunanjih podatkovnih
          virov, ponudnikov gostovanja, elektronskih komunikacij ali okoliščin, na katere nima razumnega vpliva.</p>
          <p>Nič v teh pogojih ne izključuje ali omejuje odgovornosti, ki je po veljavni zakonodaji ni dovoljeno
          izključiti, niti zakonskih pravic potrošnika.</p>`,
      },
      {
        title: "19. Pritožbe in reševanje sporov",
        body: `
          <p>Uporabnik lahko pritožbo pošlje na <a href="mailto:${COMPANY.email}">${COMPANY.email}</a>. Ponudnik bo pritožbo
          obravnaval v razumnem roku in uporabniku odgovoril po e-pošti.</p>
          <p>Za pogodbeno razmerje se uporablja pravo Republike Slovenije, pri čemer potrošnik ohrani obvezno varstvo,
          ki mu pripada po veljavnih predpisih.</p>
          <p>Za spore je pristojno sodišče, določeno po veljavnih pravilih o krajevni in stvarni pristojnosti.</p>
          <p>${COMPANY.shortName} ne priznava nobenega izvajalca izvensodnega reševanja potrošniških sporov kot pristojnega
          za reševanje potrošniškega spora, ki bi ga potrošnik lahko sprožil v skladu z Zakonom o izvensodnem reševanju
          potrošniških sporov.</p>`,
      },
      {
        title: "20. Varstvo osebnih podatkov",
        body: `
          <p>Obdelava osebnih podatkov je podrobneje opisana v
          <a href="/zasebnost">Politiki zasebnosti</a>.</p>
          <p>Uporabnik lahko vprašanja o varstvu osebnih podatkov pošlje na
          <a href="mailto:${COMPANY.privacyEmail}">${COMPANY.privacyEmail}</a>.</p>`,
      },
      {
        title: "21. Spremembe pogojev",
        body: `
          <p>Ponudnik lahko pogoje spremeni zaradi razvoja storitve, sprememb zakonodaje ali poslovnih in varnostnih razlogov.</p>
          <p>O pomembnih spremembah, ki vplivajo na aktivno naročnino ali že plačane pravice, bo uporabnik pravočasno
          obveščen na primeren način.</p>
          <p>Za posamezen nakup velja različica pogojev, ki je bila uporabniku dostopna ob sklenitvi pogodbe, razen kadar
          zakon ali uporabnikovo soglasje določa drugače.</p>`,
      },
      {
        title: "22. Končne določbe",
        body: `
          <p>Če je posamezna določba teh pogojev neveljavna ali neizvršljiva, to ne vpliva na veljavnost preostalih določb.</p>
          <p>Za vprašanja glede pogojev se lahko uporabnik obrne na:</p>
          <p><a href="mailto:${COMPANY.email}">${COMPANY.email}</a></p>`,
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
            `<a href="${page.path}" class="legal-nav-link${id === currentId ? " is-active" : ""}" data-legal="${id}">${page.navTitle ?? page.title}</a>`
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
      <h1 class="legal-title">${page.title}</h1>
      <p class="legal-meta">Zadnja posodobitev: ${page.updated ?? COMPANY.updated}</p>
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
