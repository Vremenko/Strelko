// @ts-nocheck
/** Pravne informacije – vsebina strani (prej legal.js). */

export const COMPANY = {
  legalName: "Meteoinfo, vremenske informacije, raziskave in storitve, d.o.o.",
  shortName: "Meteoinfo d.o.o.",
  address: "Ženjak 4",
  postal: "2234 Benedikt",
  country: "Slovenija",
  email: "podpora@meteoinfo.si",
  privacyEmail: "podpora@meteoinfo.si",
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
          <p>Spletna stran podjetja:<br />
          <a href="${COMPANY.website}" target="_blank" rel="noopener">meteoinfo.si</a></p>`,
      },
    ],
  },
  terms: {
    path: "/pogoji-uporabe",
    title: "Pogoji uporabe storitve Strelko",
    navTitle: "Pogoji uporabe",
    updated: "19. 7. 2026",
    sections: [
      {
        title: "1. Splošno",
        body: `
          <p>Ti pogoji uporabe urejajo dostop do spletne storitve Strelko, uporabo brezplačnih in plačljivih funkcij,
          nakup ter porabo žetonov, naročnino Podpornik in izdelavo PDF-poročil.</p>
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
          <p>Z aktivacijo paketa Podpornik uporabnik sklene mesečno naročnino na digitalno storitev Strelko. Naročnina
          se samodejno podaljšuje vsak mesec do preklica. Uporabnik jo lahko kadar koli prekliče v razdelku
          <a href="/moj-strelko">Moj Strelko</a>. Po preklicu ostane paket aktiven do konca že plačanega obračunskega
          obdobja, nato pa se ne podaljša več.</p>
          <p>Posebne pisne pogodbe ob aktivaciji naročnine ne podpisujete; naročnina se sklene na daljavo prek spletne
          strani.</p>
          <p>Paket lahko vključuje zlasti:</p>
          <ul>
            <li>celoten arhiv strel,</li>
            <li>napredne statistične prikaze,</li>
            <li>widget za spletno stran.</li>
          </ul>
          <p>Paket Podpornik ne vključuje žetonov za pregled udarov strel ob škodnem dogodku ali izdelave PDF-poročil.
          Žetone je treba kupiti posebej (enkratni nakup, ne naročnina).</p>
          <p>Uporabnik lahko hkrati uporablja naročnino Podpornik in žetone.</p>`,
      },
      {
        title: "10. Trajanje in podaljševanje naročnine Podpornik",
        body: `
          <p>Naročnina Podpornik velja za plačano obračunsko obdobje 30 dni od uspešno izvedenega plačila oziroma
          aktivacije naročnine.</p>
          <p>Če uporabnik naročnine ne prekliče, se po izteku plačanega obračunskega obdobja samodejno mesečno
          podaljša za nadaljnjih 30 dni, uporabniku pa se obračuna takrat veljavna cena.</p>
          <p>Uporabnik lahko naročnino kadar koli prekliče v razdelku <a href="/moj-strelko">Moj Strelko</a>.</p>
          <p>Po preklicu naročnine novih plačil ne bo, dostop do paketa Podpornik pa ostane aktiven do konca že
          plačanega obračunskega obdobja.</p>
          <p>Trajanje naročnine, način samodejnega mesečnega podaljševanja in pogoji preklica so uporabniku prikazani
          tudi pred končno potrditvijo nakupa. Ob aktivaciji gre za pogodbo, sklenjeno na daljavo, v smislu
          potrošniške zakonodaje.</p>`,
      },
      {
        title: "11. Cene in plačilo",
        body: `
          <p>Veljavne cene so objavljene na strani <a href="/cenik">Cenik</a> in prikazane pred zaključkom nakupa.</p>
          <p>Vse cene za potrošnike vključujejo DDV, razen če je izrecno navedeno drugače.</p>
          <p>Plačilo se izvede prek izbranega ponudnika plačilnih storitev. Ponudnik Strelka praviloma ne prejme
          ali hrani celotnih podatkov o plačilni kartici.</p>
          <p>Po uspešnem plačilu se žetoni pripišejo uporabniškemu računu oziroma se aktivira naročnina Podpornik.
          Potrdilo o plačilu oziroma račun se uporabniku pošlje po e-pošti in je lahko dostopen tudi v razdelku
          <a href="/moj-strelko">Moj Strelko</a>.</p>`,
      },
      {
        title: "12. Sklenitev pogodbe",
        body: `
          <p>Uporabnik pred oddajo plačljivega naročila prejme povzetek izbrane ponudbe, cene, morebitnega samodejnega
          mesečnega podaljševanja naročnine in drugih bistvenih pogojev.</p>
          <p>Pogodba, sklenjena na daljavo, nastane, ko uporabnik potrdi naročilo z gumbom, ki jasno označuje obveznost
          plačila, in je plačilo uspešno izvedeno. Pri paketu Podpornik gre za aktivacijo mesečne spletne naročnine;
          posebne pisne pogodbe ne podpisujete.</p>
          <p>Potrdilo o sklenjeni pogodbi se uporabniku pošlje na njegov e-poštni naslov oziroma shrani v uporabniškem računu.</p>
          <p>Pogodba se sklepa v slovenskem jeziku.</p>`,
      },
      {
        title: "13. Pravica potrošnika do odstopa",
        body: `
          <p>Potrošnik ima pri pogodbi, sklenjeni na daljavo, pravico do odstopa v roku 14 dni, razen v primerih,
          ko veljavna zakonodaja določa izjemo ali prenehanje te pravice.</p>
          <p>Kadar uporabnik zahteva takojšnjo aktivacijo naročnine Podpornik, odklep poizvedbe ali izdelavo PDF-poročila
          pred potekom odstopnega roka, mora pred izvedbo podati izrecno zahtevo oziroma soglasje, kadar ga zahteva
          zakon.</p>
          <p>Posledice takojšnjega začetka izvajanja, morebitno sorazmerno plačilo že opravljene storitve ter prenehanje
          pravice do odstopa se presojajo skladno z veljavno zakonodajo.</p>
          <p>Preklic naročnine Podpornik (ustavitev prihodnjih samodejnih podaljšanj) ni enak odstopu od pogodbe.</p>
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
    title: "Politika zasebnosti storitve Strelko",
    navTitle: "Politika zasebnosti",
    updated: "19. 7. 2026",
    sections: [
      {
        title: "1. Upravljavec osebnih podatkov",
        body: `
          <p>Upravljavec osebnih podatkov je:</p>
          <p><strong>${COMPANY.legalName}</strong></p>
          <p>Kratka firma: ${COMPANY.shortName}</p>
          <p>Sedež: ${COMPANY.address}, ${COMPANY.postal}, ${COMPANY.country}</p>
          <p>E-pošta za vprašanja glede zasebnosti:
          <a href="mailto:${COMPANY.privacyEmail}">${COMPANY.privacyEmail}</a></p>
          <p>Celotni podatki o podjetju so objavljeni v
          <a href="/impressum">Impressumu</a>.</p>`,
      },
      {
        title: "2. Namen politike zasebnosti",
        body: `
          <p>Ta politika pojasnjuje, katere osebne podatke obdelujemo pri uporabi storitve Strelko, za katere namene jih
          uporabljamo, na katerih pravnih podlagah jih obdelujemo, komu jih lahko posredujemo, kako dolgo jih hranimo
          in katere pravice imajo uporabniki.</p>
          <p>Politika velja za spletno stran Strelko, uporabniški račun Moj Strelko, poizvedbe o udarih strel,
          PDF-poročila, nakupe žetonov, paket Podpornik, podporo uporabnikom in druge povezane funkcije storitve.</p>`,
      },
      {
        title: "3. Katere podatke obdelujemo",
        body: `
          <h3>3.1 Podatki uporabniškega računa</h3>
          <p>Ob uporabi računa Moj Strelko obdelujemo:</p>
          <ul>
            <li>e-poštni naslov;</li>
            <li>interni identifikator uporabniškega računa;</li>
            <li>podatke o načinu prijave (e-pošta in geslo ali Google);</li>
            <li>status aktivnosti in potrditve e-poštnega naslova;</li>
            <li>datum ustvaritve računa in podatke o zadnji uporabi;</li>
            <li>stanje žetonov in zgodovino porabe žetonov;</li>
            <li>stanje paketa Podpornik, podatke o naročnini Ob škodi in nastavitve widgeta občine (če jih uporabnik
            konfigurira);</li>
            <li>če uporabnik vklopi opozorila MeteoAlarm: telefonsko številko (za SMS), nastavitve e-poštnega
            opozarjanja, shranjeno lokacijo in radij opozorila.</li>
          </ul>
          <p>Pri prijavi z Googlom prejmemo samo podatke, ki jih Google posreduje v okviru uporabljene prijavne povezave
          in jih Strelko potrebuje za ustvaritev oziroma prepoznavo uporabniškega računa. V praksi to pomeni
          <strong>preverjen e-poštni naslov</strong> iz Google računa. Google profilnega imena, profilne slike ali
          uporabniškega gesla ne shranjujemo; računi, ustvarjeni prek Google prijave, nimajo gesla za prijavo v Strelko.</p>
          <p>Pri registraciji ali prijavi z e-pošto in geslom hranimo e-poštni naslov in geslo v
          <strong>varno zgoščeni obliki</strong> na strežniku. Geslo v čistem besedilu ne shranjujemo in ga ne moremo
          prebrati.</p>
          <h3>3.2 Podatki o poizvedbah in PDF-poročilih</h3>
          <p>Ob izvedbi poizvedbe o udarih strel in ob izdelavi PDF-poročila obdelujemo:</p>
          <ul>
            <li>vneseni ali izbrani naslov oziroma lokacija;</li>
            <li>koordinate izbrane lokacije;</li>
            <li>izbrano obdobje in radij iskanja;</li>
            <li>datum in čas izvedbe poizvedbe;</li>
            <li>rezultat poizvedbe in povezane podatke o zaznanih udarih strel;</li>
            <li>število porabljenih žetonov;</li>
            <li>podatke o izdelavi in prenosu PDF-poročila (vključno s podatkom, ali je bilo poročilo že zaračunano);</li>
            <li>tehnični identifikator poizvedbe.</li>
          </ul>
          <p>Naslov oziroma lokacija, ki jo uporabnik vnese ali izbere, se poveže z njegovim uporabniškim računom in
          zgodovino poizvedb. Uporabnik naj ne vnaša osebnih podatkov drugih oseb, ki za izvedbo poizvedbe niso
          potrebni.</p>
          <p>Pri izbiri lokacije na zemljevidu lahko uporabnik prostovoljno uporabi lokacijo naprave. V tem primeru
          brskalnik posreduje koordinate naprave le za izbrano mesto iskanja; Strelko ne zbirno ne spremlja lokacije
          naprave.</p>
          <p>PDF-poročilo se ob prenosu izdeluje na strežniku iz shranjenega rezultata poizvedbe. Datoteka PDF se v
          brskalniku ne hrani trajno; na strežniku hranimo podatke o poizvedbi in o zaračunanem PDF-poročilu, ne pa
          ločenega trajnega arhiva PDF-datotek.</p>
          <h3>3.3 Podatki o nakupih, plačilih in naročnini</h3>
          <p>Ob nakupu žetonov, paketa Podpornik ali naročnine Ob škodi obdelujemo:</p>
          <ul>
            <li>izbrano ponudbo in količino žetonov;</li>
            <li>ceno, valuto in davčne podatke transakcije;</li>
            <li>stanje in čas plačila;</li>
            <li>identifikator transakcije in povezane identifikatorje pri ponudniku plačil;</li>
            <li>datum začetka, podaljšanja, preklica in poteka paketa Podpornik oziroma naročnine Ob škodi;</li>
            <li>podatke, potrebne za izdajo računa, kadar jih uporabnik posreduje.</li>
          </ul>
          <p>Podatke o plačilni kartici praviloma neposredno obdeluje ponudnik plačilnih storitev. Meteoinfo ne prejme
          in ne hrani celotne številke plačilne kartice, varnostne kode kartice ali drugih podatkov, ki jih za izvedbo
          plačila ne potrebuje. Plačilo poteka prek varne povezave ponudnika plačil.</p>
          <h3>3.4 Komunikacija z uporabniki</h3>
          <p>Ob stiku z nami za podporo ali druge poizvedbe obdelujemo:</p>
          <ul>
            <li>vsebino sporočila;</li>
            <li>ime in kontaktne podatke pošiljatelja;</li>
            <li>podatke o uporabniškem računu, poizvedbi ali plačilu, ki jih uporabnik navede;</li>
            <li>zgodovino komunikacije in reševanja zahtevka.</li>
          </ul>
          <h3>3.5 Tehnični in varnostni podatki</h3>
          <p>Ob uporabi storitve samodejno nastanejo in se obdelujejo:</p>
          <ul>
            <li>naslov IP;</li>
            <li>datum in čas dostopa;</li>
            <li>obiskane strani oziroma uporabljene funkcije;</li>
            <li>vrsta naprave, operacijski sistem in brskalnik (user-agent);</li>
            <li>identifikatorji seje in prijavnega žetona;</li>
            <li>zapisi o prijavah, napakah in varnostnih dogodkih;</li>
            <li>nujni piškotki in podobne tehnologije v brskalniku (localStorage in sessionStorage), potrebne za prijavo,
            varnost, ohranjanje seje in delovanje izbranih funkcij – glej tudi
            <a href="/piskotki">Politiko piškotkov</a>.</li>
          </ul>`,
      },
      {
        title: "4. Nameni in pravne podlage",
        body: `
          <table class="legal-table">
            <thead>
              <tr><th>Obdelava</th><th>Namen</th><th>Pravna podlaga</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Ustvaritev in upravljanje uporabniškega računa</td>
                <td>Ustvaritev računa, prijava, prepoznava uporabnika in zagotavljanje funkcij Moj Strelko.</td>
                <td>Izvajanje pogodbe oziroma ukrepi pred sklenitvijo pogodbe – člen 6(1)(b) GDPR.</td>
              </tr>
              <tr>
                <td>Izvajanje poizvedb in izdelava PDF-poročil</td>
                <td>Izvedba uporabnikove zahteve, shranjevanje poizvedb, prikaz rezultatov, obračun žetonov in izdelava
                PDF-poročil.</td>
                <td>Izvajanje pogodbe – člen 6(1)(b) GDPR.</td>
              </tr>
              <tr>
                <td>Nakup žetonov in paket Podpornik</td>
                <td>Obdelava naročila, plačila, aktivacije, podaljšanja ali preklica naročnine ter zagotavljanje
                kupljenih funkcij.</td>
                <td>Izvajanje pogodbe – člen 6(1)(b) GDPR.</td>
              </tr>
              <tr>
                <td>Računi in poslovne evidence</td>
                <td>Izdajanje računov, računovodstvo, davčne evidence in izpolnjevanje drugih zakonskih obveznosti.</td>
                <td>Izpolnitev zakonske obveznosti – člen 6(1)(c) GDPR.</td>
              </tr>
              <tr>
                <td>Podpora uporabnikom</td>
                <td>Odgovarjanje na vprašanja, reševanje napak, reklamacij in zahtevkov uporabnikov.</td>
                <td>Izvajanje pogodbe oziroma zakoniti interes ponudnika za podporo uporabnikom in izboljševanje
                storitve – člen 6(1)(b) oziroma 6(1)(f) GDPR.</td>
              </tr>
              <tr>
                <td>Varnost in preprečevanje zlorab</td>
                <td>Varovanje uporabniških računov in storitve, odkrivanje zlorab, preprečevanje nepooblaščenih
                dostopov ter odpravljanje tehničnih težav.</td>
                <td>Zakoniti interesi ponudnika za zagotavljanje varne, zanesljive in učinkovite storitve –
                člen 6(1)(f) GDPR.</td>
              </tr>
              <tr>
                <td>Uveljavljanje in obramba pravnih zahtevkov</td>
                <td>Dokazovanje izvedenih naročil in plačil ter uveljavljanje ali obramba pravnih zahtevkov.</td>
                <td>Zakoniti interes ponudnika – člen 6(1)(f) GDPR oziroma izpolnitev zakonskih obveznosti.</td>
              </tr>
            </tbody>
          </table>`,
      },
      {
        title: "5. Od kod pridobimo podatke",
        body: `
          <p>Večino osebnih podatkov pridobimo neposredno od uporabnika, ko ustvari račun, izvede poizvedbo, opravi
          nakup ali stopi v stik z nami.</p>
          <p>Nekatere podatke lahko prejmemo od ponudnika prijave, ponudnika plačilnih storitev ali drugih ponudnikov,
          ki jih uporabnik izbere za uporabo storitve.</p>
          <p>Tehnični podatki nastanejo samodejno ob uporabi spletne strani in informacijskega sistema.</p>`,
      },
      {
        title: "6. Ali je posredovanje podatkov obvezno",
        body: `
          <p>Podatki, označeni kot obvezni, so potrebni za ustvaritev računa, izvedbo poizvedbe, plačilo ali uporabo
          druge zahtevane funkcije. Če jih uporabnik ne posreduje, mu te funkcije morda ne bomo mogli zagotoviti.</p>
          <p>Podatki, ki niso potrebni za izvajanje storitve ali izpolnitev zakonskih obveznosti, so prostovoljni.</p>`,
      },
      {
        title: "7. Komu lahko posredujemo podatke",
        body: `
          <p>Osebnih podatkov ne prodajamo.</p>
          <p>Do podatkov lahko v obsegu, potrebnem za izvedbo posamezne naloge, dostopajo:</p>
          <ul>
            <li>ponudniki gostovanja, infrastrukture in tehničnega vzdrževanja;</li>
            <li>ponudniki prijave in upravljanja identitete;</li>
            <li>ponudniki pošiljanja sistemske e-pošte;</li>
            <li>ponudniki plačilnih storitev;</li>
            <li>računovodski in drugi strokovni izvajalci;</li>
            <li>ponudniki zemljevidov, če jim brskalnik ob nalaganju zemljevida posreduje tehnične podatke;</li>
            <li>državni organi, sodišča ali druge osebe, kadar posredovanje zahteva zakon.</li>
          </ul>
          <p>Med ključnimi zunanjimi ponudniki, ki jih Strelko dejansko uporablja, so:</p>
          <ul>
            <li><strong>Google</strong> – prijava z Google računom (Google Identity Services). Politika zasebnosti:
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com/privacy</a>.</li>
            <li><strong>Stripe</strong> – obdelava plačil in naročnin (preusmeritev na varno plačilno stran). Politika
            zasebnosti:
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener">stripe.com/privacy</a>.</li>
            <li><strong>MapTiler</strong> – prikaz zemljevidnih slojev v brskalniku. Politika zasebnosti:
            <a href="https://www.maptiler.com/privacy-policy/" target="_blank" rel="noopener">maptiler.com/privacy-policy</a>.</li>
            <li><strong>Twilio</strong> – pošiljanje SMS opozoril MeteoAlarm, le če uporabnik vklopi SMS opozorila in
            posreduje telefonsko številko. Politika zasebnosti:
            <a href="https://www.twilio.com/legal/privacy" target="_blank" rel="noopener">twilio.com/legal/privacy</a>.</li>
          </ul>
          <p>Iskanje naslovov in predlogov lokacij poteka prek lastnega strežnika Strelko; geokodirni podatki se
          ne posredujejo zunanjemu ponudniku geokodiranja ob vsaki poizvedbi.</p>
          <p>Z zunanjimi izvajalci, ki podatke obdelujejo v našem imenu, ustrezno uredimo varstvo osebnih podatkov in
          jim dovolimo obdelavo samo za dogovorjene namene.</p>`,
      },
      {
        title: "8. Prenosi podatkov izven Evropskega gospodarskega prostora",
        body: `
          <p>Nekateri zunanji ponudniki lahko osebne podatke obdelujejo tudi v državah zunaj Evropskega gospodarskega
          prostora, zlasti pri storitvah Google, Stripe, MapTiler in Twilio.</p>
          <p>Kadar pride do takega prenosa, se podatki prenašajo samo na podlagi ustreznega pravnega mehanizma, kot so
          sklep Evropske komisije o ustreznosti, standardne pogodbene klavzule ali drug mehanizem, ki ga dovoljuje
          GDPR.</p>`,
      },
      {
        title: "9. Kako dolgo hranimo podatke",
        body: `
          <h3>Uporabniški račun</h3>
          <p>Podatke uporabniškega računa hranimo, dokler je račun aktiven oziroma dokler jih potrebujemo za
          zagotavljanje storitve. Po izbrisu računa jih izbrišemo ali anonimiziramo, razen podatkov, ki jih moramo
          hraniti zaradi zakonskih obveznosti, varnosti ali pravnih zahtevkov.</p>
          <h3>Poizvedbe in PDF-poročila</h3>
          <p>Poizvedbe, podatke o porabi žetonov in podatke o PDF-poročilih hranimo kot del uporabniškega računa, da
          si jih lahko uporabnik ponovno ogleda. Ob izbrisu računa jih izbrišemo ali anonimiziramo, če za nadaljnjo
          hrambo ne obstaja druga pravna podlaga. PDF-datoteka se ob prenosu izdeluje na zahtevo in se ločeno od zapisa
          poizvedbe ne arhivira.</p>
          <h3>Plačila in računi</h3>
          <p>Podatke o plačilih, računih in poslovnih dogodkih hranimo toliko časa, kot to zahtevajo davčni,
          računovodski in drugi veljavni predpisi.</p>
          <h3>Podpora uporabnikom</h3>
          <p>Komunikacijo z uporabniki hranimo toliko časa, kot je potrebno za obravnavo vprašanja ali zahtevka, nato
          pa do poteka obdobja, v katerem je lahko pomembna za dokazovanje izvedene komunikacije ali uveljavljanje
          pravnih zahtevkov.</p>
          <h3>Tehnični in varnostni dnevniki</h3>
          <p>Tehnične in varnostne dnevnike hranimo omejeno obdobje, potrebno za zagotavljanje varnosti,
          diagnosticiranje napak in preprečevanje zlorab. Konkretni roki brisanja so določeni interno in se lahko
          razlikujejo glede na vrsto dnevnika.</p>
          <h3>Varnostne kopije</h3>
          <p>Podatki so lahko še omejeno obdobje prisotni v varnostnih kopijah, dokler se te ne prepišejo v skladu z
          običajnim ciklom varnostnega kopiranja.</p>`,
      },
      {
        title: "10. Varovanje podatkov",
        body: `
          <p>Izvajamo primerne tehnične in organizacijske ukrepe za varovanje podatkov pred izgubo, nepooblaščenim
          dostopom, razkritjem, spreminjanjem ali uničenjem.</p>
          <p>Dostop do osebnih podatkov je omejen na osebe in izvajalce, ki ga potrebujejo za opravljanje svojih
          nalog.</p>
          <p>Kljub varnostnim ukrepom noben prenos ali informacijski sistem ne more zagotoviti popolne varnosti.</p>`,
      },
      {
        title: "11. Pravice uporabnikov",
        body: `
          <p>Uporabnik lahko glede na okoliščine in veljavno zakonodajo zahteva:</p>
          <ul>
            <li>dostop do svojih osebnih podatkov;</li>
            <li>popravek netočnih ali dopolnitev nepopolnih podatkov;</li>
            <li>izbris osebnih podatkov;</li>
            <li>omejitev obdelave;</li>
            <li>prenosljivost podatkov;</li>
            <li>ugovor obdelavi, ki temelji na zakonitem interesu;</li>
            <li>preklic privolitve, kadar obdelava temelji na privolitvi.</li>
          </ul>
          <p>Preklic privolitve ne vpliva na zakonitost obdelave, izvedene pred njenim preklicem.</p>
          <p>Posamezne pravice niso absolutne in so lahko omejene, kadar nadaljnjo obdelavo zahteva zakon ali obstaja
          druga veljavna pravna podlaga.</p>
          <p>Zahtevo lahko uporabnik pošlje na
          <a href="mailto:${COMPANY.privacyEmail}">${COMPANY.privacyEmail}</a>. Zaradi varstva podatkov lahko pred
          izvedbo zahteve preverimo identiteto vlagatelja.</p>`,
      },
      {
        title: "12. Pritožba pri nadzornem organu",
        body: `
          <p>Če uporabnik meni, da njegove osebne podatke obdelujemo v nasprotju s predpisi, ima pravico vložiti
          pritožbo pri:</p>
          <p><strong>Informacijski pooblaščenec Republike Slovenije</strong></p>
          <p>Dunajska cesta 22, 1000 Ljubljana</p>
          <p>E-pošta: <a href="mailto:gp.ip@ip-rs.si">gp.ip@ip-rs.si</a></p>
          <p>Spletna stran: <a href="https://www.ip-rs.si" target="_blank" rel="noopener">ip-rs.si</a></p>`,
      },
      {
        title: "13. Piškotki in podobne tehnologije",
        body: `
          <p>Strelko uporablja nujne piškotke in podobne tehnologije, ki so potrebni za prijavo, varnost, ohranjanje
          uporabniške seje in delovanje izbranih funkcij. V praksi gre predvsem za shranjevanje v
          <strong>localStorage</strong> (npr. prijavni žeton, izbira glede obvestila o zasebnosti, nastavitve zemljevida)
          in <strong>sessionStorage</strong> (npr. začasno ohranjanje rezultata iskanja med brskanjem).</p>
          <p>Strelko uporablja lastno nameščeno analitiko Umami za pripravo zasebnosti prijazne zbirne statistike
          obiska. Analitika se vključi samo, če jo uporabnik izrecno dovoli. Umami na Strelku ne uporablja
          HTTP-piškotkov. Oglaševalskih piškotkov tretjih oseb ne uporabljamo.</p>
          <p>Podrobnejše informacije o uporabljenih tehnologijah, namenu in trajanju so objavljene v
          <a href="/piskotki">Politiki piškotkov</a>.</p>`,
      },
      {
        title: "14. Avtomatizirano odločanje",
        body: `
          <p>Strelko ne izvaja avtomatiziranega odločanja ali profiliranja, ki bi za uporabnika ustvarjalo pravne ali
          podobno pomembne učinke.</p>`,
      },
      {
        title: "15. Povezave do drugih spletnih strani",
        body: `
          <p>Storitev lahko vsebuje povezave do spletnih strani ali storitev drugih ponudnikov. Za njihove postopke
          obdelave osebnih podatkov veljajo njihove lastne politike zasebnosti.</p>`,
      },
      {
        title: "16. Spremembe politike zasebnosti",
        body: `
          <p>Politiko zasebnosti lahko občasno posodobimo zaradi sprememb storitve, načina obdelave podatkov ali
          zakonodaje.</p>
          <p>Datum zadnje posodobitve je naveden na vrhu dokumenta. O pomembnih spremembah bomo uporabnike po potrebi
          obvestili tudi prek storitve ali e-pošte.</p>`,
      },
      {
        title: "17. Kontakt",
        body: `
          <p>Za vprašanja, zahteve ali pripombe v zvezi z obdelavo osebnih podatkov se lahko obrnete na:</p>
          <p><strong>${COMPANY.shortName}</strong></p>
          <p>${COMPANY.address}, ${COMPANY.postal}, ${COMPANY.country}</p>
          <p>E-pošta: <a href="mailto:${COMPANY.privacyEmail}">${COMPANY.privacyEmail}</a></p>`,
      },
    ],
  },
  cookies: {
    path: "/piskotki",
    title: "Politika piškotkov in podobnih tehnologij",
    navTitle: "Politika piškotkov",
    updated: "19. 7. 2026",
    sections: [
      {
        title: "1. Kaj so piškotki in podobne tehnologije?",
        body: `
          <p>Piškotki so majhne besedilne datoteke, ki jih spletna stran shrani v brskalnik oziroma napravo
          uporabnika. Strelko lahko za delovanje uporablja tudi druge podobne tehnologije, kot sta lokalna in sejna
          shramba brskalnika.</p>
          <p>Te tehnologije omogočajo delovanje prijave, ohranjanje uporabniške seje, varnost, pomnjenje
          uporabnikovih nastavitev in izvajanje drugih funkcij spletne strani.</p>
          <p>Strelko v kodi spletne strani <strong>ne uporablja branja ali pisanja HTTP piškotkov</strong>
          (<code>document.cookie</code>). Shranjevanje poteka prek lokalne in sejne shrambe brskalnika ter prek
          omrežnih povezav do zunanjih ponudnikov, kjer je to opisano spodaj.</p>`,
      },
      {
        title: "2. Kdo upravlja spletno stran?",
        body: `
          <p>Upravljavec spletne strani Strelko je:</p>
          <p><strong>${COMPANY.legalName}</strong></p>
          <p>${COMPANY.address}, ${COMPANY.postal}, ${COMPANY.country}</p>
          <p>E-pošta: <a href="mailto:${COMPANY.privacyEmail}">${COMPANY.privacyEmail}</a></p>
          <p>Podrobnejši podatki o podjetju so objavljeni v <a href="/impressum">Impressumu</a>.</p>`,
      },
      {
        title: "3. Katere vrste tehnologij uporabljamo?",
        body: `
          <h3>Nujne tehnologije</h3>
          <p>Nujne tehnologije so potrebne za osnovno delovanje spletne strani, prijavo, varnost, uporabniško sejo,
          izvedbo uporabnikove zahteve ali shranitev njegove izbire glede piškotkov. Brez njih posamezne funkcije
          Strelka ne morejo pravilno delovati.</p>
          <p>Za uporabo nujnih tehnologij privolitev uporabnika ni potrebna.</p>
          <h3>Funkcionalne tehnologije</h3>
          <p>Strelko uporablja tudi omejene funkcionalne zapise, ki niso nujni za osnovni dostop do strani, vendar
          olajšajo uporabo storitve, ki jo je uporabnik izbral:</p>
          <ul>
            <li>shranjevanje nastavitev prikaza zemljevida med obiski;</li>
            <li>začasno ohranitev rezultata iskanja in povezave s shranjeno poizvedbo med enim obiskom zavihka.</li>
          </ul>
          <p>Te zapise ne uporabljamo za profiliranje, analitiko ali oglaševanje. Naložijo se brez ločenega
          soglasja, ker ne nadomeščajo osnovnega delovanja strani in ne spremljajo uporabnika med spletnimi mesti.</p>
          <h3>Analitične tehnologije</h3>
          <p>Strelko uporablja lastno nameščeno analitiko <strong>Umami</strong> za pripravo zasebnosti prijazne
          zbirne statistike obiska (npr. število ogledov, referer, tip naprave). Analitika se vključi samo, če
          uporabnik v obvestilu ali v nastavitvah zasebnosti izbere <strong>Dovoli analitiko</strong>. Umami na
          Strelku ne uporablja HTTP-piškotkov. Pri izbiri <strong>Samo nujno</strong> se analitika ne naloži.</p>
          <h3>Trženjske tehnologije</h3>
          <p>Strelko trenutno ne uporablja oglaševalskih ali trženjskih piškotkov.</p>`,
      },
      {
        title: "4. Seznam uporabljenih piškotkov in podobnih tehnologij",
        body: `
          <table class="legal-table">
            <thead>
              <tr>
                <th>Ime</th>
                <th>Ponudnik oziroma domena</th>
                <th>Vrsta shrambe</th>
                <th>Namen</th>
                <th>Kategorija</th>
                <th>Trajanje</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>strelko_token</code></td>
                <td>strelko.meteoinfo.si / ${COMPANY.shortName}</td>
                <td>Lokalna shramba</td>
                <td>Ohranjanje prijave in uporabniške seje</td>
                <td>Nujna</td>
                <td>Do odjave ali ročnega izbrisa</td>
              </tr>
              <tr>
                <td><code>strelko_cookie_consent</code></td>
                <td>strelko.meteoinfo.si / ${COMPANY.shortName}</td>
                <td>Lokalna shramba</td>
                <td>Shranitev izbire glede analitike (<code>necessary</code> ali <code>analytics</code>; stara vrednost <code>1</code> pomeni dovoljeno analitiko)</td>
                <td>Nujna</td>
                <td>Do ročnega izbrisa ali spremembe v nastavitvah zasebnosti</td>
              </tr>
              <tr>
                <td><code>strelko_map_layers</code></td>
                <td>strelko.meteoinfo.si / ${COMPANY.shortName}</td>
                <td>Lokalna shramba</td>
                <td>Shranjevanje nastavitev prikaza zemljevidnih slojev</td>
                <td>Funkcionalna</td>
                <td>Do ročnega izbrisa v brskalniku</td>
              </tr>
              <tr>
                <td><code>strelko_preview_checkout_return_v1</code></td>
                <td>strelko.meteoinfo.si / ${COMPANY.shortName}</td>
                <td>Lokalna shramba</td>
                <td>Začasna obnova predogleda oziroma uporabnikovega stanja po vrnitvi iz plačilnega postopka (lahko vključuje podatke o izbrani lokaciji ali iskanju)</td>
                <td>Funkcionalna / nujna za plačilni tok</td>
                <td>Največ približno 2 uri ali do uporabe</td>
              </tr>
              <tr>
                <td><code>strelko_auth_return</code></td>
                <td>strelko.meteoinfo.si / ${COMPANY.shortName}</td>
                <td>Sejna shramba</td>
                <td>Povrnitev na stran po prijavi ali registraciji</td>
                <td>Nujna</td>
                <td>Do zaprtja zavihka brskalnika</td>
              </tr>
              <tr>
                <td><code>strelko_checkout_plan</code></td>
                <td>strelko.meteoinfo.si / ${COMPANY.shortName}</td>
                <td>Sejna shramba</td>
                <td>Nadaljevanje izbranega nakupa po prijavi</td>
                <td>Nujna</td>
                <td>Do zaprtja zavihka brskalnika</td>
              </tr>
              <tr>
                <td><code>strelko_checkout_quantity</code></td>
                <td>strelko.meteoinfo.si / ${COMPANY.shortName}</td>
                <td>Sejna shramba</td>
                <td>Shranitev izbrane količine žetonov ob nakupu</td>
                <td>Nujna</td>
                <td>Do zaprtja zavihka brskalnika</td>
              </tr>
              <tr>
                <td><code>strelko_search_result_v1</code></td>
                <td>strelko.meteoinfo.si / ${COMPANY.shortName}</td>
                <td>Sejna shramba</td>
                <td>Začasno ohranitev rezultata iskanja med brskanjem</td>
                <td>Funkcionalna</td>
                <td>Do zaprtja zavihka brskalnika</td>
              </tr>
              <tr>
                <td><code>strelko_saved_query_id_v1</code></td>
                <td>strelko.meteoinfo.si / ${COMPANY.shortName}</td>
                <td>Sejna shramba</td>
                <td>Povezava z identifikatorjem shranjene poizvedbe v tej seji</td>
                <td>Funkcionalna</td>
                <td>Do zaprtja zavihka brskalnika</td>
              </tr>
              <tr>
                <td><code>strelko_show_grid_lock</code></td>
                <td>strelko.meteoinfo.si / ${COMPANY.shortName}</td>
                <td>Sejna shramba</td>
                <td>Enkratni prikaz obvestila oziroma zaklenjenega prikaza mreže po odjavi</td>
                <td>Funkcionalna</td>
                <td>Do porabe ali zaprtja zavihka</td>
              </tr>
              <tr>
                <td>Umami Analytics (brez imenovanih HTTP-piškotkov)</td>
                <td>strelko.meteoinfo.si / umami (self-hosted)</td>
                <td>Omrežna zahteva (skripta)</td>
                <td>Zasebnosti prijazna zbirna statistika obiska (pageview, referer, naprava); samo po izrecni privolitvi</td>
                <td>Analitična (po privolitvi)</td>
                <td>Brez HTTP-piškotkov; podatki na našem strežniku</td>
              </tr>
              <tr>
                <td>Google piškotki in podobne tehnologije (npr. po imenu ponudnika)</td>
                <td>google.com / accounts.google.com</td>
                <td>Piškotek (tretja oseba)</td>
                <td>Prijava prek Google računa in varnost storitve Google Identity Services</td>
                <td>Nujna ob izbiri Google prijave</td>
                <td>Po pravilih Google; običajno od seje do več mesecev</td>
              </tr>
            </tbody>
          </table>
          <p>Zgoraj navedeni Google zapisi nastanejo šele, ko uporabnik odpre okno za prijavo oziroma registracijo in
          se naloži storitev Google Identity Services. Ob običajnem obisku strani brez odpiranja prijave se ta skripta
          ne naloži.</p>`,
      },
      {
        title: "5. Google prijava in druge zunanje storitve",
        body: `
          <p>Strelko omogoča prijavo prek storitve Google. Ko uporabnik uporabi to možnost, lahko Google uporabi
          svoje piškotke ali druge tehnologije, potrebne za izvedbo prijave in varovanje uporabniškega računa. Za
          obdelavo, ki jo Google izvaja kot samostojni ponudnik, veljajo tudi Googlovi pogoji in politika zasebnosti.</p>
          <p>Politika zasebnosti Google:
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com/privacy</a></p>
          <p>Skripta Google Identity Services (<code>accounts.google.com/gsi/client</code>) se naloži ob odprtju okna
          za prijavo ali registracijo, ne pa ob vsakem obisku domače strani.</p>
          <p><strong>MapTiler</strong> – ob prikazu zemljevida (iskanje, statistika, izbira lokacije) brskalnik
          pridobi ploščice in podatke z <code>api.maptiler.com</code>. Strelko ne shranjuje MapTiler piškotkov v
          lastni domeni; MapTiler lahko obdeluje tehnične podatke na svoji strani. Politika zasebnosti:
          <a href="https://www.maptiler.com/privacy-policy/" target="_blank" rel="noopener">maptiler.com/privacy-policy</a>.</p>
          <p><strong>Vdelani arhivski prikazi</strong> – na nekaterih straneh se naložijo vdelani okvirji (<code>iframe</code>)
          z iste domene Strelko za prikaz arhivskih grafov ali zemljevida. To niso piškotki tretjih oseb.</p>
          <p><strong>Umami Analytics (Strelko)</strong> – po izbiri <strong>Dovoli analitiko</strong> se naloži
          skripta <code>/umami/script.js</code> z naše lastne instance Umami na domeni
          <code>strelko.meteoinfo.si</code>. Gre za zasebnosti prijazno zbirno statistiko obiska; Umami na Strelku
          ne uporablja HTTP-piškotkov. Poti <code>/admin</code>, <code>/admin2</code> in <code>/embed/</code> se
          ne pošiljajo v analitiko.</p>
          <p><strong>Plačila prek Stripe</strong> – ob nakupu se uporabnik preusmeri na varno plačilno stran Stripe
          (npr. <code>checkout.stripe.com</code>). V spletni aplikaciji Strelko se ne vgrajuje Stripe sledilnih
          skript; morebitni piškotki Stripe nastanejo na domenah Stripe, ne na Strelku. Podatke o kartici obdeluje
          Stripe na svoji strani.</p>
          <p><strong>Matična stran meteoinfo.si</strong> – spletna stran <code>meteoinfo.si</code> je ločena
          WordPress namestitev z lastnimi piškotki in orodji (npr. privolitev CookieYes, Google Tag). Vgradnje
          Strelka v iframe ne nastavljajo piškotkov na matični domeni in ne nadomeščajo privolitve na
          <code>meteoinfo.si</code>.</p>`,
      },
      {
        title: "6. Privolitev in izbira uporabnika",
        body: `
          <p>Strelko uporablja lastno analitiko Umami le, če uporabnik izrecno izbere
          <strong>Dovoli analitiko</strong>. Trženjskih tehnologij ne uporabljamo.</p>
          <p>Ob prvem obisku se prikaže obvestilo z dvema enakopravnima možnostma:
          <strong>Samo nujno</strong> (shrani <code>necessary</code>, Umami se ne naloži) in
          <strong>Dovoli analitiko</strong> (shrani <code>analytics</code>, naloži Umami).</p>
          <p>Izbiro lahko pozneje spremenite na strani <a href="/piskotki">Politika piškotkov</a> v razdelku
          <strong>Nastavitve zasebnosti</strong>.</p>`,
      },
      {
        title: "7. Shranjevanje izbire",
        body: `
          <p>Uporabnikovo izbiro glede analitike shranimo zato, da mu ob vsakem obisku ni treba ponovno odgovarjati
          na isto vprašanje.</p>
          <p>Izbor se shrani v lokalni shrambi pod ključem <code>strelko_cookie_consent</code> z vrednostjo
          <code>necessary</code> ali <code>analytics</code>. Zaradi združljivosti se stara vrednost
          <code>1</code> še vedno obravnava kot dovoljena analitika; ob naslednji spremembi se shrani nova
          opisna vrednost. Zapis nima samodejnega datuma poteka in ostane, dokler ga uporabnik ne spremeni v
          nastavitvah zasebnosti ali ne izbriše podatkov spletne strani v brskalniku.</p>`,
      },
      {
        title: "8. Upravljanje prek brskalnika",
        body: `
          <p>Uporabnik lahko piškotke in podatke spletnih mest izbriše ali omeji tudi v nastavitvah svojega brskalnika.
          Če izbriše nujne podatke seje ali prijave, se bo morda moral ponovno prijaviti, posamezne funkcije pa
          lahko prenehajo delovati do ponovne vzpostavitve potrebnih nastavitev.</p>
          <p>Za ponovni prikaz obvestila o zasebnosti izbrišite v brskalniku zapis
          <code>strelko_cookie_consent</code> (ali podatke spletne strani Strelko). Izbiro analitike lahko
          spremenite tudi neposredno v razdelku <strong>Nastavitve zasebnosti</strong> na tej strani, brez
          brisanja prijave ali drugih nastavitev.</p>`,
      },
      {
        title: "9. Osebni podatki",
        body: `
          <p>Če je mogoče podatke, shranjene s piškotki ali podobnimi tehnologijami, povezati z določenim
          uporabnikom, jih obdelujemo v skladu s
          <a href="/zasebnost">Politiko zasebnosti storitve Strelko</a>.</p>`,
      },
      {
        title: "10. Spremembe politike",
        body: `
          <p>Politiko lahko posodobimo zaradi sprememb uporabljenih tehnologij, funkcionalnosti Strelka ali veljavnih
          predpisov.</p>
          <p>Datum zadnje posodobitve je naveden na vrhu dokumenta.</p>`,
      },
      {
        title: "11. Kontakt",
        body: `
          <p>Za vprašanja glede uporabe piškotkov in podobnih tehnologij se lahko obrnete na:</p>
          <p><strong>${COMPANY.shortName}</strong></p>
          <p>E-pošta: <a href="mailto:${COMPANY.privacyEmail}">${COMPANY.privacyEmail}</a></p>`,
      },
    ],
  },
  dataSources: {
    path: "/viri-podatkov",
    title: "Viri podatkov",
    updated: "17. 7. 2026",
    sections: [
      {
        title: "Podatki o strelah",
        body: `
          <p>Podatki o zaznanih atmosferskih razelektritvah izvirajo iz sistema <strong>LEELA</strong> britanske državne meteorološke službe <strong>Met Office</strong>. Podatke obdeluje in posreduje <strong>Hrvaški državni hidrometeorološki zavod (DHMZ)</strong>, Meteoinfo pa jih dodatno obdela in prikaže v aplikaciji Strelko.</p>
          <p>Sistem LEELA zaznava radijske impulze, ki nastanejo ob atmosferskih razelektritvah. Na podlagi razlik v času prihoda signala do več senzorjev se določita približen čas in lokacija zaznane razelektritve.</p>`,
      },
      {
        title: "Omejitve podatkov",
        body: `
          <p>Podatki so informativne narave. Zaradi načina zaznavanja, razporeditve merilnih postaj, kakovosti sprejema in postopkov obdelave ni mogoče zagotoviti, da bo zaznana vsaka atmosferska razelektritev.</p>
          <p>Prikazana lokacija in čas udara strel lahko nekoliko odstopata od dejanskega dogodka. Različni sistemi zaznavanja lahko zato za isto nevihto prikažejo različno število udarov ali nekoliko drugačne lokacije.</p>
          <p>Podatki v aplikaciji Strelko ne predstavljajo uradne evidence in jih je treba uporabljati skupaj z drugimi razpoložljivimi informacijami.</p>`,
      },
    ],
  },
  consumer: {
    path: "/pravice-potrosnikov",
    title: "Pravice potrošnikov",
    updated: "19. 7. 2026",
    sections: [
      {
        title: "Praktičen povzetek",
        body: `
          <p>Ta stran je <strong>praktičen povzetek</strong> najpomembnejših potrošniških pravic pri nakupu žetonov in
          paketa Podpornik v storitvi Strelko. Ne nadomešča veljavne zakonodaje in ne omejuje pravic, ki vam po zakonu
          pripadajo.</p>
          <p>Paket Podpornik je <strong>mesečna spletna naročnina</strong>. Ob aktivaciji ne podpisujete posebne pisne
          pogodbe; naročnina se sklene na daljavo prek spletne strani. Nakup žetonov je enkratni nakup in ni naročnina.</p>`,
      },
      {
        title: "1. Kdo je potrošnik?",
        body: `
          <p>Potrošnik je fizična oseba, ki storitev pridobi ali uporablja za namene zunaj svoje poklicne ali
          pridobitne dejavnosti.</p>
          <p>Pravice, opisane na tej strani, veljajo za potrošnike. Za nakupe podjetij in drugih poslovnih uporabnikov
          se uporabljajo pogodbeni pogoji in splošna pravila obligacijskega prava.</p>`,
      },
      {
        title: "2. Informacije pred nakupom",
        body: `
          <p>Pred zaključkom nakupa so uporabniku jasno prikazani zlasti:</p>
          <ul>
            <li>izbrana ponudba in njene bistvene lastnosti;</li>
            <li>končna cena z DDV;</li>
            <li>število kupljenih oziroma porabljenih žetonov (pri nakupu žetonov);</li>
            <li>aktivacija naročnine in trajanje plačanega obračunskega obdobja (pri paketu Podpornik);</li>
            <li>samodejno mesečno podaljševanje in preklic naročnine;</li>
            <li>pogoji takojšnje uporabe plačljive storitve;</li>
            <li>pogoji in postopek za odstop od pogodbe, sklenjene na daljavo.</li>
          </ul>
          <p>Uporabnik lahko pred potrditvijo naročila preveri in po potrebi popravi vnesene podatke. Naročilo je oddano
          šele z dejanjem, ki jasno označuje obveznost plačila.</p>
          <p>Podrobnosti ponudb in cen so objavljene na strani <a href="/cenik">Cenik</a>.</p>`,
      },
      {
        title: "3. Pravica do odstopa v 14 dneh",
        body: `
          <div style="margin: 1.25rem 0; padding: 1rem 1.25rem; border-left: 3px solid #05a5ce; background: rgba(5, 165, 206, 0.1); border-radius: 0 8px 8px 0;">
            <p>Potrošnik ima pri pogodbi, sklenjeni na daljavo, praviloma pravico, da v <strong>14 dneh</strong> od
            sklenitve pogodbe od nje odstopi brez navedbe razloga.</p>
            <p>Za pravočasen odstop zadostuje, da potrošnik pred iztekom roka pošlje nedvoumno izjavo, iz katere je
            jasno razvidno, da odstopa od pogodbe.</p>
          </div>
          <p>Pravica do odstopa se presoja v skladu z Zakonom o varstvu potrošnikov in morebitnimi zakonskimi
          izjemami.</p>
          <p>Odstop od pogodbe ni isto kot preklic naročnine Podpornik. Preklic ustavi prihodnja samodejna
          podaljšanja; odstop je zakonska potrošniška pravica v roku 14 dni.</p>`,
      },
      {
        title: "4. Takojšnja uporaba storitve",
        body: `
          <p>Žetoni in naročnina Podpornik so uporabniku praviloma na voljo takoj po uspešnem plačilu, še pred potekom
          14-dnevnega odstopnega roka.</p>
          <p>Kadar zakon to zahteva, mora uporabnik pred takojšnjim začetkom izvajanja podati izrecno zahtevo oziroma
          soglasje. Izjava mora biti jasna, ločena od sprejetja splošnih pogojev in ne sme biti vnaprej označena.</p>
          <h3>Paket Podpornik</h3>
          <p>Z aktivacijo paketa Podpornik uporabnik sklene mesečno naročnino na digitalno storitev Strelko. Naročnina
          se samodejno podaljšuje vsak mesec do preklica. Uporabnik jo lahko kadar koli prekliče v razdelku
          <a href="/moj-strelko">Moj Strelko</a>. Po preklicu ostane paket aktiven do konca že plačanega obračunskega
          obdobja, nato pa se ne podaljša več.</p>
          <p>Naročnina se zagotavlja v plačanem obračunskem obdobju. Če potrošnik zahteva takojšnjo aktivacijo naročnine
          in nato veljavno odstopi od pogodbe pred koncem obdobja, se njegova pravica in morebitno sorazmerno plačilo za
          že izvedeni del presojata skladno z veljavno zakonodajo ter informacijami in izjavami, ki jih je prejel
          oziroma podal pred nakupom.</p>
          <p>Potrošnik pravice do odstopa od pogodbe ne izgubi samodejno že z aktivacijo naročnine. Pri storitvi lahko
          pravica preneha po popolni izvedbi le, če so izpolnjeni vsi zakonski pogoji, vključno z ustrezno predhodno
          zahtevo oziroma soglasjem potrošnika.</p>
          <h3>Odklep poizvedbe in PDF-poročilo</h3>
          <p>Odklep posamezne poizvedbe in izdelava PDF-poročila se lahko izvedeta takoj in v celoti. Pred tako
          izvedbo mora biti uporabniku jasno pojasnjeno, kako takojšnji začetek oziroma popolna izvedba vpliva na
          pravico do odstopa.</p>
          <p>Kadar zakon za posamezno plačljivo funkcijo zahteva izrecno soglasje in potrditev, da uporabnik razume
          posledice takojšnje izvedbe, se taka izjava pridobi ločeno pred izvedbo.</p>
          <p>Pravica do odstopa se ne omeji ali odvzame zgolj z navedbo v splošnih pogojih. Izpolnjeni morajo biti
          vsi zakonski pogoji.</p>`,
      },
      {
        title: "5. Odstop od nakupa žetonov",
        body: `
          <p>Nakup žetonov je <strong>enkratni nakup</strong> in ni naročnina. Ne vključuje samodejnega mesečnega
          podaljševanja.</p>
          <p>Potrošnik lahko od nakupa žetonov odstopi v zakonskem roku, če za omejitev ali prenehanje pravice do
          odstopa niso izpolnjeni zakonski pogoji.</p>
          <p>Ob veljavnem odstopu od nakupa se neporabljeni žetoni odstranijo z uporabniškega računa, ustrezno
          vračilo plačila pa se izvede skladno z veljavno zakonodajo.</p>
          <p>Če je uporabnik pred odstopom že uporabil plačljivo storitev, na primer odklenil poizvedbo ali izdelal
          PDF-poročilo, se obseg vračila presoja glede na že opravljeno storitev, informacije in izjave, podane pred
          izvedbo, ter veljavno zakonodajo.</p>
          <p>Uporabnik ob vračilu plačila za neporabljene žetone teh žetonov ne more hkrati obdržati na svojem
          računu.</p>`,
      },
      {
        title: "6. Paket Podpornik: naročnina, preklic in odstop",
        body: `
          <p>Z aktivacijo paketa Podpornik uporabnik sklene mesečno naročnino na digitalno storitev Strelko. Naročnina
          se samodejno podaljšuje vsak mesec do preklica. Uporabnik jo lahko kadar koli prekliče v razdelku
          <a href="/moj-strelko">Moj Strelko</a>. Po preklicu ostane paket aktiven do konca že plačanega obračunskega
          obdobja, nato pa se ne podaljša več.</p>
          <p>Posebne pisne pogodbe ob aktivaciji ne podpisujete. Naročnina se sklene na daljavo prek spletne strani;
          gre za pogodbo, sklenjeno na daljavo, v smislu potrošniške zakonodaje.</p>
          <p>Odstop od pogodbe in preklic naročnine sta <strong>različna postopka</strong>.</p>
          <h3>Preklic naročnine</h3>
          <div style="margin: 1rem 0; padding: 1rem 1.25rem; border-left: 3px solid #fbb006; background: rgba(251, 176, 6, 0.08); border-radius: 0 8px 8px 0;">
            <p>Preklic naročnine ustavi prihodnja samodejna mesečna podaljšanja.</p>
            <p>Uporabnik lahko naročnino Podpornik kadar koli prekliče v razdelku
            <a href="/moj-strelko">Moj Strelko</a>.</p>
            <p>Po preklicu se nova plačila ne izvedejo, dostop pa ostane aktiven do konca že plačanega obračunskega
            obdobja.</p>
            <p>Preklic naročnine ni enak odstopu od pogodbe in sam po sebi ne pomeni vračila plačila za tekoče
            obračunsko obdobje.</p>
          </div>
          <h3>Odstop od pogodbe</h3>
          <div style="margin: 1rem 0; padding: 1rem 1.25rem; border-left: 3px solid #05a5ce; background: rgba(5, 165, 206, 0.08); border-radius: 0 8px 8px 0;">
            <p>Odstop od pogodbe je zakonska potrošniška pravica pri pogodbi, sklenjeni na daljavo. Potrošnik jo lahko
            uveljavlja v 14 dneh, ob upoštevanju pravil o takojšnjem začetku izvajanja storitve.</p>
            <p>Če je potrošnik izrecno zahteval takojšnjo aktivacijo naročnine, se obseg morebitnega vračila oziroma
            sorazmernega plačila za že izvedeni del določi skladno z veljavno zakonodajo.</p>
          </div>`,
      },
      {
        title: "7. Kako uveljaviti odstop",
        body: `
          <div style="margin: 1.25rem 0; padding: 1.25rem 1.5rem; border: 1px solid rgba(5, 165, 206, 0.35); background: rgba(5, 165, 206, 0.12); border-radius: 12px;">
            <p>Odstop lahko sporočite na <a href="mailto:${COMPANY.email}">${COMPANY.email}</a> ali po pošti na naslov
            ${COMPANY.shortName}, ${COMPANY.address}, ${COMPANY.postal}.</p>
            <p>Za pravočasen odstop zadostuje, da potrošnik pred potekom roka pošlje nedvoumno izjavo, iz katere je
            jasno razvidno, da odstopa od pogodbe.</p>
            <p>Uporabite lahko spodnji vzorčni obrazec, vendar njegova uporaba ni obvezna.</p>
          </div>`,
      },
      {
        title: "Vzorčni obrazec za odstop od pogodbe",
        body: `
          <p>Obrazec izpolnite in pošljite samo, če želite odstopiti od pogodbe.</p>
          <div class="legal-withdrawal-form" style="margin: 1.5rem 0; padding: 1.25rem 1.5rem; border: 1px solid rgba(255, 255, 255, 0.15); background: rgba(0, 0, 0, 0.2); border-radius: 12px; overflow-x: auto;">
            <p><strong>Prejemnik:</strong></p>
            <p>${COMPANY.legalName}<br />
            ${COMPANY.address}, ${COMPANY.postal}, ${COMPANY.country}<br />
            E-pošta: <a href="mailto:${COMPANY.email}">${COMPANY.email}</a></p>
            <p style="margin-top: 1.25rem;">Obveščam vas, da odstopam od pogodbe za naslednjo storitev oziroma ponudbo:</p>
            <p style="border-bottom: 1px solid rgba(255, 255, 255, 0.35); min-height: 1.75rem; margin: 0.5rem 0 1rem;">&nbsp;</p>
            <p>Datum sklenitve pogodbe oziroma nakupa:</p>
            <p style="border-bottom: 1px solid rgba(255, 255, 255, 0.35); min-height: 1.75rem; margin: 0.5rem 0 1rem;">&nbsp;</p>
            <p>Številka naročila ali identifikator plačila, če je na voljo:</p>
            <p style="border-bottom: 1px solid rgba(255, 255, 255, 0.35); min-height: 1.75rem; margin: 0.5rem 0 1rem;">&nbsp;</p>
            <p>Ime in priimek potrošnika:</p>
            <p style="border-bottom: 1px solid rgba(255, 255, 255, 0.35); min-height: 1.75rem; margin: 0.5rem 0 1rem;">&nbsp;</p>
            <p>Naslov potrošnika:</p>
            <p style="border-bottom: 1px solid rgba(255, 255, 255, 0.35); min-height: 1.75rem; margin: 0.5rem 0 1rem;">&nbsp;</p>
            <p>E-poštni naslov uporabniškega računa:</p>
            <p style="border-bottom: 1px solid rgba(255, 255, 255, 0.35); min-height: 1.75rem; margin: 0.5rem 0 1rem;">&nbsp;</p>
            <p>Datum:</p>
            <p style="border-bottom: 1px solid rgba(255, 255, 255, 0.35); min-height: 1.75rem; margin: 0.5rem 0 1rem;">&nbsp;</p>
            <p>Podpis potrošnika:</p>
            <p style="border-bottom: 1px solid rgba(255, 255, 255, 0.35); min-height: 2.5rem; margin: 0.5rem 0 0;">&nbsp;</p>
          </div>
          <p><em>Podpis je potreben samo, če se obrazec pošlje v papirni obliki.</em></p>
          <p><em>Uporaba obrazca ni obvezna. Odstop je mogoče sporočiti tudi z drugo jasno in nedvoumno izjavo.</em></p>`,
      },
      {
        title: "8. Vračilo plačila",
        body: `
          <p>Če je odstop veljaven, Meteoinfo vrne ustrezno plačilo brez nepotrebnega odlašanja in najpozneje v 14 dneh
          po prejemu obvestila o odstopu.</p>
          <p>Vračilo se praviloma izvede z istim plačilnim sredstvom, kot je bilo uporabljeno pri nakupu, razen če se
          potrošnik izrecno strinja z drugim načinom in zaradi tega nima dodatnih stroškov.</p>
          <p>Potrošniku se za izvedbo vračila ne zaračunajo dodatni stroški.</p>
          <p>Obseg vračila je odvisen od vrste kupljene ponudbe, že opravljenega dela storitve, izjav uporabnika pred
          začetkom izvajanja in veljavne zakonodaje.</p>
          <p>Ob veljavnem vračilu plačila za neporabljene žetone se ti odstranijo z uporabniškega računa. Ob odstopu od
          pogodbe za naročnino Podpornik se uporabniku po izvedenem vračilu ustrezno omeji nadaljnji dostop do
          plačljivih funkcij.</p>`,
      },
      {
        title: "9. Če storitev ni dobavljena",
        body: `
          <p>Če se kupljeni žetoni ne pripišejo računu, naročnina Podpornik ni aktivirana ali druga plačana funkcija ni
          dostopna, naj uporabnik najprej obvesti Meteoinfo in zahteva dobavo oziroma odpravo težave.</p>
          <p>Če storitev kljub pozivu ni zagotovljena brez nepotrebnega odlašanja oziroma v dogovorjenem dodatnem
          roku, lahko potrošnik pod zakonskimi pogoji odstopi od pogodbe.</p>
          <p>V določenih primerih lahko potrošnik odstopi takoj, zlasti kadar ponudnik izjavi ali je očitno, da
          storitve ne bo zagotovil, oziroma kadar je bil dogovorjeni čas izvedbe bistven.</p>`,
      },
      {
        title: "10. Neskladna digitalna storitev",
        body: `
          <p>Digitalna storitev mora ustrezati opisu in lastnostim, ki so bile uporabniku predstavljene ob nakupu, ter
          delovati tako, kot lahko potrošnik glede na naravo storitve razumno pričakuje.</p>
          <p>Če storitev ni skladna, lahko potrošnik najprej zahteva brezplačno vzpostavitev skladnosti v razumnem roku
          in brez znatnih nevšečnosti.</p>
          <p>Pod zakonskimi pogoji lahko potrošnik zahteva tudi sorazmerno znižanje kupnine ali odstop od pogodbe,
          zlasti če:</p>
          <ul>
            <li>vzpostavitev skladnosti ni mogoča ali bi bila nesorazmerna;</li>
            <li>ponudnik skladnosti ne vzpostavi v razumnem roku;</li>
            <li>storitev tudi po poskusu odprave ostane neskladna;</li>
            <li>je neskladnost dovolj resna;</li>
            <li>je očitno, da ponudnik težave ne bo odpravil v razumnem roku.</li>
          </ul>
          <p>Te pravice veljajo poleg pravice do odstopa od pogodbe na daljavo in je ne nadomeščajo.</p>`,
      },
      {
        title: "11. Reklamacije in pritožbe",
        body: `
          <div style="margin: 1.25rem 0; padding: 1rem 1.25rem; border-left: 3px solid #05a5ce; background: rgba(5, 165, 206, 0.1); border-radius: 0 8px 8px 0;">
            <p>Reklamacijo ali pritožbo lahko uporabnik pošlje na
            <a href="mailto:${COMPANY.email}">${COMPANY.email}</a>.</p>
          </div>
          <p>Za hitrejšo obravnavo naj navede:</p>
          <ul>
            <li>e-poštni naslov uporabniškega računa;</li>
            <li>opis težave;</li>
            <li>datum in čas dogodka;</li>
            <li>identifikator poizvedbe, naročila ali plačila;</li>
            <li>želeni način rešitve.</li>
          </ul>
          <p>Meteoinfo bo zahtevek obravnaval brez nepotrebnega odlašanja in uporabniku odgovoril po e-pošti.</p>`,
      },
      {
        title: "12. Izvensodno reševanje sporov",
        body: `
          <p>Meteoinfo d.o.o. ne priznava nobenega izvajalca izvensodnega reševanja potrošniških sporov kot pristojnega
          za reševanje potrošniškega spora, ki bi ga potrošnik lahko sprožil v skladu z Zakonom o izvensodnem
          reševanju potrošniških sporov.</p>
          <p>Informacije o registriranih izvajalcih izvensodnega reševanja potrošniških sporov so dostopne na uradnih
          spletnih straneh državnih organov.</p>`,
      },
      {
        title: "13. Pomoč in nadzor",
        body: `
          <p>Potrošnik se lahko za informacije o svojih pravicah obrne tudi na brezplačno svetovanje potrošnikom, za
          prijavo domnevne kršitve pa na Tržni inšpektorat Republike Slovenije.</p>
          <p>Brezplačno svetovanje potrošnikom:
          <a href="tel:0808899">080 88 99</a></p>
          <p><strong>Tržni inšpektorat Republike Slovenije</strong></p>
          <p>Dunajska cesta 160, 1000 Ljubljana</p>
          <p>E-pošta: <a href="mailto:gp.tirs@gov.si">gp.tirs@gov.si</a></p>
          <p>Spletna stran:
          <a href="https://www.gov.si/tirs" target="_blank" rel="noopener">gov.si/tirs</a></p>`,
      },
      {
        title: "14. Dodatne informacije",
        body: `
          <p>Podrobnejša pogodbena pravila so objavljena v
          <a href="/pogoji-uporabe">Pogojih uporabe</a>.</p>
          <p>Informacije o ponudniku so objavljene v <a href="/impressum">Impressumu</a>.</p>
          <p>Ta stran je povzetek najpomembnejših pravic in ne omejuje pravic, ki potrošniku pripadajo po veljavni
          zakonodaji.</p>`,
      },
    ],
  },
};

