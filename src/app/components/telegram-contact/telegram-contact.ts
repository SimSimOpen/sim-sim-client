import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';
import { AUTH_URL } from '../../shared/constants/urls';
import { NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

const BUTTON_CLASSES =
  'flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border border-gray-300 bg-transparent text-gray-700 h-8 px-3 text-xs gap-2';

/** Opens a chat with the listing's agent; disabled when the agent has not set a Telegram username. */
@Component({
  selector: 'app-telegram-contact',
  imports: [NgTemplateOutlet, TranslatePipe],
  host: { class: 'contents' },
  template: `
    @if (href(); as link) {
      <a [href]="link" target="_blank" rel="noopener noreferrer" [class]="classes + ' hover:bg-gray-50'">
        <ng-container *ngTemplateOutlet="icon"></ng-container>
        Telegram
      </a>
    } @else {
      <button
        type="button"
        disabled
        [class]="classes + ' opacity-50 cursor-not-allowed'"
        [title]="'property.telegramUnavailable' | t"
      >
        <ng-container *ngTemplateOutlet="icon"></ng-container>
        Telegram
      </button>
    }
    <ng-template #icon>
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
        class="lucide lucide-send h-3.5 w-3.5"
        aria-hidden="true"
      >
        <path d="m22 2-7 20-4-9-9-4Z"></path>
        <path d="M22 2 11 13"></path>
      </svg>
    </ng-template>
  `,
})
export class TelegramContact {
  readonly agentId = input<number | null | undefined>();

  readonly classes = BUTTON_CLASSES;
  private http = inject(HttpClient);

  private readonly username = toSignal(
    toObservable(this.agentId).pipe(
      switchMap((id) =>
        id == null
          ? of(null)
          : this.http
              .get<{ telegramUsername: string | null }>(`${AUTH_URL}/v1/agents/${id}/contact`)
              .pipe(
                map((contact) => contact.telegramUsername),
                catchError(() => of(null)),
              ),
      ),
    ),
    { initialValue: null },
  );

  /** A t.me link, not tg://: it opens the app on phones and offers a web fallback elsewhere. */
  readonly href = computed(() => {
    const username = this.username();
    return username ? `https://t.me/${username}` : null;
  });
}
