import { Component, Input } from '@angular/core';
import { Property } from '../../shared/models/properties';
import { TelegramContact } from '../telegram-contact/telegram-contact';
import { AgentAvatar } from '../agent-avatar/agent-avatar';
import { ChatButton } from '../chat-button/chat-button';
import { CallButton } from '../call-button/call-button';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-about-agent',
  standalone: true,
  imports: [TranslatePipe, TelegramContact, AgentAvatar, ChatButton, CallButton],
  template: ` <div class="flex flex-1 flex-col">
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm flex-1">
      <div class="p-6">
        <div class="space-y-6">
          <div data-id="element-330">
            <div class="text-2xl font-bold text-gray-900">$ {{ property?.price }}</div>
            <div class="text-sm text-gray-500">{{ 'property.perMonthUtilities' | t }}</div>
          </div>
          <app-call-button [phone]="property?.ownerContact" />
          <div class="pt-4 border-t border-gray-100" data-id="element-337">
            <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
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
                class="lucide lucide-shield-check h-4 w-4 text-green-500"
                aria-hidden="true"
              >
                <path
                  d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
                ></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <span>{{ 'property.verified' | t }}</span>
            </div>
            <div class="flex items-center gap-4">
              <app-agent-avatar [agentId]="property?.agentID" [name]="property?.agent" />
              <div>
                <div class="font-medium text-gray-900">{{ property?.agent }}</div>
                <div class="text-xs text-gray-500">{{ 'property.agentRole' | t }}</div>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-2">
              @if (property?.id; as id) {
                <app-chat-button kind="PROPERTY" [listingId]="id" />
              }
              <app-telegram-contact [agentId]="property?.agentID" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`,
})
export class AboutAgent {
  @Input() property: Property | null = null;
}
