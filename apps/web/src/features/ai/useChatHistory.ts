import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Conversation } from './repositories/IConversationRepository';
import { ApiConversationRepository } from './repositories/ApiConversationRepository';
import { AIMessage } from './useAIChat';

// Factory to get repository
const repository = new ApiConversationRepository();

export function useChatHistory() {
  const { userId, isLoaded } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeConversationId');
    }
    return null;
  });
  
  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem('activeConversationId', activeConversationId);
    } else {
      localStorage.removeItem('activeConversationId');
    }
  }, [activeConversationId]);

  const [isLoading, setIsLoading] = useState(true);
  
  // Use a ref to keep track of conversations to avoid dependency cycles in saveActiveChat
  const conversationsRef = useRef<Conversation[]>([]);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const loadConversations = useCallback(async () => {
    if (!isLoaded) return;
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const list = await repository.listConversations(userId);
    setConversations(list);
    setIsLoading(false);
  }, [userId, isLoaded]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadConversations();
  }, [loadConversations]);

  const createNewChat = useCallback(() => {
    setActiveConversationId(null);
  }, []);

  const loadChat = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const renameChat = useCallback(async (id: string, newTitle: string) => {
    await repository.renameConversation(id, newTitle);
    await loadConversations();
  }, [loadConversations]);

  const deleteChat = useCallback(async (id: string) => {
    await repository.deleteConversation(id);
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
    await loadConversations();
  }, [activeConversationId, loadConversations]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveActiveChat = useCallback(async (messages: AIMessage[], title?: string, contextPayload?: Record<string, any>) => {
    if (!userId || messages.length === 0) return;
    
    let currentId = activeConversationId;
    if (!currentId) {
      currentId = crypto.randomUUID();
      setActiveConversationId(currentId);
    }

    const now = new Date().toISOString();
    
    // Find in local state instead of slow network call
    const existingChat = conversationsRef.current.find(c => c.id === currentId);
    
    const titleToSave = title || existingChat?.title || 'New Chat';
    const hasMessagesChanged = !existingChat || JSON.stringify(existingChat.messages) !== JSON.stringify(messages);
    if (existingChat && !hasMessagesChanged && existingChat.title === titleToSave) {
      return;
    }

    const chatToSave: Conversation = {
      id: currentId,
      title: title || existingChat?.title || 'New Chat',
      messages,
      contextPayload: contextPayload || existingChat?.contextPayload,
      createdAt: existingChat?.createdAt || now,
      updatedAt: now
    };

    try {
      await repository.saveConversation(userId, chatToSave);
      await loadConversations();
    } catch (error) {
      console.error("Failed to save conversation:", error);
    }
  }, [userId, activeConversationId, loadConversations]);

  return {
    conversations,
    activeConversationId,
    isLoading,
    createNewChat,
    loadChat,
    renameChat,
    deleteChat,
    saveActiveChat
  };
}
