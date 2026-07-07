import { Conversation, IConversationRepository } from './IConversationRepository';
import { ConversationSchema, MessageSchema } from '@healthtribe/api-client';
import { AIAction } from '../useAIChat';

interface ClerkWindow extends Window {
  Clerk?: {
    session?: {
      getToken: () => Promise<string | null>;
    };
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiConversationRepository implements IConversationRepository {
  
  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const win = typeof window !== 'undefined' ? (window as unknown as ClerkWindow) : null;
    const token = win?.Clerk?.session?.getToken 
      ? await win.Clerk.session.getToken() 
      : null;
      
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    
    return fetch(`${API_URL}${url}`, {
      ...options,
      headers
    });
  }

  async listConversations(_userId: string): Promise<Conversation[]> {
    const response = await this.fetchWithAuth('/api/v1/ai/conversations');
    if (!response.ok) return [];
    
    const data: ConversationSchema[] = await response.json();
    return data.map((conv) => ({
      id: conv.id,
      title: conv.title,
      updatedAt: conv.updated_at,
      createdAt: conv.updated_at,
      messages: (conv.messages || []).map((msg: MessageSchema) => ({
        id: msg.id,
        role: (msg.role === 'assistant' ? 'model' : msg.role) as 'user' | 'model',
        content: msg.content,
        sources: msg.sources || [],
        actions: (msg.actions as AIAction[]) || [],
        isError: msg.is_error
      }))
    }));
  }

  async getConversation(id: string): Promise<Conversation | null> {
    const response = await this.fetchWithAuth('/api/v1/ai/conversations');
    if (!response.ok) return null;
    const data: ConversationSchema[] = await response.json();
    const conv = data.find((c) => c.id === id);
    if (!conv) return null;
    return {
      id: conv.id,
      title: conv.title,
      updatedAt: conv.updated_at,
      createdAt: conv.updated_at,
      messages: (conv.messages || []).map((msg: MessageSchema) => ({
        id: msg.id,
        role: (msg.role === 'assistant' ? 'model' : msg.role) as 'user' | 'model',
        content: msg.content,
        sources: msg.sources || [],
        actions: (msg.actions as AIAction[]) || [],
        isError: msg.is_error
      }))
    };
  }

  async saveConversation(_userId: string, conversation: Conversation): Promise<void> {
    await this.fetchWithAuth('/api/v1/ai/conversations/sync', {
      method: 'POST',
      body: JSON.stringify({
        id: conversation.id,
        title: conversation.title,
        messages: conversation.messages,
        context_payload: conversation.contextPayload
      })
    });
  }

  async deleteConversation(id: string): Promise<void> {
    await this.fetchWithAuth(`/api/v1/ai/conversations/${id}`, {
      method: 'DELETE'
    });
  }

  async renameConversation(id: string, newTitle: string): Promise<void> {
    await this.fetchWithAuth(`/api/v1/ai/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: newTitle })
    });
  }
}
