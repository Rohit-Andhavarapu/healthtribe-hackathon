import React from 'react';
import { Activity, Calendar, Users, FileText, ClipboardList } from 'lucide-react';
import { AIMessage } from '../useAIChat';

interface DoctorContextPanelProps {
  messages: AIMessage[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contextPayload?: Record<string, any>;
  onAction?: (prompt: string) => void;
}

export function DoctorContextPanel({ messages, contextPayload, onAction }: DoctorContextPanelProps) {
  const isConsultation = !!contextPayload?.appointment_id;

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-800 overflow-y-auto hidden lg:flex lg:flex-col lg:w-[22%] shrink-0 p-4 md:p-6">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
        {isConsultation ? "Consultation Context" : "Doctor Context"}
      </h2>
      
      {isConsultation ? (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Active Patient</h3>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Patient ID: {contextPayload.patient_id}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Context automatically injected</p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-rose-600 dark:text-rose-400">
              <ClipboardList className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Appointment</h3>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">ID: {contextPayload.appointment_id}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
              <Calendar className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Today&apos;s Queue</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your appointments are available in my context. Ask me to summarize your day.</p>
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Quick Actions
        </h2>
        <div className="space-y-2">
          {isConsultation ? (
            <>
              <button 
                onClick={() => onAction?.("Draft SOAP Notes for this patient based on their medical history and today's consultation.")}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                Generate SOAP Notes
              </button>
              <button 
                onClick={() => onAction?.("Summarize this patient's medical history.")}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                Summarize History
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => onAction?.("Show my appointments for today.")}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                View Today&apos;s Schedule
              </button>
              <button 
                onClick={() => onAction?.("Are there any urgent lab reports for my patients?")}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                Review Urgent Labs
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
