import { Component, computed, inject, input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EngagementService, ListingKind } from '../../shared/services/engagement.service';
import { I18nService } from '../../shared/i18n/i18n.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

const BUTTON_CLASSES =
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 h-10 px-4 py-2 text-sm gap-2';

/** The Share and Save buttons every listing modal shows in its header. */
@Component({
  selector: 'app-listing-actions',
  imports: [TranslatePipe],
  host: { class: 'flex items-center gap-3' },
  template: `
    <button type="button" [class]="buttonClasses" (click)="share()">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-share-2 h-4 w-4"
        aria-hidden="true"
      >
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"></line>
        <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"></line>
      </svg>
      {{ 'property.share' | t }}
    </button>
    <button
      type="button"
      [class]="buttonClasses"
      [attr.aria-pressed]="saved()"
      (click)="toggleSaved()"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        [attr.fill]="saved() ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-heart h-4 w-4"
        [class.text-red-500]="saved()"
        aria-hidden="true"
      >
        <path
          d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
        ></path>
      </svg>
      {{ (saved() ? 'property.saved' : 'property.save') | t }}
    </button>
  `,
})
export class ListingActions {
  readonly kind = input.required<ListingKind>();
  readonly listingId = input.required<number>();
  readonly title = input<string | null | undefined>();

  readonly buttonClasses = BUTTON_CLASSES;
  readonly saved = computed(() => this.engagement.isSaved(this.kind(), this.listingId()));

  private engagement = inject(EngagementService);
  private toastr = inject(ToastrService);
  private i18n = inject(I18nService);

  toggleSaved() {
    this.engagement.toggleSaved(this.kind(), this.listingId()).subscribe({
      error: () => this.toastr.error(this.i18n.t('property.saveError')),
    });
  }

  /** The system share sheet where there is one (phones), otherwise the link goes to the clipboard. */
  async share() {
    const url = this.engagement.shareUrl(this.kind(), this.listingId());
    if (navigator.share) {
      try {
        await navigator.share({ title: this.title() ?? undefined, url });
        this.engagement.recordShare(this.kind(), this.listingId());
      } catch (err) {
        // AbortError means the visitor closed the sheet. Anything else: fall back to copying.
        if ((err as DOMException)?.name !== 'AbortError') await this.copy(url);
      }
      return;
    }
    await this.copy(url);
  }

  private async copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      this.toastr.success(this.i18n.t('property.linkCopied'));
    } catch {
      // Clipboard access is refused on plain http and in some browsers: let them copy it by hand.
      window.prompt(this.i18n.t('property.copyLinkPrompt'), url);
    }
    this.engagement.recordShare(this.kind(), this.listingId());
  }
}
