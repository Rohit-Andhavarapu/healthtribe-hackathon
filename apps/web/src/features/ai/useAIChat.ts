import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';

export type AIAction = {
  type: string;
  payload: Record<string, unknown>;
};

export type AIMessage = {
  id: string;
  role: 'user' | 'model';
  content: string;
  sources?: string[];
  actions?: AIAction[];
  isError?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useAIChat = (options?: { onTitleGenerated?: (title: string) => void, conversationId?: string | null, contextPayload?: Record<string, any>, clientRole?: 'PATIENT' | 'DOCTOR' }) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string | null>(null);
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const append = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: AIMessage = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    const assistantId = crypto.randomUUID();
    const currentAssistantMsg: AIMessage = { id: assistantId, role: 'model', content: '', sources: [], actions: [] };
    
    setMessages(prev => [...prev, currentAssistantMsg]);

    try {
      let token: string | null = null;
      try {
        token = await getToken();
      } catch (e) {
        console.error("Clerk getToken() failed", e);
      }

      const requestMessages = messages.concat(userMsg).map(m => ({
        role: m.role,
        content: m.content
      }));

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/api/v1/ai/chat/stream`, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          messages: requestMessages,
          conversation_id: options?.conversationId || null,
          context_payload: options?.contextPayload || null,
          client_role: options?.clientRole || 'PATIENT'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      
      const processChunk = (chunkStr: string) => {
        if (!chunkStr.trim()) return;
        try {
          const parsed = JSON.parse(chunkStr);
          if (parsed.type === "text" && parsed.content) {
            currentAssistantMsg.content += parsed.content;
          } else if (parsed.type === "provider" && parsed.content) {
            // Store provider info in the message content as debug HTML or in a custom field
            // To make it visible to QA without breaking markdown parsing, let's append it to sources
            const providerInfo = `Powered by ${parsed.content}`;
            if (!currentAssistantMsg.sources?.includes(providerInfo)) {
                currentAssistantMsg.sources = [...(currentAssistantMsg.sources || []), providerInfo];
            }
          } else if (parsed.type === "sources" && parsed.sources) {
            currentAssistantMsg.sources = [...(currentAssistantMsg.sources || []).filter(s => s.startsWith("Powered by ")), ...parsed.sources];
          } else if (parsed.type === "action" && parsed.action_type) {
            const newAction = { type: parsed.action_type, payload: parsed.action_payload };
            currentAssistantMsg.actions = [...(currentAssistantMsg.actions || []), newAction];
            
            // Invalidate React Query caches if backend signals it (Issue 5 Separation of Concerns)
            if (parsed.action_payload?.result?._action === "invalidate_cache" && parsed.action_payload?.result?._keys) {
              const keysToInvalidate = parsed.action_payload.result._keys as string[];
              keysToInvalidate.forEach(key => {
                queryClient.invalidateQueries({ queryKey: [key] });
              });
            }
          } else if (parsed.type === "title" && parsed.title) {
            setChatTitle(parsed.title);
            options?.onTitleGenerated?.(parsed.title);
          } else if (parsed.type === "error") {
            throw new Error(parsed.content || "AI Error");
          } else if (parsed.type === "done") {
            setIsLoading(false);
          }
          
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...currentAssistantMsg } : m));
        } catch (e) {
          console.error("Error parsing SSE chunk:", chunkStr, e);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() || "";
          
          for (const chunk of chunks) {
            processChunk(chunk);
          }
        }
        
        if (done) {
          // Flush any remaining buffer
          if (buffer.trim()) {
            processChunk(buffer);
          }
          break;
        }
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch response";
      setError(errorMsg);
      setMessages(prev => prev.map(m => 
        m.id === assistantId ? { ...m, isError: true, content: errorMsg } : m
      ));
    } finally {
      setIsLoading(false);
    }
  }, [messages, getToken, options, queryClient]);

  const reload = useCallback(() => {
    const lastUserMsg = messages.slice().reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
       const idx = messages.indexOf(lastUserMsg);
       setMessages(messages.slice(0, idx));
       append(lastUserMsg.content);
    }
  }, [messages, append]);

  // Expose setMessages to allow loading history
  return { messages, setMessages, isLoading, error, append, reload, chatTitle, setChatTitle };
};
