import React from 'react';
import { Card, CardContent } from "@healthtribe/ui";
import { Bot, Sparkles } from "lucide-react";
import { TimelineEvent } from "../../types/timeline";

export function AISummaryCard({ event }: { event: TimelineEvent }) {
  const payload = event.structured_payload || {};
  const summary = (payload.summary as string) || 'AI summary not available';
  const insights = Array.isArray(payload.insights) ? (payload.insights as string[]) : [];
  
  return (
    <div className="relative pl-8 before:absolute before:left-[-15px] before:top-6 before:w-6 before:h-px before:bg-slate-200">
      <div className="absolute left-[-23px] top-4 w-4 h-4 rounded-full border-2 border-purple-500 bg-white z-10"></div>
      
      <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-purple-50/30">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Bot className="w-24 h-24 text-purple-600" />
        </div>
        
        <CardContent className="p-5 relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-slate-900">AI Health Insights Generated</h4>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 hover:bg-purple-200">
                AI Summary
              </span>
            </div>
            <span className="text-sm font-medium text-slate-500">
              {new Date(event.occurred_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-700 leading-relaxed">
              {summary}
            </p>
            
            {insights.length > 0 && (
              <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm space-y-2">
                <h5 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">Key Insights</h5>
                <ul className="space-y-2">
                  {insights.map((insight: string, idx: number) => (
                    <li key={idx} className="text-sm text-slate-600 flex gap-2">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
