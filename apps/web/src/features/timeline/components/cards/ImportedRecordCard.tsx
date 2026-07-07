import React from 'react';
import { Card, CardContent } from "@healthtribe/ui";
import { ExternalLink, Stethoscope, FileText, Activity } from "lucide-react";
import { TimelineEvent } from "../../types/timeline";

export function ImportedRecordCard({ event }: { event: TimelineEvent }) {
  const payload = (event.structured_payload?.original_payload || {}) as Record<string, unknown>;
  const recordType = event.type?.replace('imported_', '') || 'record';
  
  const getIcon = () => {
    if (recordType === 'prescription') return <FileText className="w-5 h-5 text-indigo-600" />;
    if (recordType === 'consultation') return <Stethoscope className="w-5 h-5 text-indigo-600" />;
    return <Activity className="w-5 h-5 text-indigo-600" />;
  };
  
  return (
    <div className="relative pl-8 before:absolute before:left-[-15px] before:top-6 before:w-6 before:h-px before:bg-slate-200">
      <div className="absolute left-[-23px] top-4 w-4 h-4 rounded-full border-2 border-indigo-500 bg-white z-10"></div>
      
      <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-indigo-50/20">
        <div className="absolute top-0 right-0 p-3 opacity-5">
          <ExternalLink className="w-24 h-24 text-indigo-600" />
        </div>
        
        <CardContent className="p-5 relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {getIcon()}
              <h4 className="font-semibold text-slate-900 capitalize">{recordType} (External)</h4>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                ABHA Import
              </span>
            </div>
            <span className="text-sm font-medium text-slate-500">
              {new Date(event.occurred_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-slate-500">Source:</span>
              <span className="font-semibold text-slate-900">{event.source || 'External'}</span>
            </div>
            <div className="whitespace-pre-wrap">
              {(payload as Record<string, unknown>).mock_data as string || JSON.stringify(payload, null, 2)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
