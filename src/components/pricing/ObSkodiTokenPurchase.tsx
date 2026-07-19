import { useCallback, useEffect, useId, useState } from "react";
import { peekCheckoutQuantity } from "../../lib/auth-intent";
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
import { guestObSkodiCtaLabel } from "../../lib/pricing-cta";
import { CENIK_ZETONI_FEATURES } from "../../lib/pricing-offers";

interface ObSkodiTokenPurchaseProps {
  paymentsEnabled: boolean;
  /** Po uspešnem/neuspešnem nalaganju plans — da »kmalu na voljo« ni fallback med loadingom. */
  paymentsResolved?: boolean;
  plansError?: string | null;
  /** Cenik prikaže razširjeno vsebino; privzeto kompaktno (portal). */
  variant?: "default" | "cenik";
  /** Pri prijavi na ceniku omogoči gumb za prijavo (brez checkouta). */
  loggedIn?: boolean;
  /** Prikaže trenutno stanje (portal). */
  showBalance?: boolean;
  tokenBalance?: string;
  /** Pojasnilo, da se žetoni prištejejo (portal). */
  showAddToBalanceNote?: boolean;
  /** Med ustvarjanjem Stripe Checkout seje (cenik). */
  purchaseBusy?: boolean;
  onRetryPlans?: () => void;
  onPurchase: (quantity: number) => void;
}

export function ObSkodiTokenPurchase({
  paymentsEnabled,
  paymentsResolved = true,
  plansError = null,
  variant = "default",
  loggedIn = true,
  showBalance = false,
  tokenBalance,
  showAddToBalanceNote = false,
  purchaseBusy = false,
  onRetryPlans,
  onPurchase,
}: ObSkodiTokenPurchaseProps) {
  const savedQuantity = variant === "cenik" ? peekCheckoutQuantity() : null;
  const [quantity, setQuantity] = useState(() =>
    savedQuantity != null ? clampObSkodiQuantity(savedQuantity) : OB_SKODI_MIN_QUANTITY
  );
  const [inputValue, setInputValue] = useState(() =>
    savedQuantity != null ? String(clampObSkodiQuantity(savedQuantity)) : String(OB_SKODI_MIN_QUANTITY)
  );
  const quantityId = useId();
  const purchaseReady = isObSkodiPurchaseAllowed(paymentsEnabled);
  /** Gost: vedno omogočen CTA za prijavo (neodvisno od paymentsEnabled). */
  const authRequired = !loggedIn;
  const explicitlyUnavailable =
    loggedIn && paymentsResolved && !paymentsEnabled && !plansError;
  const order = calculateObSkodiOrder(quantity);
  const isCenik = variant === "cenik";

  const syncQuantity = useCallback((next: number) => {
    const clamped = clampObSkodiQuantity(next);
    setQuantity(clamped);
    setInputValue(String(clamped));
  }, []);

  useEffect(() => {
    if (!isCenik) return;
    const saved = peekCheckoutQuantity();
    if (saved == null) return;
    syncQuantity(saved);
  }, [isCenik, loggedIn, syncQuantity]);

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
    if (purchaseBusy) return;
    if (loggedIn && plansError && onRetryPlans) {
      onRetryPlans();
      return;
    }
    onPurchase(order.quantity);
  };

  const ctaLabel = (() => {
    if (purchaseBusy) return "Pripravljam plačilo …";
    if (!loggedIn) {
      return isCenik
        ? guestObSkodiCtaLabel()
        : `Prijava ali registracija — ${tokenCountLabel(order.quantity, "accusative")}`;
    }
    if (plansError) return "Poskusi znova";
    if (!paymentsResolved) return "Nalagam …";
    if (explicitlyUnavailable) return obSkodiPurchaseCtaLabel(quantity, false);
    return obSkodiPurchaseCtaLabel(quantity, purchaseReady);
  })();

  const showUnavailableNote =
    !isCenik && loggedIn && (explicitlyUnavailable || Boolean(plansError));

  const purchaseContent = (
    <>
      <p className="pricing-plan-card__price">
        <span className="pricing-plan-card__amount">{OB_SKODI_PER_TOKEN_GROSS_LABEL}</span>
        <span className="pricing-plan-card__period">na žeton</span>
      </p>
      {!isCenik ? <p className="pricing-plan-card__label">DDV je vključen</p> : null}
      <p className="pricing-plan-card__ex-vat">
        {isCenik
          ? `(${OB_SKODI_PER_TOKEN_NET_APPROX_LABEL} brez DDV)`
          : `približno ${OB_SKODI_PER_TOKEN_NET_APPROX_LABEL} brez DDV`}
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
    </>
  );

  const purchaseButton = (
    <button
      type="button"
      className="btn btn-primary btn-block ob-skodi-purchase__cta"
      onClick={handlePurchase}
      disabled={
        purchaseBusy ||
        (!authRequired && !purchaseReady && !(loggedIn && plansError && onRetryPlans)) ||
        (loggedIn && !paymentsResolved && !plansError)
      }
      aria-disabled={
        purchaseBusy ||
        (!authRequired && !purchaseReady && !(loggedIn && plansError && onRetryPlans)) ||
        (loggedIn && !paymentsResolved && !plansError)
      }
      aria-busy={purchaseBusy || undefined}
    >
      {ctaLabel}
    </button>
  );

  return (
    <div className={`ob-skodi-purchase${isCenik ? " ob-skodi-purchase--cenik" : ""}`}>
      {isCenik ? (
        <>
          <div className="ob-skodi-purchase__body">{purchaseContent}</div>
          {plansError && loggedIn ? (
            <p className="form-error" role="alert">
              {plansError}
            </p>
          ) : null}
          <div className="pricing-plan-card__footer pricing-plan-card__footer--cta">
            {purchaseButton}
          </div>
        </>
      ) : (
        <>
          {purchaseContent}
          {purchaseButton}
          {showUnavailableNote ? (
            <p className="portal-disabled-note">
              {plansError
                ? plansError
                : "Nakup žetonov trenutno ni na voljo (plačila niso vklopljena)."}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
