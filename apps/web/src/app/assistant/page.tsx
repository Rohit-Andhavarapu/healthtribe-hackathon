"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Send, User, Bot, Sparkles, Loader2, AlertCircle, RefreshCw, Copy, Check, MessageSquare, Plus, Trash2, Edit2, Check as CheckIcon, X, Database } from 'lucide-react';
import { useAIChat } from '@/features/ai/useAIChat';
import { useChatHistory } from '@/features/ai/useChatHistory';
import { ActionCardRenderer } from '@/features/ai/components/ActionCardRegistry';
import { ContextPanel } from '@/features/ai/components/ContextPanel';
import { useUserRole } from '@/features/auth/hooks/useUserRole';

const PATIENT_SUGGESTED_QUESTIONS = [
  "Summarize my medical history",
  "Explain my latest lab report",
  "What medications am I taking?",
  "When is my next appointment?",
  "Find a cardiologist",
  "Book an appointment for tomorrow"
];

const PATIENT_QUICK_ACTIONS = [
  { label: "Book Appointment", prompt: "Book an appointment with a doctor" },
  { label: "Find Doctor", prompt: "Find available doctors in my area" },
  { label: "My Medications", prompt: "What medications am I currently taking?" },
  { label: "Lab Reports", prompt: "Show my recent lab reports" }
];

// Doctor constants removed

