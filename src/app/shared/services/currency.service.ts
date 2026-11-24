import { effect, Injectable, signal } from '@angular/core';

export type Currency = 'usd' | 'uzs';

const STORAGE_KEY = 'simsim.currency';

/** Which currency listing prices are shown in. Remembered per browser; dollars by default. */
@Injectable({ providedIn: 'root' })
export class CurrencyService {
  readonly code = signal<Currency>(initialCurrency());

  constructor() {
    effect(() => {
      const code = this.code();
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {
        // Storage can be blocked (private mode); the choice then lasts for this visit only.
      }
    });
  }

  set(code: Currency) {
    this.code.set(code);
  }
}

function initialCurrency(): Currency {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'uzs' ? 'uzs' : 'usd';
  } catch {
    return 'usd';
  }
}
