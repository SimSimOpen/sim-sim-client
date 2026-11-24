import { inject, Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../i18n/i18n.service';
import { Currency, CurrencyService } from '../services/currency.service';

/** Anything that carries the two listing prices: USD in `price`, so'm in `priceUzs`. */
export interface Priced {
  price?: number | string | null;
  priceUzs?: number | string | null;
}

/**
 * The price in the chosen currency ("$1,300" or "15 600 000 so'm"), falling back to the other one
 * when the listing has no price in the chosen currency; '' when neither is set. Listings carry both
 * currencies side by side, entered by the agent, so nothing here converts one into the other.
 */
export function formatPrices(
  item: Priced | null | undefined,
  i18n: I18nService,
  currency: Currency,
): string {
  if (!item) return '';
  const lang = i18n.lang();
  const usd = toAmount(item.price);
  const uzs = toAmount(item.priceUzs);
  const asUsd = (n: number) => `$${n.toLocaleString(lang)}`;
  const asUzs = (n: number) => `${n.toLocaleString(lang)} ${i18n.t('price.som')}`;
  if (currency === 'uzs') {
    return uzs != null ? asUzs(uzs) : usd != null ? asUsd(usd) : '';
  }
  return usd != null ? asUsd(usd) : uzs != null ? asUzs(uzs) : '';
}

/** Whether at least one of the two prices is filled in. */
export function hasPrice(item: Priced | null | undefined): boolean {
  return toAmount(item?.price) != null || toAmount(item?.priceUzs) != null;
}

function toAmount(value: number | string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** `{{ listing | prices }}`: impure so it re-renders when the language or currency changes. */
@Pipe({ name: 'prices', pure: false })
export class PricesPipe implements PipeTransform {
  private i18n = inject(I18nService);
  private currency = inject(CurrencyService);

  transform(item: Priced | null | undefined): string {
    return formatPrices(item, this.i18n, this.currency.code());
  }
}
