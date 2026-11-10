import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map, of, switchMap, tap } from 'rxjs';
import { AgentContactService } from '../../shared/services/agent-contact.service';

/** A listing agent's photo; their initials when they have none or it fails to load. */
@Component({
  selector: 'app-agent-avatar',
  template: `
    @if (avatarUrl() && !failed()) {
      <img
        [src]="avatarUrl()"
        [alt]="name() ?? ''"
        (error)="failed.set(true)"
        class="h-12 w-12 shrink-0 rounded-full object-cover border border-gray-200"
      />
    } @else {
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-semibold text-gray-600"
        [attr.aria-label]="name() ?? ''"
        role="img"
      >
        {{ initials() }}
      </div>
    }
  `,
})
export class AgentAvatar {
  readonly agentId = input<number | null | undefined>();
  readonly name = input<string | null | undefined>();

  private contacts = inject(AgentContactService);
  readonly failed = signal(false);

  readonly avatarUrl = toSignal(
    toObservable(this.agentId).pipe(
      tap(() => this.failed.set(false)),
      switchMap((id) =>
        id == null ? of(null) : this.contacts.contact(id).pipe(map((contact) => contact.avatarUrl)),
      ),
    ),
    { initialValue: null },
  );

  readonly initials = computed(() => {
    const parts = (this.name() ?? '').trim().split(/\s+/).filter(Boolean);
    return parts
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  });
}
