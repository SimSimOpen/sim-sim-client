import { ListingKind } from '../services/engagement.service';

/** Which side of a conversation: the visitor who asked, or the listing's agent. */
export type ChatRole = 'CLIENT' | 'AGENT';

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderRole: ChatRole;
  body: string;
  createdAt: string;
}

/** A conversation as the signed-in user sees it; `role` is their own side. */
export interface Conversation {
  id: number;
  kind: ListingKind;
  listingId: number;
  listingTitle: string | null;
  role: ChatRole;
  counterpartName: string | null;
  lastMessage: string | null;
  lastSenderRole: ChatRole | null;
  lastMessageAt: string | null;
  unread: number;
}

/** Data of the `chat` event on /api/event/stream. */
export interface ChatEventPayload {
  type: 'message';
  conversationId: number;
  message: ChatMessage;
}
