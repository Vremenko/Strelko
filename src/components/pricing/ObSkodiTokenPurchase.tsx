import { useCallback, useId, useState } from "react";
import {
  calculateObSkodiOrder,
  clampObSkodiQuantity,
  formatEurSl,
  isObSkodiPurchaseAllowed,
  OB_SKODI_MIN_QUANTITY,
  OB_SKODI_PER_TOKEN_GROSS_LABEL,
  OB_SKODI_PER_TOKEN_NET_APPROX_LABEL,
  obSkodiPurchaseCtaLabel,
  parseObSkodiQuantityInput,
  tokenCountLabel,
} from "../../lib/ob-skodi-tokens";
import { CENIK_ZETONI_FEATURES } from "../../lib/pricing-offers";

interface ObSkodiTokenPurchaseProps {
  paymentsEnabled: boolean;
  /** Cenik prikaže razširjeno vsebino; privzeto kompaktno (portal). */
  variant?: "default" | "cenik";
  /** Prikaže trenutno stanje (portal). */
  showBalance?: boolean;
  tokenBalance?: string;
  /** Pojasnilo, da se žetoni prištejejo (portal). */
  showAddToBalanceNote?: boolean;
  onPurchase: (quantity: number) => void;
}

export function ObSkodiTokenPurchase({
  paymentsEnabled,
  variant = "default",
  showBalance = false,
  tokenBalance,
  showAddToBalanceNote = false,
  onPurchase,
}: ObSkodiTokenPurchaseProps) {
  const [quantity, setQuantity] = useState(OB_SKODI_MIN_QUANTITY);
  const [inputValue, setInputValue] = useState(String(OB_SKODI_MIN_QUANTITY));
  const quantityId = useId();
  const purchaseAllowed = isObSkodiPurchaseAllowed(paymentsEnabled);
  const order = calculateObSkodiOrder(quantity);
  const isCenik = variant === "cenik";

  const syncQuantity = useCallback((next: number) => {
    const clamped = clampObSkodiQuantity(next);
    setQuantity(clamped);
    setInputValue(String(clamped));
  }, []);

  const handleDecrease = () => {
    if (quantity <= OB_SKODI_MIN_QUANTITY) return;
    syncQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    syncQuantity(quantity + 1);
  };

  const handleInputChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleInputBlur = () => {
    syncQuantity(parseObSkodiQuantityInput(inputValue));
  };

  const handlePurchase = () => {
    if (!purchaseAllowed) return;
    onPurchase(order.quantity);
  };

  return (
    <div className={`ob-skodi-purchase${isCenik ? " ob-skodi-purchase--cenik" : ""}`}>
      <p className="pricing-plan-card__price">
        <span className="pricing-plan-card__amount">{OB_SKODI_PER_TOKEN_GROSS_LABEL}</span>
        <span className="pricing-plan-card__period">na žeton</span>
      </p>
      <p className="pricing-plan-card__label">DDV je vključen</p>
      <p className="pricing-plan-card__ex-vat">
        {isCenik ? OB_SKODI_PER_TOKEN_NET_APPROX_LABEL : `približno ${OB_SKODI_PER_TOKEN_NET_APPROX_LABEL}`}{" "}
        brez DDV
      </p>

      {isCenik ? (
        <>
          <ul className="plan-features pricing-plan-card__features">
            {CENIK_ZETONI_FEATURES.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <p className="pricing-plan-card__min-note">Najmanjši nakup so 3 žetoni.</p>
        </>
      ) : (
        <ul className="plan-features">
          <li>Najmanjši nakup so 3 žetoni</li>
          <li>Žetoni ne potečejo</li>
        </ul>
      )}

      {showBalance ? (
        <div className="portal-stat portal-stat--inline">
          <span className="portal-stat__label">Vaše stanje žetonov</span>
          <span className="portal-stat__value">{tokenBalance ?? "—"}</span>
        </div>
      ) : null}

      {showAddToBalanceNote ? (
        <p className="ob-skodi-purchase__note">
          Kupljeni žetoni se prištejejo vašemu trenutnemu stanju in ne potečejo.
        </p>
      ) : null}

      <div className="ob-skodi-quantity">
        <label className="ob-skodi-quantity__label" htmlFor={quantityId}>
          Število žetonov
        </label>
        <div className="ob-skodi-quantity__controls">
          <button
            type="button"
            className="ob-skodi-quantity__btn"
            onClick={handleDecrease}
            disabled={quantity <= OB_SKODI_MIN_QUANTITY}
            aria-label="Manj žetonov"
          >
            −
          </button>
          <input
            id={quantityId}
            className="ob-skodi-quantity__input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleInputBlur}
            aria-label="Število žetonov"
            aria-valuetext={tokenCountLabel(quantity)}
          />
          <button
            type="button"
            className="ob-skodi-quantity__btn"
            onClick={handleIncrease}
            aria-label="Več žetonov"
          >
            +
          </button>
        </div>
      </div>

      <dl className="ob-skodi-price-breakdown">
        <div className="ob-skodi-price-breakdown__row">
          <dt>Brez DDV</dt>
          <dd>{formatEurSl(order.netEur)}</dd>
        </div>
        <div className="ob-skodi-price-breakdown__row">
          <dt>DDV</dt>
          <dd>{formatEurSl(order.vatEur)}</dd>
        </div>
        <div className="ob-skodi-price-breakdown__row ob-skodi-price-breakdown__row--total">
          <dt>Skupaj</dt>
          <dd>{formatEurSl(order.grossEur)}</dd>
        </div>
      </dl>

      <button
        type="button"
        className="btn btn-primary btn-block ob-skodi-purchase__cta"
        onClick={handlePurchase}
        disabled={!purchaseAllowed}
        aria-disabled={!purchaseAllowed}
      >
        {obSkodiPurchaseCtaLabel(quantity, purchaseAllowed)}
      </button>

      {!purchaseAllowed ? (
        <p className="portal-disabled-note">
          {isCenik
            ? "Nakup žetonov trenutno še ni na voljo."
            : "Nakup žetonov trenutno ni na voljo (plačila niso vklopljena)."}
        </p>
      ) : null}
    </div>
  );
}
