import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecondHandItem } from '../../shared/models/second-hand';
import { OfferType } from '../../shared/enums/PropertyStatus';
import { EnvironmentTs } from '../../environments/environment';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-second-hand-card',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './second-hand-card.html',
})
export class SecondHandCard {
  readonly item = input.required<SecondHandItem>();
  readonly OfferType = OfferType;

  readonly cover = computed(() => {
    const medias = this.item().medias ?? [];
    return (
      (medias.find((m) => m.isCoverImage) ?? medias[0])?.mediaUrl ??
      `${EnvironmentTs.MEDIA_URL}/real-estate-media/default/house.png`
    );
  });

  readonly name = computed(() => this.item().title || '');

  readonly place = computed(() =>
    (this.item().location ?? []).slice(0, 2).filter(Boolean).reverse().join(', '),
  );
}
