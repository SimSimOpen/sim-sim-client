import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-filter',
  imports: [CommonModule],
  template: ` <div
    class="absolute md:static z-10 w-full md:w-64 shrink-0 hidden md:block"
    [ngClass]="{ hidden: !isFilterOpen }"
  >
    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-28 space-y-8">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
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
            class="lucide lucide-funnel h-5 w-5"
            aria-hidden="true"
          >
            <path
              d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"
            ></path>
          </svg>
          Filters
        </h2>
        <button class="text-sm text-blue-600 font-medium hover:text-blue-800">Reset</button>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-900 mb-3">Property Type</h3>
        <div class="space-y-2">
          <label class="flex items-center gap-2 cursor-pointer"
            ><input
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            /><span class="text-sm text-gray-700">House</span></label
          ><label class="flex items-center gap-2 cursor-pointer"
            ><input
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            /><span class="text-sm text-gray-700">Apartment</span></label
          ><label class="flex items-center gap-2 cursor-pointer"
            ><input
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            /><span class="text-sm text-gray-700">Condo</span></label
          ><label class="flex items-center gap-2 cursor-pointer"
            ><input
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            /><span class="text-sm text-gray-700">Townhouse</span></label
          >
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
        <div class="flex items-center gap-2">
          <div class="w-full">
            <div class="relative">
              <input
                id="we4o3excg"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500 border px-3 py-2"
                placeholder="Min"
                type="number"
              />
            </div>
          </div>
          <span class="text-gray-400">-</span>
          <div class="w-full">
            <div class="relative">
              <input
                id="zzk1hv5jc"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500 border px-3 py-2"
                placeholder="Max"
                type="number"
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-900 mb-3">Bedrooms</h3>
        <div class="flex gap-2">
          <button
            class="flex-1 py-1.5 text-sm border border-gray-200 rounded-md hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            Any
          </button>
          <button
            class="flex-1 py-1.5 text-sm border border-gray-200 rounded-md hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            1+
          </button>
          <button
            class="flex-1 py-1.5 text-sm border border-gray-200 rounded-md hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            2+
          </button>
          <button
            class="flex-1 py-1.5 text-sm border border-gray-200 rounded-md hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            3+
          </button>
          <button
            class="flex-1 py-1.5 text-sm border border-gray-200 rounded-md hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            4+
          </button>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-900 mb-3">Bathrooms</h3>
        <div class="flex gap-2">
          <button
            class="flex-1 py-1.5 text-sm border border-gray-200 rounded-md hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            Any
          </button>
          <button
            class="flex-1 py-1.5 text-sm border border-gray-200 rounded-md hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            1+
          </button>
          <button
            class="flex-1 py-1.5 text-sm border border-gray-200 rounded-md hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            2+
          </button>
          <button
            class="flex-1 py-1.5 text-sm border border-gray-200 rounded-md hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            3+
          </button>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-900 mb-3">Amenities</h3>
        <div class="space-y-2">
          <label class="flex items-center gap-2 cursor-pointer"
            ><input
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            /><span class="text-sm text-gray-700">Parking</span></label
          ><label class="flex items-center gap-2 cursor-pointer"
            ><input
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            /><span class="text-sm text-gray-700">Pool</span></label
          ><label class="flex items-center gap-2 cursor-pointer"
            ><input
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            /><span class="text-sm text-gray-700">Gym</span></label
          ><label class="flex items-center gap-2 cursor-pointer"
            ><input
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            /><span class="text-sm text-gray-700">Pet Friendly</span></label
          ><label class="flex items-center gap-2 cursor-pointer"
            ><input
              type="checkbox"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            /><span class="text-sm text-gray-700">Washer/Dryer</span></label
          >
        </div>
      </div>
      <button
        class="inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-700 shadow-sm h-10 px-4 py-2 text-sm w-full"
      >
        Apply Filters
      </button>
    </div>
  </div>`,
})
export class Filter {
  @Input() isFilterOpen: boolean = false;
}
