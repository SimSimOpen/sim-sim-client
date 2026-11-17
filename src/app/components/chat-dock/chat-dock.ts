import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../account/auth.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { ChatService } from '../../shared/services/chat.service';
import { ModalComponent } from '../modal/modal.component';
import { ViewCar } from '../view-car/view-car';
import { ViewProperty } from '../view-property-models/view-property/view-property';
import { ViewSecondHand } from '../view-second-hand/view-second-hand';
import { ViewService } from '../view-service/view-service';
import { ChatWindowComponent } from './chat-window';

/**
 * LinkedIn-style chat dock pinned to the bottom-right corner: a "Messages" list on the right and the
 * open chat windows beside it. A window's title opens its listing in this dock's own modal, so it
 * works from any page.
 */
@Component({
  selector: 'app-chat-dock',
  imports: [
    DatePipe,
    TranslatePipe,
    ChatWindowComponent,
    ModalComponent,
    ViewProperty,
    ViewCar,
    ViewSecondHand,
    ViewService,
  ],
  template: `
    @if (auth.isAuthenticated()) {
      <div
        class="fixed bottom-0 right-0 z-[110] flex flex-row-reverse items-end gap-2 px-2 sm:pr-4 pointer-events-none"
      >
        <div
          class="pointer-events-auto w-72 bg-white border border-gray-200 rounded-t-lg shadow-2xl {{
            chat.windows().length ? 'hidden sm:block' : ''
          }}"
        >
          <button
            type="button"
            class="flex w-full items-center gap-2 px-3 py-2.5 text-left"
            (click)="chat.listOpen.set(!chat.listOpen())"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="h-4 w-4 text-blue-700"
            >
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
            </svg>
            <span class="flex-1 text-sm font-semibold text-gray-900">{{
              'chat.messages' | t
            }}</span>
            @if (chat.totalUnread()) {
              <span
                class="rounded-full bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5"
              >
                {{ chat.totalUnread() }}
              </span>
            }
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="h-4 w-4 text-gray-500"
            >
              @if (chat.listOpen()) {
                <path d="m6 9 6 6 6-6"></path>
              } @else {
                <path d="m18 15-6-6-6 6"></path>
              }
            </svg>
          </button>
          @if (chat.listOpen()) {
            <!-- Always first: a direct line to the SimSim admins, whether or not other chats exist. -->
            @if (!support()) {
              <button
                type="button"
                class="flex w-full items-center gap-2 px-3 py-2.5 text-left border-t border-gray-100 bg-violet-50 hover:bg-violet-100"
                (click)="chat.startSupport()"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="h-4 w-4 text-violet-700"
                >
                  <path
                    d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z"
                  ></path>
                  <path d="M21 16v2a4 4 0 0 1-4 4h-5"></path>
                </svg>
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-semibold text-violet-800">
                    {{ 'chat.talkToAdmin' | t }}
                  </div>
                  <div class="truncate text-xs text-violet-700/80">
                    {{ 'chat.talkToAdminHint' | t }}
                  </div>
                </div>
              </button>
            }
            <ul class="max-h-96 overflow-y-auto border-t border-gray-100">
              @for (c of chat.conversations(); track c.id) {
                <li>
                  <button
                    type="button"
                    class="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-gray-50"
                    (click)="chat.openWindow(c.id)"
                  >
                    <div class="min-w-0 flex-1">
                      @if (c.support) {
                        <div class="truncate text-sm font-semibold text-violet-800">
                          {{ 'chat.support' | t }}
                        </div>
                        <div class="truncate text-xs text-gray-500">
                          {{ c.lastMessage || ('chat.talkToAdminHint' | t) }}
                        </div>
                      } @else {
                        <div class="truncate text-sm font-medium text-gray-900">
                          {{ c.listingTitle || ('chat.untitled' | t) }}
                        </div>
                        <div class="truncate text-xs text-gray-500">
                          {{ c.counterpartName }}
                          @if (c.lastMessage) {
                            · {{ c.lastMessage }}
                          }
                        </div>
                      }
                    </div>
                    <div class="flex flex-col items-end gap-1">
                      @if (c.lastMessageAt) {
                        <span class="text-[10px] text-gray-400">{{
                          c.lastMessageAt | date: 'dd.MM'
                        }}</span>
                      }
                      @if (c.unread) {
                        <span
                          class="rounded-full bg-red-500 text-white text-[10px] font-semibold px-1.5"
                        >
                          {{ c.unread }}
                        </span>
                      }
                    </div>
                  </button>
                </li>
              }
            </ul>
          }
        </div>
        @for (w of chat.windows(); track w.conversationId) {
          <app-chat-window [state]="w" />
        }
      </div>
    }

    <app-modal
      [isVisible]="!!chat.viewedListing()"
      (close)="chat.closeListing()"
      [closeOnBackdropClick]="true"
      [showCloseButton]="false"
    >
      @if (chat.viewedListing(); as v) {
        @switch (v.kind) {
          @case ('PROPERTY') {
            <app-view-property [property]="v.listing" (closeModal)="chat.closeListing()" />
          }
          @case ('CAR') {
            <app-view-car [car]="v.listing" (closeModal)="chat.closeListing()" />
          }
          @case ('SECOND_HAND') {
            <app-view-second-hand [item]="v.listing" (closeModal)="chat.closeListing()" />
          }
          @case ('SERVICE') {
            <app-view-service [item]="v.listing" (closeModal)="chat.closeListing()" />
          }
        }
      }
    </app-modal>
  `,
})
export class ChatDock {
  readonly chat = inject(ChatService);
  readonly auth = inject(AuthService);
  /** The user's support chat, once it exists; it is then listed like any other conversation. */
  readonly support = computed(() => this.chat.conversations().find((c) => c.support));
}
