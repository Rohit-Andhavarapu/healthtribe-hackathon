import * as React from "react";
import { TimelineEvent } from "../types/timeline";
import { Clock, Calendar, AlertCircle, FileText, Activity, Stethoscope } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function TimelineSummary({ events }: { events: TimelineEvent[] }) {
  if (!Array.isArray(events)) {
    console.error('TimelineSummary: events is not an array', events);
    return null;
  }
  
  const pendingCount = events.filter(e => e && (e.status === "needs_review" || e.status === "pending")).length;
  const prescriptionsCount = events.filter(e => e && (e.type === "prescription" || e.type === "PRESCRIPTION" || e.type === "imported_prescription")).length;
  const labsCount = events.filter(e => e && (e.type === "lab" || e.type === "LAB_RESULT" || e.type === "imported_lab" || e.type === "imported_labReport")).length;
  const scansCount = events.filter(e => e && e.type === "scan").length;
  const consultationsCount = events.filter(e => e && (e.type === "consultation" || e.type === "CONSULTATION" || e.type === "imported_consultation")).length;
  
  const lastUpdated = events.length > 0 
    ? (() => {
        try {
          const dates = events
            .map(e => {
              // Try multiple date fields
              const eventAny = e as unknown as Record<string, unknown>;
              const dateStr = eventAny.updated_at || eventAny.created_at || e.occurred_at;
              if (!dateStr) return null;
              const date = new Date(dateStr as string);
              return isNaN(date.getTime()) ? null : date.getTime();
            })
            .filter((d): d is number => d !== null);
          
          if (dates.length === 0) return "Never";
          
          return formatDistanceToNow(new Date(Math.max(...dates)), { addSuffix: true });
        } catch (error) {
          console.error('Error calculating lastUpdated:', error);
          return "Unknown";
        }
      })()
    : "Never";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Medical Timeline</h2>
          <p className="text-slate-500 mt-1 flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4" /> Last updated {lastUpdated}
          </p>
        </div>
        
        {pendingCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">{pendingCount} Action{pendingCount > 1 ? 's' : ''} Needed</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
          <Stethoscope className="w-6 h-6 text-indigo-500 mb-2" />
          <span className="text-2xl font-bold text-slate-900">{consultationsCount}</span>
          <span className="text-sm font-medium text-slate-500">Consultations</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
          <Activity className="w-6 h-6 text-emerald-500 mb-2" />
          <span className="text-2xl font-bold text-slate-900">{prescriptionsCount}</span>
          <span className="text-sm font-medium text-slate-500">Prescriptions</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
          <FileText className="w-6 h-6 text-blue-500 mb-2" />
          <span className="text-2xl font-bold text-slate-900">{labsCount}</span>
          <span className="text-sm font-medium text-slate-500">Lab Reports</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
          <div className="w-6 h-6 flex items-center justify-center font-bold text-rose-500 mb-2">SC</div>
          <span className="text-2xl font-bold text-slate-900">{scansCount}</span>
          <span className="text-sm font-medium text-slate-500">Scans</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center gap-4">
        <div className="bg-white p-2 rounded-full text-blue-600 shadow-sm">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-blue-900">Upcoming Appointment</h4>
          <p className="text-sm text-blue-700 font-medium mt-0.5">Dr. Sarah Jenkins (Cardiology) • July 15, 2026 at 10:00 AM</p>
        </div>
      </div>
    </div>
  );
}
