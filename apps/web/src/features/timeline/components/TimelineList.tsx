import * as React from "react";
import { PrescriptionCard } from "./cards/PrescriptionCard";
import { LabReportCard } from "./cards/LabReportCard";
import { ConsultationCard } from "./cards/ConsultationCard";
import { groupTimelineByMonth } from "../utils/groupTimeline";
import { EmptyState } from "@/components/shared/states";
import { Clock } from "lucide-react";
import type { TimelineEvent } from "../types/timeline";

interface TimelineListProps {
  events: TimelineEvent[];
}

export function TimelineList({ events }: TimelineListProps) {
  if (!Array.isArray(events) || events.length === 0) {
    return (
      <EmptyState 
        title="No records found"
        description="Your medical timeline is currently empty."
        icon={Clock}
      />
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const grouped = groupTimelineByMonth(events as any[]);

  return (
    <div className="space-y-8 pl-4 relative before:absolute before:inset-y-0 before:left-[39px] before:w-px before:bg-slate-200/60 before:z-0">
      {grouped.map(([month, monthEvents]) => (
        <div key={month} className="relative z-10">
          <div className="sticky top-0 z-20 flex items-center gap-4 mb-8 -ml-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200/60 shadow-sm shrink-0">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
            </div>
            <h3 className="text-[13px] font-black text-slate-700 uppercase tracking-widest bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-slate-100">{month}</h3>
          </div>
          
          <div className="space-y-6 ml-8">
            {monthEvents.map(event => {
              const evType = event.type as string;
              if (evType === "prescription" || evType === "PRESCRIPTION") return <PrescriptionCard key={event.id} event={event} />;
              if (evType === "lab" || evType === "LAB_RESULT") return <LabReportCard key={event.id} event={event} />;
              if (evType === "consultation" || evType === "CONSULTATION") return <ConsultationCard key={event.id} event={event} />;
              return null;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
