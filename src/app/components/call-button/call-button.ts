import { Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

const CLASSES =
  'flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-700 text-white focus:ring-blue-700 shadow-sm h-10 px-4 py-2 text-sm w-full gap-2';

/**
 * The blue Call button every listing modal shows above the agent card. Always present so the modals
 * look alike; greyed out when the listing has no phone number instead of linking to "tel:null".
 */
@Component({
  selector: 'app-call-button',
  imports: [NgTemplateOutlet, TranslatePipe],
  template: `
    <div class="space-y-3">
      @if (phone(); as number) {
        <a [href]="'tel:' + number" [class]="classes + ' hover:bg-blue-800'">
          <ng-container *ngTemplateOutlet="icon"></ng-container>
          {{ 'property.call' | t }}
        </a>
      } @else {
        <button
          type="button"
          disabled
          [class]="classes + ' opacity-50 cursor-not-allowed'"
          [title]="'property.phoneUnavailable' | t"
        >
          <ng-container *ngTemplateOutlet="icon"></ng-container>
          {{ 'property.call' | t }}
        </button>
      }
    </div>
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
        class="lucide lucide-phone h-4 w-4"
        aria-hidden="true"
      >
        <path
          d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"
        ></path>
      </svg>
    </ng-template>
  `,
})
export class CallButton {
  readonly phone = input<string | null | undefined>();
  readonly classes = CLASSES;
}
