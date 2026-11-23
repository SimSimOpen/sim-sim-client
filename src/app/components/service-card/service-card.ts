import { CardGallery } from '../card-gallery/card-gallery';
import { ViewCount } from '../view-count/view-count';
import { formatPrices, hasPrice } from '../../shared/utils/price';
import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceItem } from '../../shared/models/services';
import { PriceMode, ServiceKind } from '../../shared/enums/Services';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { I18nService } from '../../shared/i18n/i18n.service';

@Component({
  selector: 'app-service-card',
  imports: [CardGallery, ViewCount, CommonModule, TranslatePipe],
  templateUrl: './service-card.html',
})
export class ServiceCard {
  private i18n = inject(I18nService);
  readonly item = input.required<ServiceItem>();
  readonly ServiceKind = ServiceKind;
  readonly PriceMode = PriceMode;


  readonly name = computed(() => this.item().title || '');

  readonly place = computed(() =>
    (this.item().location ?? []).slice(0, 3).filter(Boolean).reverse().join(', '),
  );

  /** A SEEKING listing's price is the poster's budget, so it gets its own label. */
  readonly isSeeking = computed(() => this.item().kind === ServiceKind.SEEKING);

  /** "$40 · 500 000 so'm" when the listing has a concrete price; null renders the Negotiable fallback. */
  readonly priceAmount = computed(() => {
    const i = this.item();
    if (!hasPrice(i) || i.priceMode == null || i.priceMode === PriceMode.NEGOTIABLE) return null;
    return formatPrices(i, this.i18n);
  });
}
