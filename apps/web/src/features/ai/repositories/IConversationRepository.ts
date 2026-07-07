import { AIMessage } from '../useAIChat';

export interface Conversation {
  id: string;
  title: string;
  messages: AIMessage[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contextPayload?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface IConversationRepository {
  /**
   * Fetch all conversations for a user, sorted by updatedAt descending.
   */
  listConversations(userId: string): Promise<Conversation[]>;

  /**
   * Fetch a specific conversation by ID.
   */
  getConversation(id: string): Promise<Conversation | null>;

  /**
   * Save a conversation (create or update).
   */
  saveConversation(userId: string, conversation: Conversation): Promise<void>;

  /**
   * Delete a conversation by ID.
   */
  deleteConversation(id: string): Promise<void>;

  /**
   * Rename a conversation by ID.
   */
  renameConversation(id: string, newTitle: string): Promise<void>;
}
