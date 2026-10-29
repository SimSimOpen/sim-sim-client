import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceItem } from '../../shared/models/services';
import { PriceMode, ServiceKind } from '../../shared/enums/Services';
import { EnvironmentTs } from '../../environments/environment';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-service-card',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './service-card.html',
})
export class ServiceCard {
  readonly item = input.required<ServiceItem>();
  readonly ServiceKind = ServiceKind;
  readonly PriceMode = PriceMode;

  /** Photos are optional on services listings; fall back to the shared placeholder. */
  readonly cover = computed(() => {
    const medias = this.item().medias ?? [];
    return (
      (medias.find((m) => m.isCoverImage) ?? medias[0])?.mediaUrl ??
      `${EnvironmentTs.MEDIA_URL}/real-estate-media/default/house.png`
    );
  });

  readonly name = computed(() => this.item().title || '');

  readonly place = computed(() =>
    (this.item().location ?? []).slice(0, 3).filter(Boolean).reverse().join(', '),
  );

  /** A SEEKING listing's price is the poster's budget, so it gets its own label. */
  readonly isSeeking = computed(() => this.item().kind === ServiceKind.SEEKING);

  /** "$40" when the listing has a concrete price; null renders the Negotiable fallback. */
  readonly priceAmount = computed(() => {
    const i = this.item();
    if (i.price == null || i.priceMode == null || i.priceMode === PriceMode.NEGOTIABLE) return null;
    return `$${new Intl.NumberFormat('en-US').format(i.price)}`;
  });
}
