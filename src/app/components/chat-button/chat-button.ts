import { Component, inject, input } from '@angular/core';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { ChatService } from '../../shared/services/chat.service';
import { ListingKind } from '../../shared/services/engagement.service';

/** Sits next to the Telegram button: opens this listing's chat window (sign-in first if needed). */
@Component({
  selector: 'app-chat-button',
  imports: [TranslatePipe],
  host: { class: 'contents' },
  template: `
    <button
      type="button"
      class="flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 h-8 px-3 text-xs gap-2"
      (click)="chat.startChat(kind(), listingId())"
    >
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
        class="lucide lucide-message-circle h-3.5 w-3.5"
        aria-hidden="true"
      >
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
      </svg>
      {{ 'chat.button' | t }}
    </button>
  `,
})
export class ChatButton {
  readonly kind = input.required<ListingKind>();
  readonly listingId = input.required<number>();
  readonly chat = inject(ChatService);
}