export type LegalPageId = keyof typeof LEGAL_PAGES;

export function resolveLegalPageId(pathname: string): LegalPageId | null {
  const path = (pathname || "/").replace(/\/$/, "") || "/";
  const entry = Object.entries(LEGAL_PAGES).find(([, page]) => page.path === path);
  return entry ? (entry[0] as LegalPageId) : null;
}

/** @deprecated Uporabi readCookieConsent / hasCookieConsentChoice iz cookie-consent.ts */
export function hasCookieConsent() {
  try {
    const raw = localStorage.getItem("strelko_cookie_consent");
    return raw === "analytics" || raw === "1" || raw === "necessary";
  } catch {
    return false;
  }
}

/** @deprecated Uporabi writeCookieConsent("analytics") */
export function setCookieConsent() {
  try {
    localStorage.setItem("strelko_cookie_consent", "analytics");
  } catch {
    /* ignore */
  }
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
    <div class="cookie-banner" id="cookie-banner" role="dialog" aria-label="Obvestilo o zasebnosti">
      <div class="cookie-banner-inner">
        <p>
          Za delovanje Strelka uporabljamo nujno lokalno shranjevanje. Z vašim dovoljenjem vključimo tudi
          anonimno statistiko obiska z lastno analitiko Umami.
          <a href="/piskotki" data-legal="cookies">Več o zasebnosti</a>
        </p>
        <div class="cookie-banner-actions">
          <button type="button" class="btn btn-ghost btn-sm" data-action="consent-necessary">Samo nujno</button>
          <button type="button" class="btn btn-primary btn-sm" data-action="consent-analytics">Dovoli analitiko</button>
        </div>
      </div>
    </div>`;
}
