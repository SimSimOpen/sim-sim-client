import { Component, inject } from '@angular/core';
import { Currency, CurrencyService } from '../services/currency.service';
import { TranslatePipe } from './translate.pipe';

/** "USD $ | so'm" switch (same look as the admin panel's) that picks the currency prices show in. */
@Component({
  selector: 'app-currency-switcher',
  imports: [TranslatePipe],
  host: { class: 'inline-flex items-center' },
  template: `
    <div
      class="inline-flex rounded-md border border-gray-300 overflow-hidden text-xs font-semibold normal-case bg-white"
      role="group"
      [attr.aria-label]="'price.currency' | t"
    >
      @for (option of options; track option) {
        <button
          type="button"
          class="px-3 py-1.5 cursor-pointer whitespace-nowrap border-r border-gray-300 last:border-r-0"
          [class.bg-blue-700]="currency.code() === option"
          [class.text-white]="currency.code() === option"
          [class.text-gray-700]="currency.code() !== option"
          [attr.aria-pressed]="currency.code() === option"
          (click)="currency.set(option)"
        >
          {{ option === 'usd' ? 'USD $' : ('price.som' | t) }}
        </button>
      }
    </div>
  `,
})
export class CurrencySwitcher {
  currency = inject(CurrencyService);
  readonly options: Currency[] = ['usd', 'uzs'];
}
