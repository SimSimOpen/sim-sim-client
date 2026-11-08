import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { ToastrService } from 'ngx-toastr';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../../account/auth.service';
import { NOTIFICATION_URL, PRODUCT_URL } from '../constants/urls';
import { I18nService } from '../i18n/i18n.service';
import { ChatEventPayload, ChatMessage, Conversation } from '../models/chat';
import { EngagementService, ListingKind } from './engagement.service';

const CHAT_URL = `${PRODUCT_URL}/v1/chat`;
/** How many chat windows sit side by side on a wide screen, like LinkedIn; phones get one. */
const MAX_WINDOWS = 3;

export interface ChatWindow {
  conversationId: number;
  minimized: boolean;
}

/** A listing opened from a chat window's title, shown in the dock's own modal. */
export interface ViewedListing {
  kind: ListingKind;
  listing: any;
}

/**
 * Chats with listing agents for the signed-in user: the conversation list, the open chat windows in
 * the bottom-right dock, and live delivery of new messages over the notification SSE stream.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private engagement = inject(EngagementService);
  private toastr = inject(ToastrService);
  private i18n = inject(I18nService);

  readonly conversations = signal<Conversation[]>([]);
  readonly windows = signal<ChatWindow[]>([]);
  /** Messages per conversation id, oldest first; a missing key means not loaded yet. */
  readonly messages = signal<Record<number, ChatMessage[]>>({});
  /** Conversations with no older messages left to fetch. */
  readonly complete = signal<Set<number>>(new Set());
  /** The "Messaging" list at the bottom of the dock. */
  readonly listOpen = signal(false);
  readonly viewedListing = signal<ViewedListing | null>(null);

  readonly totalUnread = computed(() =>
    this.conversations().reduce((sum, c) => sum + (c.unread || 0), 0),
  );

  /** Chat button pressed while signed out: started once sign-in succeeds. */
  private pending: { kind: ListingKind; listingId: number } | null = null;
  private stream?: EventSourcePolyfill;
  private hasConnected = false;

  constructor() {
    effect(() => {
      const token = this.auth.token();
      untracked(() => (token ? this.signedIn(token) : this.signedOut()));
    });
  }

  conversation(id: number): Conversation | undefined {
    return this.conversations().find((c) => c.id === id);
  }

  /** The chat button on a listing: opens (or creates) the conversation with its agent. */
  startChat(kind: ListingKind, listingId: number) {
    if (!this.auth.isAuthenticated()) {
      this.pending = { kind, listingId };
      this.toastr.info(this.i18n.t('chat.signInFirst'));
      this.auth.signInOpen.set(true);
      return;
    }
    this.http.post<Conversation>(`${CHAT_URL}/conversations`, { kind, listingId }).subscribe({
      next: (conversation) => {
        this.upsert(conversation);
        this.openWindow(conversation.id);
      },
      error: (err) => this.toastr.error(this.errorText(err)),
    });
  }

  openWindow(id: number) {
    this.listOpen.set(false);
    const max = window.innerWidth < 640 ? 1 : MAX_WINDOWS;
    const others = this.windows().filter((w) => w.conversationId !== id);
    this.windows.set([{ conversationId: id, minimized: false }, ...others].slice(0, max));
    if (!(id in this.messages())) this.loadMessages(id);
    this.markRead(id);
  }

  closeWindow(id: number) {
    this.windows.update((ws) => ws.filter((w) => w.conversationId !== id));
  }

  toggleMinimized(id: number) {
    let opened = false;
    this.windows.update((ws) =>
      ws.map((w) => {
        if (w.conversationId !== id) return w;
        opened = w.minimized;
        return { ...w, minimized: !w.minimized };
      }),
    );
    if (opened) this.markRead(id);
  }

  send(id: number, body: string): Observable<ChatMessage> {
    return this.http
      .post<ChatMessage>(`${CHAT_URL}/conversations/${id}/messages`, { body })
      .pipe(
        tap({
          next: (message) => this.receive(message),
          error: (err) => this.toastr.error(this.errorText(err)),
        }),
      );
  }

  loadOlder(id: number) {
    const first = this.messages()[id]?.[0];
    if (!first || this.complete().has(id)) return;
    this.loadMessages(id, first.id);
  }

  /** The chat window's title: shows that listing's full modal on top of whatever page is open. */
  openListing(kind: ListingKind, listingId: number) {
    this.engagement.getListing<any>(kind, listingId).subscribe({
      next: (listing) => this.viewedListing.set({ kind, listing }),
      error: () => this.toastr.error(this.i18n.t('property.linkUnavailable')),
    });
  }

  closeListing() {
    this.viewedListing.set(null);
  }

  private signedIn(token: string) {
    this.http.get<Conversation[]>(`${CHAT_URL}/conversations`).subscribe({
      next: (list) => this.conversations.set(list),
      error: () => undefined,
    });
    this.connect(token);
    if (this.pending) {
      const { kind, listingId } = this.pending;
      this.pending = null;
      this.startChat(kind, listingId);
    }
  }

  private signedOut() {
    this.stream?.close();
    this.stream = undefined;
    this.hasConnected = false;
    this.conversations.set([]);
    this.windows.set([]);
    this.messages.set({});
    this.complete.set(new Set());
    this.listOpen.set(false);
  }

  private connect(token: string) {
    this.stream?.close();
    const stream = new EventSourcePolyfill(`${NOTIFICATION_URL}/stream`, {
      headers: { Authorization: `Bearer ${token}` },
      // The server sends a heartbeat every 20 s; reconnect if two go missing.
      heartbeatTimeout: 45000,
    });
    stream.onopen = () => {
      // Messages sent while the stream was down are not replayed, so catch up from the API.
      if (this.hasConnected) this.resync();
      this.hasConnected = true;
    };
    stream.addEventListener('chat', (event: any) => {
      try {
        const payload = JSON.parse(event.data) as ChatEventPayload;
        if (payload.type === 'message') this.receive(payload.message);
      } catch {
        // A malformed event is not worth breaking the stream over.
      }
    });
    this.stream = stream;
  }

  private resync() {
    this.http.get<Conversation[]>(`${CHAT_URL}/conversations`).subscribe({
      next: (list) => this.conversations.set(list),
      error: () => undefined,
    });
    for (const w of this.windows()) this.loadMessages(w.conversationId);
  }

  /** A message from the API response or the stream; both arrive for our own messages, so dedupe. */
  private receive(message: ChatMessage) {
    const id = message.conversationId;
    const known = this.conversation(id);
    if (!known) {
      // A conversation this tab has not seen yet (e.g. an agent's first message from a new client).
      this.http.get<Conversation>(`${CHAT_URL}/conversations/${id}`).subscribe({
        next: (c) => this.upsert(c),
        error: () => undefined,
      });
    }
    const list = this.messages()[id];
    if (list?.some((m) => m.id === message.id)) return;
    if (list) this.messages.update((all) => ({ ...all, [id]: [...list, message] }));
    if (!known) return;

    const mine = message.senderRole === known.role;
    const visible = this.windows().some((w) => w.conversationId === id && !w.minimized);
    this.upsert({
      ...known,
      lastMessage: message.body,
      lastSenderRole: message.senderRole,
      lastMessageAt: message.createdAt,
      unread: mine ? known.unread : visible ? 0 : known.unread + 1,
    });
    if (!mine && visible) this.markRead(id);
  }

  private loadMessages(id: number, before?: number) {
    const params: Record<string, number> = before ? { before } : {};
    this.http
      .get<ChatMessage[]>(`${CHAT_URL}/conversations/${id}/messages`, { params })
      .subscribe({
        next: (page) => {
          this.messages.update((all) => {
            const merged = before ? [...page, ...(all[id] ?? [])] : page;
            return { ...all, [id]: merged };
          });
          if (page.length < 50) this.complete.update((s) => new Set(s).add(id));
        },
        error: () => this.messages.update((all) => ({ ...all, [id]: all[id] ?? [] })),
      });
  }

  private markRead(id: number) {
    const c = this.conversation(id);
    if (c && c.unread) this.upsert({ ...c, unread: 0 });
    this.http.post(`${CHAT_URL}/conversations/${id}/read`, null).subscribe({ error: () => undefined });
  }

  /** Inserts or replaces a conversation, keeping the list ordered by latest activity. */
  private upsert(conversation: Conversation) {
    const rest = this.conversations().filter((c) => c.id !== conversation.id);
    const at = (c: Conversation) => c.lastMessageAt ?? '';
    this.conversations.set([conversation, ...rest].sort((a, b) => at(b).localeCompare(at(a))));
  }

  private errorText(err: any): string {
    const text = typeof err?.error === 'string' ? err.error.replace(/^Error /, '') : '';
    return text || this.i18n.t('chat.failed');
  }
}