export default function AIAssistantPage() {
  const { data: user } = useUserRole();
  const suggestedQuestions = PATIENT_SUGGESTED_QUESTIONS;
  const quickActions = PATIENT_QUICK_ACTIONS;
  const assistantDescription = "Your intelligent medical companion. Ask me anything about your health records, medications, or book your next appointment.";

  const { 
    conversations, 
    activeConversationId, 
    isLoading: isHistoryLoading, 
    createNewChat, 
    loadChat, 
    renameChat, 
    deleteChat,
    saveActiveChat
  } = useChatHistory();

  const handleTitleGenerated = useCallback((title: string) => {
    if (activeConversationId) {
      renameChat(activeConversationId, title);
    }
  }, [activeConversationId, renameChat]);

  const { messages, setMessages, isLoading, append, reload, chatTitle, setChatTitle } = useAIChat({
    onTitleGenerated: handleTitleGenerated,
    clientRole: 'PATIENT',
    conversationId: activeConversationId
  });
  
  const [inputValue, setInputValue] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load active conversation messages when activeConversationId changes
  useEffect(() => {
    if (activeConversationId) {
      const activeConv = conversations.find(c => c.id === activeConversationId);
      if (activeConv) {
        setMessages(activeConv.messages);
        setChatTitle(activeConv.title);
      }
    } else {
      setMessages([]);
      setChatTitle(null);
    }
  }, [activeConversationId, conversations, setMessages, setChatTitle]);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save conversation automatically when messages change, but debounced to prevent freezing
  useEffect(() => {
    if (messages.length > 0) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveActiveChat(messages, chatTitle || undefined);
      }, 500);
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, saveActiveChat, chatTitle]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrolledUpRef = useRef(false);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    isScrolledUpRef.current = scrollHeight - scrollTop - clientHeight > 50;
  };

  const scrollToBottom = () => {
    if (!isScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = (text: string) => {
    if (!text.trim() || isLoading) return;
    isScrolledUpRef.current = false;
    append(text);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const submitRename = async (id: string) => {
    if (editTitle.trim()) {
      await renameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex h-full w-full max-w-full">
      {/* LEFT PANE: History */}
      <div className="hidden md:flex flex-col w-[22%] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 h-full overflow-y-auto shrink-0">
        <div className="p-4 sticky top-0 bg-white dark:bg-slate-900/50 backdrop-blur-sm z-10 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={createNewChat}
            className="flex items-center gap-2 w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors justify-center shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>
        
        <div className="flex-1 p-3 space-y-1">
          {isHistoryLoading ? (
            <div className="p-4 text-center text-sm text-slate-500">Loading history...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No previous chats</div>
          ) : (
            conversations.map(conv => (
              <div 
                key={conv.id}
                className={`group flex flex-col p-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeConversationId === conv.id 
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
                onClick={() => { if (editingId !== conv.id) loadChat(conv.id); }}
              >
                {editingId === conv.id ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submitRename(conv.id)}
                      autoFocus
                      className="flex-1 bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-700 rounded px-2 py-1 text-sm outline-none"
                    />
                    <button onClick={(e) => { e.stopPropagation(); submitRename(conv.id); }} className="text-green-600 hover:text-green-700"><CheckIcon className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${activeConversationId === conv.id ? 'text-purple-600' : 'text-slate-400'}`} />
                      <span className="text-sm font-medium truncate">{conv.title}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); startRename(conv.id, conv.title); }}
                        className="p-1 text-slate-400 hover:text-purple-600 rounded transition-colors"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteChat(conv.id); }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                <span className="text-[10px] text-slate-400 ml-6 mt-1">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CENTER PANE: Chat */}
      <div className="flex-1 lg:w-[56%] shrink-0 flex flex-col h-full bg-slate-50 dark:bg-slate-900 relative">
        <div 
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 scroll-smooth"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-2">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                  HealthTribe AI
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  {assistantDescription}
                </p>
              </div>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(action.prompt)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-full border border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-700 dark:hover:text-purple-300 transition-all shadow-sm"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-8">
                {suggestedQuestions.map((q, i) => (
                  <div 
                    key={i}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 cursor-pointer hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all text-left text-sm text-slate-700 dark:text-slate-300"
                    onClick={() => handleSend(q)}
                  >
                    <p className="font-medium">&quot;{q}&quot;</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 pb-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div 
                    className={`flex flex-col max-w-[85%] ${
                      msg.role === 'user' 
                        ? 'items-end' 
                        : 'items-start'
                    }`}
                  >
                    <div 
                      className={`px-5 py-3.5 rounded-2xl break-words whitespace-pre-wrap ${
                        msg.role === 'user' 
                          ? 'bg-purple-600 text-white rounded-tr-sm shadow-sm' 
                          : msg.isError 
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-100 dark:border-red-800 rounded-tl-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {msg.isError ? (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2 font-medium">
                            <AlertCircle className="w-5 h-5" />
                            {msg.content}
                          </div>
                          <button 
                            onClick={reload}
                            className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
                          >
                            <RefreshCw className="w-4 h-4" /> Try again
                          </button>
                        </div>
                      ) : (
                        <>
                          {msg.content ? (
                            <div className={`prose prose-sm md:prose-base dark:prose-invert max-w-none ${msg.role === 'user' ? 'text-white' : ''}`}>
                              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{msg.content}</ReactMarkdown>
                            </div>
                          ) : isLoading && msg.role === 'model' && !msg.actions?.length ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center h-6 gap-2">
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                <span className="text-sm text-slate-500 font-medium ml-1 animate-pulse">Checking records...</span>
                              </div>
                            </div>
                          ) : null}
                          {msg.actions && msg.actions.length > 0 && (
                            <div className="mt-4 space-y-3">
                              {msg.actions.map((action, idx) => (
                                <ActionCardRenderer key={idx} action={action} />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    {msg.role === 'model' && !msg.isError && (
                      <div className="flex flex-wrap gap-4 mt-2 pl-2 w-full justify-between items-center">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1 font-medium"
                            title="Copy Response"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedId === msg.id ? 'Copied' : 'Copy'}
                          </button>
                          {!isLoading && messages[messages.length - 1]?.id === msg.id && (
                            <button 
                              onClick={reload}
                              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center gap-1 ml-3 font-medium"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Retry
                            </button>
                          )}
                        </div>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
                            <span className="font-medium">Sources:</span>
                            {msg.sources.map((src, i) => (
                              <span key={i} className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-md font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1 hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer transition-colors">
                                <Database className="w-3 h-3" />
                                {src}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
    
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-auto px-4 md:px-8 pb-4 pt-2 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-slate-900 dark:via-slate-900">
          <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent transition-all">
            <textarea
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your health..."
              className="flex-1 w-full min-h-[44px] max-h-32 resize-none outline-none border-0 focus-visible:ring-0 bg-transparent py-3 px-2 text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 disabled:opacity-50"
              disabled={isLoading}
              rows={1}
            />
            <button 
              type="button"
              className="flex items-center justify-center h-[44px] w-[44px] rounded-xl bg-purple-600 hover:bg-purple-700 text-white shrink-0 mb-0.5 mr-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              disabled={!inputValue.trim() || isLoading}
              onClick={() => handleSend(inputValue)}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <div className="text-center mt-3 text-xs text-slate-400 dark:text-slate-500 font-medium">
            HealthTribe AI can make mistakes. Always verify important medical information.
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Context Panel */}
      <ContextPanel messages={messages} />
    </div>
  );
}
