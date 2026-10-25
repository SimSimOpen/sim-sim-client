import { Component, computed, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecondHandItem } from '../../shared/models/second-hand';
import { OfferType } from '../../shared/enums/PropertyStatus';
import { SecondHandApiService } from '../../shared/services/second-hand/second-hand-api.service';
import { YandexMapComponent } from '../view-property-models/yandex-map';
import { EnvironmentTs } from '../../environments/environment';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-view-second-hand',
  imports: [CommonModule, YandexMapComponent, TranslatePipe],
  templateUrl: './view-second-hand.html',
  styleUrl: '../view-property-models/view-property/view-property.scss',
})
export class ViewSecondHand implements OnInit {
  readonly item = input.required<SecondHandItem>();
  @Output() closeModal = new EventEmitter<void>();

  private itemApi = inject(SecondHandApiService);
  readonly OfferType = OfferType;

  readonly views = signal(0);
  readonly selected = signal(0);

  /** Cover first, then the rest in upload order. */
  readonly images = computed(() => {
    const medias = this.item().medias ?? [];
    const sorted = [...medias.filter((m) => m.isCoverImage), ...medias.filter((m) => !m.isCoverImage)];
    return sorted.length
      ? sorted.map((m) => m.mediaUrl)
      : [`${EnvironmentTs.MEDIA_URL}/real-estate-media/default/house.png`];
  });

  readonly name = computed(() => this.item().title || '');

  readonly address = computed(() => [...this.item().location].reverse().filter(Boolean).join(', '));

  /** [translation key, value, is the value an enum key rendered via enum.secondhand.*] */
  readonly specs = computed(() => {
    const i = this.item();
    const rows: { label: string; value: string | null; enumKey?: boolean }[] = [
      { label: 'secondHand.subCategory', value: i.subCategory, enumKey: true },
      { label: 'secondHand.condition', value: i.condition, enumKey: true },
    ];
    return rows.filter((r) => !!r.value);
  });

  get hasPoint(): boolean {
    return this.item().latitude != null && this.item().longitude != null;
  }

  ngOnInit() {
    this.views.set(this.item().views);
    this.itemApi.incrementViews(this.item().id).subscribe({
      next: (views) => this.views.set(views),
      error: () => {
        // A missed view count must not break the page.
      },
    });
  }

  prev() {
    this.selected.update((i) => (i - 1 + this.images().length) % this.images().length);
  }

  next() {
    this.selected.update((i) => (i + 1) % this.images().length);
  }
}
