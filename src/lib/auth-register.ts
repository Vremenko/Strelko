import type { ApiError } from "../types";

/** Usklajeno s StormAPI RegisterIn (min_length=8, max_length=72). */
export const REGISTER_PASSWORD_MIN = 8;
export const REGISTER_PASSWORD_MAX = 72;

export type RegisterFieldErrors = {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  terms?: string;
  form?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidRegisterEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function validateRegisterForm(input: {
  email: string;
  password: string;
  passwordConfirm: string;
  termsAccepted: boolean;
}): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {};
  const email = input.email.trim();

  if (!email) {
    errors.email = "Vnesite e-poštni naslov.";
  } else if (!isValidRegisterEmail(email)) {
    errors.email = "Vnesite veljaven e-poštni naslov.";
  }

  if (!input.password) {
    errors.password = `Geslo mora imeti vsaj ${REGISTER_PASSWORD_MIN} znakov.`;
  } else if (input.password.length < REGISTER_PASSWORD_MIN) {
    errors.password = `Geslo mora imeti vsaj ${REGISTER_PASSWORD_MIN} znakov.`;
  } else if (input.password.length > REGISTER_PASSWORD_MAX) {
    errors.password = `Geslo je predolgo (največ ${REGISTER_PASSWORD_MAX} znakov).`;
  }

  if (!input.passwordConfirm) {
    errors.passwordConfirm = "Ponovite geslo.";
  } else if (input.password !== input.passwordConfirm) {
    errors.passwordConfirm = "Gesli se ne ujemata.";
  }

  if (!input.termsAccepted) {
    errors.terms = "Za registracijo morate sprejeti pogoje in politiko zasebnosti.";
  }

  return errors;
}

export function hasRegisterFieldErrors(errors: RegisterFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

type ValidationDetail = {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
};

function detailTargetsPassword(detail: ValidationDetail): boolean {
  const loc = detail.loc ?? [];
  return loc.includes("password");
}

function detailTargetsEmail(detail: ValidationDetail): boolean {
  const loc = detail.loc ?? [];
  return loc.includes("email");
}

function mapPasswordDetail(detail: ValidationDetail): string {
  if (detail.type === "string_too_short") {
    return `Geslo mora imeti vsaj ${REGISTER_PASSWORD_MIN} znakov.`;
  }
  if (detail.type === "string_too_long") {
    return `Geslo je predolgo (največ ${REGISTER_PASSWORD_MAX} znakov).`;
  }
  return `Geslo mora imeti vsaj ${REGISTER_PASSWORD_MIN} znakov.`;
}

export function mapRegisterApiError(err: ApiError): RegisterFieldErrors {
  const status = err.status;
  const message = err.message || "";

  if (message === "Email already registered" || status === 409) {
    return {
      email: "Ta e-poštni naslov je že registriran. Poskusite se prijaviti.",
    };
  }

  if (status === 422) {
    const data = err.data as { detail?: unknown } | undefined;
    const detail = data?.detail;
    const errors: RegisterFieldErrors = {};

    if (typeof detail === "string") {
      if (/email/i.test(detail)) {
        errors.email = "Vnesite veljaven e-poštni naslov.";
      } else {
        errors.form = "Računa trenutno ni bilo mogoče ustvariti. Poskusite znova pozneje.";
      }
      return errors;
    }

    if (Array.isArray(detail)) {
      for (const item of detail as ValidationDetail[]) {
        if (detailTargetsEmail(item)) {
          errors.email = "Vnesite veljaven e-poštni naslov.";
        } else if (detailTargetsPassword(item)) {
          errors.password = mapPasswordDetail(item);
        }
      }
      if (!hasRegisterFieldErrors(errors)) {
        errors.form = "Računa trenutno ni bilo mogoče ustvariti. Poskusite znova pozneje.";
      }
      return errors;
    }
  }

  if (status !== undefined && status >= 500) {
    return { form: "Računa trenutno ni bilo mogoče ustvariti. Poskusite znova pozneje." };
  }

  if (/email/i.test(message) && /valid|@/i.test(message)) {
    return { email: "Vnesite veljaven e-poštni naslov." };
  }

  return { form: "Računa trenutno ni bilo mogoče ustvariti. Poskusite znova pozneje." };
}
