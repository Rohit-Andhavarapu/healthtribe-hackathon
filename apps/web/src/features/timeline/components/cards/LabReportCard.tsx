/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { TimelineEvent } from "@healthtribe/schemas";
import { BaseTimelineCard } from "./BaseTimelineCard";
import { FlaskConical } from "lucide-react";

export function LabReportCard({ event }: { event: TimelineEvent }) {
  const evType = event.type as string;
  if (evType !== "LAB_RESULT" && evType !== "lab") return null;
  const data = (event.structured_payload as any) || {};

  return (
    <BaseTimelineCard 
      event={event} 
      icon={<FlaskConical className="w-5 h-5" />} 
      title={data.title || "Lab Report"}
      colorClass="bg-[#D1FAE5] text-[#065F46] border-emerald-200"
      hospitalName={data.lab_name || event.metadata?.hospital_name as string || "City Labs"}
    >
      {data.lab_name && <p className="text-sm font-medium text-slate-700 mb-3">{data.lab_name}</p>}
      <div className="space-y-2">
        {data.result && (
          <div className="flex justify-between items-center p-3 rounded-lg border bg-slate-50 border-slate-100">
            <p className="font-medium text-slate-900">{typeof data.title === 'string' ? data.title.replace(' Test', '') : 'Result'}</p>
            <div className="text-right">
              <p className="font-bold text-slate-900">
                {data.result}
              </p>
              {data.normal_range && (
                <p className="text-xs text-slate-400">Ref: {data.normal_range}</p>
              )}
            </div>
          </div>
        )}
        {data.tests?.map((test: any, idx: number) => (
          <div key={idx} className={`flex justify-between items-center p-3 rounded-lg border ${test.is_abnormal ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
            <p className={`font-medium ${test.is_abnormal ? 'text-red-900' : 'text-slate-900'}`}>{test.test_name}</p>
            <div className="text-right">
              <p className={`font-bold ${test.is_abnormal ? 'text-red-700' : 'text-slate-900'}`}>
                {test.value} <span className="text-sm font-normal text-slate-500">{test.unit}</span>
              </p>
              {test.reference_range && (
                <p className="text-xs text-slate-400">Ref: {test.reference_range}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </BaseTimelineCard>
  );
}
