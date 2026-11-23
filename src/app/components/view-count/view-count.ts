import { Component, computed, inject, input } from '@angular/core';
import { I18nService } from '../../shared/i18n/i18n.service';

/**
 * Eye icon + view count. Replaces "{n} views", which runs long in Uzbek and Russian; the full
 * translated phrase stays as the tooltip and for screen readers.
 */
@Component({
  selector: 'app-view-count',
  host: {
    class: 'inline-flex items-center gap-1 whitespace-nowrap',
    role: 'img',
    '[attr.title]': 'label()',
    '[attr.aria-label]': 'label()',
  },
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-3.5 w-3.5 shrink-0"
      aria-hidden="true"
    >
      <path
        d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
    <span aria-hidden="true">{{ formatted() }}</span>
  `,
})
export class ViewCount {
  private i18n = inject(I18nService);

  readonly count = input<number | null | undefined>(0);

  readonly formatted = computed(() => (this.count() ?? 0).toLocaleString(this.i18n.lang()));
  readonly label = computed(() => this.i18n.t('property.views', { count: this.count() ?? 0 }));
}
