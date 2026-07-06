/** Klik na label datuma odpre native picker (kot patch-search-date-picker-fix.py). */

import type { MouseEvent } from "react";

export function openSearchDatePicker(input: HTMLInputElement | null, event?: MouseEvent) {
  if (!input || input.disabled) return;
  if (event?.target === input) return;
  event?.preventDefault();
  try {
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
    }
  } catch {
    input.focus();
  }
}
