/** Odpre native date picker — samo prek showPicker(), z preventDefault za eno pot odpiranja. */

type SearchDatePickerEvent = {
  preventDefault: () => void;
};

export function openSearchDatePicker(
  input: HTMLInputElement | null,
  event?: SearchDatePickerEvent,
): void {
  if (!input || input.disabled || input.readOnly) return;

  if (typeof input.showPicker !== "function") {
    return;
  }

  event?.preventDefault();
  input.focus({ preventScroll: true });

  try {
    input.showPicker();
  } catch {
    // Native vedenje oziroma fokus ostaneta varen fallback.
  }
}
