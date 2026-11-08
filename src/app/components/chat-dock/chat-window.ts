import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { ChatService, ChatWindow as WindowState } from '../../shared/services/chat.service';

/** One conversation in the dock: a header with the listing title, the messages and a composer. */
@Component({
  selector: 'app-chat-window',
  imports: [DatePipe, FormsModule, TranslatePipe],
  template: `
    @if (conversation(); as c) {
      <div
        class="pointer-events-auto flex flex-col bg-white border border-gray-200 rounded-t-lg shadow-2xl w-[calc(100vw-1rem)] sm:w-80"
        [class.h-[28rem]]="!state().minimized"
      >
        <div
          class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 cursor-pointer select-none"
          (click)="chat.toggleMinimized(c.id)"
        >
          <div class="min-w-0 flex-1">
            <button
              type="button"
              class="block max-w-full truncate text-left text-sm font-semibold text-gray-900 hover:text-blue-700 hover:underline"
              [title]="'chat.openListing' | t"
              (click)="$event.stopPropagation(); chat.openListing(c.kind, c.listingId)"
            >
              {{ c.listingTitle || ('chat.untitled' | t) }}
            </button>
            @if (c.counterpartName) {
              <div class="truncate text-xs text-gray-500">{{ c.counterpartName }}</div>
            }
          </div>
          @if (state().minimized && c.unread) {
            <span class="rounded-full bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5">
              {{ c.unread }}
            </span>
          }
          <button
            type="button"
            class="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            [attr.aria-label]="(state().minimized ? 'chat.expand' : 'chat.minimize') | t"
            (click)="$event.stopPropagation(); chat.toggleMinimized(c.id)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
              @if (state().minimized) {
                <path d="m18 15-6-6-6 6"></path>
              } @else {
                <path d="m6 9 6 6 6-6"></path>
              }
            </svg>
          </button>
          <button
            type="button"
            class="p-1 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            [attr.aria-label]="'chat.close' | t"
            (click)="$event.stopPropagation(); chat.closeWindow(c.id)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>

        @if (!state().minimized) {
          <div #scroller class="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-gray-50">
            @if (messages() === undefined) {
              <p class="text-center text-xs text-gray-400 py-6">{{ 'common.loading' | t }}</p>
            } @else {
              @if (!chat.complete().has(c.id)) {
                <button
                  type="button"
                  class="block mx-auto text-xs text-blue-700 hover:underline"
                  (click)="loadOlder()"
                >
                  {{ 'chat.older' | t }}
                </button>
              }
              @if (!messages()!.length) {
                <p class="text-center text-xs text-gray-400 py-6">{{ 'chat.empty' | t }}</p>
              }
              @for (m of messages(); track m.id) {
                @let mine = m.senderRole === c.role;
                <div class="flex" [class.justify-end]="mine">
                  <div
                    class="max-w-[80%] rounded-2xl px-3 py-1.5 text-sm whitespace-pre-wrap break-words"
                    [class]="mine ? 'bg-blue-700 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'"
                  >
                    {{ m.body }}
                    <div class="text-[10px] mt-0.5 text-right" [class]="mine ? 'text-blue-100' : 'text-gray-400'">
                      {{ m.createdAt | date: (isToday(m.createdAt) ? 'HH:mm' : 'dd.MM HH:mm') }}
                    </div>
                  </div>
                </div>
              }
            }
          </div>
          <form class="flex items-end gap-2 p-2 border-t border-gray-100" (ngSubmit)="send()">
            <textarea
              name="draft"
              rows="1"
              maxlength="2000"
              class="flex-1 resize-none max-h-28 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
              [placeholder]="'chat.placeholder' | t"
              [(ngModel)]="draft"
              (keydown.enter)="onEnter($event)"
            ></textarea>
            <button
              type="submit"
              class="h-9 rounded-md bg-blue-700 px-3 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50"
              [disabled]="sending() || !draft.trim()"
            >
              {{ 'chat.send' | t }}
            </button>
          </form>
        }
      </div>
    }
  `,
})
export class ChatWindowComponent {
  readonly state = input.required<WindowState>();
  readonly chat = inject(ChatService);

  readonly conversation = computed(() => this.chat.conversation(this.state().conversationId));
  readonly messages = computed(() => this.chat.messages()[this.state().conversationId]);
  readonly sending = signal(false);
  draft = '';

  private readonly scroller = viewChild<ElementRef<HTMLDivElement>>('scroller');
  private loadingOlder = false;

  constructor() {
    // Follow the newest message, except when older ones were just added above.
    effect(() => {
      const last = this.messages()?.at(-1)?.id;
      const el = this.scroller()?.nativeElement;
      untracked(() => {
        if (!el || last === undefined) return;
        if (this.loadingOlder) {
          this.loadingOlder = false;
          return;
        }
        setTimeout(() => (el.scrollTop = el.scrollHeight));
      });
    });
  }

  onEnter(event: Event) {
    const key = event as KeyboardEvent;
    if (key.shiftKey) return; // Shift+Enter keeps a line break
    event.preventDefault();
    this.send();
  }

  send() {
    const body = this.draft.trim();
    if (!body || this.sending()) return;
    this.sending.set(true);
    this.chat.send(this.state().conversationId, body).subscribe({
      next: () => {
        this.draft = '';
        this.sending.set(false);
      },
      error: () => this.sending.set(false),
    });
  }

  loadOlder() {
    this.loadingOlder = true;
    this.chat.loadOlder(this.state().conversationId);
  }

  isToday(iso: string): boolean {
    return new Date(iso).toDateString() === new Date().toDateString();
  }
}
