import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, shareReplay } from 'rxjs';
import { AUTH_URL } from '../constants/urls';

/** The public contact details of a listing's agent, as GET /v1/agents/{id}/contact returns them. */
export interface AgentContact {
  telegramUsername: string | null;
  /** Absolute URL on the public media host, or null when the agent has no photo. */
  avatarUrl: string | null;
}

const EMPTY_CONTACT: AgentContact = { telegramUsername: null, avatarUrl: null };

/**
 * One request per agent, shared by everything a listing modal shows about them
 * (the avatar and the Telegram button would otherwise each fetch it).
 */
@Injectable({ providedIn: 'root' })
export class AgentContactService {
  private http = inject(HttpClient);
  private cache = new Map<number, Observable<AgentContact>>();

  contact(agentId: number): Observable<AgentContact> {
    let request = this.cache.get(agentId);
    if (!request) {
      request = this.http.get<AgentContact>(`${AUTH_URL}/v1/agents/${agentId}/contact`).pipe(
        catchError(() => {
          // A failed lookup is not cached, so reopening the modal retries it.
          this.cache.delete(agentId);
          return of(EMPTY_CONTACT);
        }),
        shareReplay(1),
      );
      this.cache.set(agentId, request);
    }
    return request;
  }
}
