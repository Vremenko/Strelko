/**
 * Odpre Stripe URL (Checkout ali Billing Portal) v novem zavihku.
 * Takoj odpre prazen zavihek (da brskalnik ne blokira pojavnega okna),
 * nato ga preusmeri na prejeti URL. Ob napaki zavihek zapre.
 *
 * Opomba: feature string "noopener" pri window.open vrne null v več brskalnikih,
 * zato nastavimo opener = null ročno in obdržimo referenco na zavihek.
 */
export async function openStripeUrlInNewTab(
  fetchUrl: () => Promise<string>,
  options: { blockedPopupMessage: string }
): Promise<void> {
  const tab = window.open("about:blank", "_blank");
  if (tab) {
    tab.opener = null;
  }

  try {
    const url = await fetchUrl();
    if (tab && !tab.closed) {
      tab.location.replace(url);
      return;
    }
    window.alert(options.blockedPopupMessage);
  } catch (e) {
    if (tab && !tab.closed) {
      tab.close();
    }
    throw e;
  }
}

export async function openStripeBillingPortalInNewTab(
  fetchPortalUrl: () => Promise<string>
): Promise<void> {
  return openStripeUrlInNewTab(fetchPortalUrl, {
    blockedPopupMessage:
      "Portal za upravljanje naročnine trenutno ni na voljo. Dovolite pojavna okna in poskusite znova.",
  });
}

export async function openStripeCheckoutInNewTab(
  fetchCheckoutUrl: () => Promise<string>
): Promise<void> {
  return openStripeUrlInNewTab(fetchCheckoutUrl, {
    blockedPopupMessage:
      "Nakupa ni bilo mogoče odpreti v novem zavihku. Dovolite pojavna okna in poskusite znova.",
  });
}
