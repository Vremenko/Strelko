import { TOKEN_USAGE_RULES, type TokenUsageRule } from "../../lib/pricing-offers";

function tokenUsageRuleLabel(rule: TokenUsageRule): string {
  const [start, endPart] = rule.daysLabel.split("–");
  const tokenWord = rule.tokens === 1 ? "žeton" : rule.tokens === 2 ? "žetona" : "žetoni";
  return `od ${start} do ${endPart}: ${rule.tokens} ${tokenWord},`;
}

export function TokenUsageExplainer() {
  return (
    <section className="pricing-info-card pricing-surface-card" aria-labelledby="pricing-choice-title">
      <h2 className="pricing-section-title" id="pricing-choice-title">
        Katero možnost izbrati?
      </h2>

      <div className="pricing-qa-block">
        <p className="pricing-qa-block__question">
          Potrebujete preverjanje udarov strel za točno določeno lokacijo in PDF-poročilo kot pomoč
          pri uveljavljanju škode pri zavarovalnici?
        </p>
        <p className="pricing-qa-block__answer">
          Kupite žetone. Njihova poraba je odvisna od števila lokacij, dolžine izbranega obdobja in
          izdelave PDF-poročila.
        </p>
      </div>

      <div className="pricing-qa-block">
        <p className="pricing-qa-block__question">Želite redno spremljati strele?</p>
        <p className="pricing-qa-block__answer">
          Izberite paket Podpornik, ki omogoča dostop do celotnega arhiva, naprednih statistik in
          widgeta.
        </p>
      </div>

      <p className="pricing-qa-block__emphasis">Žetoni in paket Podpornik sta ločeni ponudbi.</p>

      <div className="pricing-info-card__subsection">
        <h2 className="pricing-section-title">Žetoni za preverjanje škode</h2>
        <p className="pricing-section-lead">
          Žetone uporabite za preverjanje udarov strel v bližini izbranega naslova in za izdelavo
          PDF-poročila, ki ga lahko uporabite pri komunikaciji z zavarovalnico.
        </p>

        <h3 className="pricing-subsection-title">Kaj omogoča pregled?</h3>
        <ul className="plan-features pricing-info-card__list">
          <li>prikaz udarov strel v okolici izbrane lokacije,</li>
          <li>izbiro obdobja in radija iskanja,</li>
          <li>prikaz udarov na zemljevidu,</li>
          <li>pregled rezultatov in najbližjih zaznanih udarov.</li>
        </ul>

        <h3 className="pricing-subsection-title">Kako se porabljajo žetoni?</h3>
        <p className="pricing-section-lead">
          En žeton omogoča pregled ene lokacije za obdobje do 10 dni.
        </p>
        <p className="pricing-section-lead">Daljše obdobje se obračuna po začetih desetdnevnih obdobjih:</p>
        <ul className="plan-features pricing-info-card__list">
          {TOKEN_USAGE_RULES.map((rule) => (
            <li key={rule.daysLabel}>{tokenUsageRuleLabel(rule)}</li>
          ))}
        </ul>
        <p className="pricing-section-lead">
          Če izberete drugo lokacijo, se ta obravnava kot nov pregled, žetoni pa se obračunajo
          znova glede na dolžino izbranega obdobja.
        </p>

        <h3 className="pricing-subsection-title">PDF-poročilo</h3>
        <p className="pricing-section-lead">Prva izdelava PDF-poročila porabi 1 dodaten žeton.</p>
        <p className="pricing-section-lead">
          Ponovna izdelava ali prenos poročila za isto lokacijo in radij ter za enako ali krajše
          obdobje znotraj že plačanega obdobja je brezplačna.
        </p>

        <h3 className="pricing-subsection-title">Primer</h3>
        <p className="pricing-section-lead">
          Za pregled ene lokacije za 20 dni se porabita 2 žetona. Če za ta pregled izdelate še
          PDF-poročilo, se porabi še 1 žeton, skupaj torej 3 žetoni.
        </p>
        <p className="pricing-section-lead">
          Če nato preverite drugo lokacijo za obdobje do 10 dni, se porabi še 1 žeton.
        </p>
        <p className="pricing-qa-block__emphasis">
          Najmanjši nakup so 3 žetoni. Žetoni ne potečejo.
        </p>
      </div>
    </section>
  );
}
