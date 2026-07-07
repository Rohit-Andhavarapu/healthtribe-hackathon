"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Send, User, Bot, Sparkles, Loader2, AlertCircle, RefreshCw, Copy, Check, MessageSquare, Plus, Trash2, Edit2, Check as CheckIcon, X } from 'lucide-react';
import { useAIChat } from '@/features/ai/useAIChat';
import { useChatHistory } from '@/features/ai/useChatHistory';
import { ActionCardRenderer } from '@/features/ai/components/ActionCardRegistry';
import { DoctorContextPanel } from '@/features/ai/components/DoctorContextPanel';
import { useSearchParams } from 'next/navigation';

const DOCTOR_SUGGESTED_QUESTIONS = [
  "Summarize my appointments for today",
  "Show me my next patient's medical history",
  "Any critical lab results for my patients?",
  "What is my consultation stats?",
  "Search for a patient",
  "Reschedule an appointment"
];

const DOCTOR_QUICK_ACTIONS = [
  { label: "Today's Queue", prompt: "Show my appointments for today" },
  { label: "Search Patient", prompt: "Search for a patient by name" },
  { label: "My Profile", prompt: "Show my doctor profile" },
  { label: "Recent Labs", prompt: "Show recent lab reports of my patients" }
];

function DoctorAssistantContent() {
  const searchParams = useSearchParams();
  const appointment_id = searchParams.get('appointmentId');
  const patient_id = searchParams.get('patientId');
  
  const contextPayload = appointment_id && patient_id 
    ? { appointment_id, patient_id } 
    : undefined;

  const suggestedQuestions = DOCTOR_SUGGESTED_QUESTIONS;
  
  const quickActions = [...DOCTOR_QUICK_ACTIONS];
  if (contextPayload?.appointment_id) {
    quickActions.unshift({ 
      label: "📝 Draft SOAP Note", 
      prompt: "Draft a complete, professional SOAP note based on this patient's history and active consultation." 
    });
  }
  const assistantDescription = "Your intelligent clinical assistant. Ask me about your patient queue, medical histories, or scheduling.";

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

  const activeConv = conversations.find(c => c.id === activeConversationId);
  const activePayload = activeConv?.contextPayload || contextPayload;

  const { messages, setMessages, isLoading, append, reload, chatTitle, setChatTitle } = useAIChat({
    onTitleGenerated: handleTitleGenerated,
    contextPayload: activePayload,
    clientRole: 'DOCTOR',
    conversationId: activeConversationId
  });
  
  const [inputValue, setInputValue] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (messages.length > 0) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        // Here we can inject context payload to save with the chat
        saveActiveChat(messages, chatTitle || undefined, activePayload);
      }, 500);
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, saveActiveChat, chatTitle, contextPayload, activeConversationId, conversations]);

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
      <div className="hidden md:flex flex-col w-[22%] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 h-full overflow-y-auto shrink-0">
        <div className="p-4 sticky top-0 bg-white dark:bg-slate-900/50 backdrop-blur-sm z-10 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={createNewChat}
            className="flex items-center gap-2 w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors justify-center shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Doctor Chat
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
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100' 
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
                      className="flex-1 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded px-2 py-1 text-sm outline-none"
                    />
                    <button onClick={(e) => { e.stopPropagation(); submitRename(conv.id); }} className="text-green-600 hover:text-green-700"><CheckIcon className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${activeConversationId === conv.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="text-sm font-medium truncate">{conv.title}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); startRename(conv.id, conv.title); }}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
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
                <span className="text-[10px] text-slate-400 ml-6 mt-1 flex items-center gap-2">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                  {conv.contextPayload?.appointment_id && (
                    <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-semibold">Pinned Context</span>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 lg:w-[56%] shrink-0 flex flex-col h-full bg-slate-50 dark:bg-slate-900 relative">
        <div 
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 scroll-smooth"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-2">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                  HealthTribe MD Copilot
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                  {assistantDescription}
                </p>
                {activePayload?.appointment_id && (
                   <p className="text-indigo-600 dark:text-indigo-400 font-medium mt-2 bg-indigo-50 dark:bg-indigo-900/30 py-1.5 px-3 rounded-full inline-block text-sm">
                     Active Consultation Context Pinned
                   </p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(action.prompt)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all shadow-sm"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-8">
                {suggestedQuestions.map((q, i) => (
                  <div 
                    key={i}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all text-left text-sm text-slate-700 dark:text-slate-300"
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
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
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
                          ? 'bg-indigo-600 text-white rounded-tr-sm shadow-sm' 
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
                            <div className="flex items-center h-6 gap-1">
                              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          ) : null}
                          
                          {/* msg.actions hidden from UI as per requirements */}
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
                          <div className="text-xs text-slate-400 flex items-center gap-1.5">
                            <span className="font-medium">Sources:</span>
                            {msg.sources.map((src, i) => (
                              <span key={i} className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-md font-medium text-slate-600 dark:text-slate-300">
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
          <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
            <textarea
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="flex-1 w-full min-h-[44px] max-h-32 resize-none outline-none border-0 focus-visible:ring-0 bg-transparent py-3 px-2 text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 disabled:opacity-50"
              disabled={isLoading}
              rows={1}
            />
            <button 
              type="button"
              className="flex items-center justify-center h-[44px] w-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 mb-0.5 mr-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              disabled={!inputValue.trim() || isLoading}
              onClick={() => handleSend(inputValue)}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <div className="text-center mt-3 text-xs text-slate-400 dark:text-slate-500 font-medium">
            HealthTribe MD Copilot.
          </div>
        </div>
      </div>

      <DoctorContextPanel messages={messages} contextPayload={activePayload} onAction={handleSend} />
    </div>
  );
}

export default function DoctorAssistantPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading AI Assistant...</div>}>
      <DoctorAssistantContent />
    </Suspense>
  );
}
