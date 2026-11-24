import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Currency, CurrencyService } from '../services/currency.service';
import { TranslatePipe } from './translate.pipe';

/** Two-segment `$ | so'm` toggle that picks which currency listing prices are shown in. */
@Component({
  selector: 'app-currency-switcher',
  imports: [NgClass, TranslatePipe],
  host: { class: 'inline-flex' },
  template: `
    <div
      role="radiogroup"
      [attr.aria-label]="'price.currency' | t"
      class="inline-flex h-9 items-center rounded-md border border-gray-200 p-0.5 text-sm font-medium"
    >
      @for (option of options; track option) {
        <button
          type="button"
          role="radio"
          [attr.aria-checked]="currency.code() === option"
          class="h-full rounded px-2.5 transition-colors cursor-pointer"
          [ngClass]="
            currency.code() === option
              ? 'bg-blue-700 text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          "
          (click)="currency.set(option)"
        >
          {{ option === 'usd' ? '$' : ('price.som' | t) }}
        </button>
      }
    </div>
  `,
})
export class CurrencySwitcher {
  currency = inject(CurrencyService);
  readonly options: Currency[] = ['usd', 'uzs'];
}
