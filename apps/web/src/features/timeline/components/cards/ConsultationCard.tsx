/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { TimelineEvent } from "@healthtribe/schemas";
import { BaseTimelineCard } from "./BaseTimelineCard";
import { Stethoscope } from "lucide-react";

export function ConsultationCard({ event }: { event: TimelineEvent }) {
  const evType = event.type as string;
  if (evType !== "CONSULTATION" && evType !== "consultation") return null;
  const data = (event.structured_payload as any) || {};

  return (
    <BaseTimelineCard 
      event={event} 
      icon={<Stethoscope className="w-5 h-5" />} 
      title={data.title || "Consultation"}
      colorClass="bg-[#F3E8FF] text-[#6B21A8] border-purple-200"
      doctorName={data.doctor_name || event.metadata?.doctor_name as string}
      hospitalName={data.hospital_name || event.metadata?.hospital_name as string}
    >
      {data.notes && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
            <p className="whitespace-pre-line">{data.notes}</p>
          </div>
        </div>
      )}
    </BaseTimelineCard>
  );
}
