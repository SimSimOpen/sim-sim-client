import { Component, computed, input, signal } from '@angular/core';
import { PropertyMedia } from '../../shared/models/properties';
import { EnvironmentTs } from '../../environments/environment';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

/** How many photos a card lets you scrub through before showing "+N more photos". */
const MAX_SLOTS = 4;

/**
 * A card's photo. With a mouse, moving across it from left to right flips through the
 * first few photos (cover first); the last slot shows how many more the listing has.
 */
@Component({
  selector: 'app-card-gallery',
  imports: [TranslatePipe],
  templateUrl: './card-gallery.html',
})
export class CardGallery {
  readonly medias = input<PropertyMedia[] | undefined | null>([]);
  readonly alt = input('');

  readonly index = signal(0);
  private preloaded = false;

  /** Cover photo first, then the rest in their saved order. */
  private readonly ordered = computed(() => {
    const list = (this.medias() ?? []).filter((m) => m?.mediaUrl);
    const cover = list.find((m) => m.isCoverImage) ?? list[0];
    return cover ? [cover, ...list.filter((m) => m !== cover)] : [];
  });

  readonly slots = computed(() => {
    const urls = this.ordered()
      .slice(0, MAX_SLOTS)
      .map((m) => m.mediaUrl);
    return urls.length ? urls : [`${EnvironmentTs.MEDIA_URL}/real-estate-media/default/house.png`];
  });

  readonly moreCount = computed(() => Math.max(0, this.ordered().length - MAX_SLOTS));
  readonly current = computed(() => this.slots()[Math.min(this.index(), this.slots().length - 1)]);
  readonly showMore = computed(
    () => this.moreCount() > 0 && this.index() === this.slots().length - 1,
  );

  onEnter() {
    if (this.preloaded) return;
    this.preloaded = true;
    for (const url of this.slots().slice(1)) new Image().src = url;
  }

  onMove(event: MouseEvent) {
    const n = this.slots().length;
    if (n < 2) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    this.index.set(Math.min(n - 1, Math.max(0, Math.floor(ratio * n))));
  }

  onLeave() {
    this.index.set(0);
  }
}
