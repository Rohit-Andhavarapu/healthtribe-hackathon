"use client";

import * as React from "react";
import { useTimeline } from "../hooks/useTimeline";
import { useTimelineFilters } from "../hooks/useTimelineFilters";
import { TimelineSummary } from "./TimelineSummary";
import { PrescriptionCard } from "./cards/PrescriptionCard";
import { LabReportCard } from "./cards/LabReportCard";
import { ConsultationCard } from "./cards/ConsultationCard";
import { groupTimelineByMonth } from "../utils/groupTimeline";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/shared/states";
import { EmptyState } from "@/components/shared/states";
import { Clock } from "lucide-react";
import { ImportRecordsAction } from "./ImportRecordsAction";
import { AISummaryCard } from "./cards/AISummaryCard";
import { ImportedRecordCard } from "./cards/ImportedRecordCard";

export function TimelineContainer({ patientId }: { patientId?: string } = {}) {
  const filters = useTimelineFilters();
  const { data: events, isLoading, error } = useTimeline({ ...filters, patientId });

  if (isLoading) {
    return (
      <div className="max-w-5xl w-full mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="flex gap-4">
          <Skeleton className="h-12 flex-1 rounded-2xl" />
          <Skeleton className="h-12 w-32 rounded-2xl" />
        </div>
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-3xl" />
      </div>
    );
  }

  if (error) return <div className="p-8 text-center text-red-500 font-medium">Failed to load timeline.</div>;
  if (!events) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const grouped = groupTimelineByMonth(events as any[]);

  return (
    <div className="max-w-5xl w-full mx-auto py-6 px-4">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <TimelineSummary events={events as any[]} />

      {/* Sticky Controls */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl pb-4 pt-4 mb-8 flex gap-3 -mx-4 px-4">
        <div className="relative flex-1 shadow-sm rounded-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={2.5} />
          <input 
            type="text" 
            aria-label="Search timeline events"
            placeholder="Search medical history..." 
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200/60 rounded-2xl text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:text-slate-400"
            value={filters.searchQuery}
            onChange={(e) => filters.setSearchQuery(e.target.value)}
          />
        </div>
        <div className="shadow-sm rounded-2xl bg-white border border-slate-200/60 relative">
          <select 
            aria-label="Filter timeline events by type"
            className="appearance-none bg-transparent w-full h-full pl-4 pr-10 py-3.5 text-[15px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-2xl cursor-pointer"
            value={filters.selectedType || ""}
            onChange={(e) => filters.setSelectedType(e.target.value || null)}
          >
            <option value="">All Types</option>
            <option value="CONSULTATION">Consultations</option>
            <option value="PRESCRIPTION">Prescriptions</option>
            <option value="LAB_RESULT">Lab Reports</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
        <div className="relative">
          <ImportRecordsAction />
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState 
          title="No records found"
          description={filters.searchQuery || filters.selectedType ? "Try adjusting your search filters." : "Your medical timeline is currently empty."}
          icon={Clock}
        />
      ) : (
        <div className="space-y-8 pl-4 relative before:absolute before:inset-y-0 before:left-[39px] before:w-px before:bg-slate-200/60 before:z-0">
          {grouped.map(([month, monthEvents]) => (
            <div key={month} className="relative z-10">
              <div className="sticky top-[88px] z-20 flex items-center gap-4 mb-8 -ml-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200/60 shadow-sm shrink-0">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                </div>
                <h3 className="text-[13px] font-black text-slate-700 uppercase tracking-widest bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-slate-100">{month}</h3>
              </div>
              
              <div className="space-y-6 ml-8">
                {monthEvents.map(event => {
                  if (!event || !event.id || !event.type) return null;
                  const evType = event.type as string;
                  if (evType === "prescription" || evType === "PRESCRIPTION") return <PrescriptionCard key={event.id} event={event} />;
                  if (evType === "lab" || evType === "LAB_RESULT") return <LabReportCard key={event.id} event={event} />;
                  if (evType === "consultation" || evType === "CONSULTATION") return <ConsultationCard key={event.id} event={event} />;
                  if (evType === "ai_summary" || evType === "AI_SUMMARY") return <AISummaryCard key={event.id} event={event} />;
                  if (evType.startsWith("imported_")) return <ImportedRecordCard key={event.id} event={event} />;
                  // Fallback
                  return null;
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
