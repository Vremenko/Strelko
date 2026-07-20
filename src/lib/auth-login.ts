import type { ApiError } from "../types";

export type LoginErrorView = {
  message: string;
  suggestForgotPassword?: boolean;
  suggestEmailVerification?: boolean;
};

const BAD_CREDENTIALS_RE = /bad credentials/i;
const EMAIL_NOT_VERIFIED_RE = /email not verified/i;
const USER_BANNED_RE = /user banned|račun je blokiran/i;
const NETWORK_RE = /failed to fetch|networkerror|load failed|network request failed|fetch.*abort/i;
const RATE_LIMIT_RE = /rate limit/i;

export function mapLoginApiError(err: ApiError | Error): LoginErrorView {
  const message = (err.message || "").trim();
  const status = (err as ApiError).status;

  if (EMAIL_NOT_VERIFIED_RE.test(message) || (status === 403 && /verified/i.test(message))) {
    return {
      message:
        "E-poštni naslov še ni potrjen. Odprite povezavo iz potrditvenega sporočila ali preverite mapo z neželeno pošto.",
      suggestEmailVerification: true,
    };
  }

  if (USER_BANNED_RE.test(message)) {
    return {
      message: "Račun je blokiran. Za pomoč pišite na podpora@meteoinfo.si.",
    };
  }

  if (status === 429 || RATE_LIMIT_RE.test(message)) {
    return {
      message: "Preveč poskusov prijave. Počakajte minuto in poskusite znova.",
    };
  }

  if (status === undefined && NETWORK_RE.test(message)) {
    return {
      message:
        "Povezava s strežnikom ni uspela. Preverite internetno povezavo, morebitni blokator oglasov ali zasebni DNS, nato poskusite znova.",
    };
  }

  if (BAD_CREDENTIALS_RE.test(message) || status === 401) {
    return {
      message: "Napačen e-poštni naslov ali geslo. Preverite podatke in poskusite znova.",
      suggestForgotPassword: true,
    };
  }

  if (status !== undefined && status >= 500) {
    return {
      message: "Prijava trenutno ni na voljo. Poskusite znova čez nekaj trenutkov.",
    };
  }

  if (message && !NETWORK_RE.test(message)) {
    return { message };
  }

  if (NETWORK_RE.test(message)) {
    return {
      message:
        "Povezava s strežnikom ni uspela. Preverite internetno povezavo in poskusite znova.",
    };
  }

  return {
    message: "Prijava ni uspela. Preverite podatke in poskusite znova.",
    suggestForgotPassword: true,
  };
}
