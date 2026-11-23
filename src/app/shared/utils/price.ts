import { inject, Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../i18n/i18n.service';

/** Anything that carries the two listing prices: USD in `price`, so'm in `priceUzs`. */
export interface Priced {
  price?: number | string | null;
  priceUzs?: number | string | null;
}

/**
 * "$1,300 · 15 600 000 so'm", or just the one that is set; '' when neither is. Listings carry both
 * currencies side by side, entered by the agent, so nothing here converts one into the other.
 */
export function formatPrices(item: Priced | null | undefined, i18n: I18nService): string {
  if (!item) return '';
  const lang = i18n.lang();
  const parts: string[] = [];
  const usd = toAmount(item.price);
  const uzs = toAmount(item.priceUzs);
  if (usd != null) parts.push(`$${usd.toLocaleString(lang)}`);
  if (uzs != null) parts.push(`${uzs.toLocaleString(lang)} ${i18n.t('price.som')}`);
  return parts.join(' · ');
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

/** `{{ listing | prices }}` — impure so it re-renders when the language changes. */
@Pipe({ name: 'prices', pure: false })
export class PricesPipe implements PipeTransform {
  private i18n = inject(I18nService);

  /** `'usd'` shows only the dollar price, falling back to so'm when there is no dollar price. */
  transform(item: Priced | null | undefined, only?: 'usd'): string {
    if (only === 'usd' && item && toAmount(item.price) != null) {
      return formatPrices({ price: item.price }, this.i18n);
    }
    return formatPrices(item, this.i18n);
  }
}
