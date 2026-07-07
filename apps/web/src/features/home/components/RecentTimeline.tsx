"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Pill, TestTube, FileText } from "lucide-react";

import { useTimeline } from "@/features/timeline/hooks/useTimeline";

export function RecentTimeline() {
  const { data: events = [], isLoading } = useTimeline({ searchQuery: "", selectedType: null, selectedStatus: null });
  const recentEvents = events.slice(0, 3);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Recent Timeline</h3>
        <Link href="/timeline" className="text-xs font-bold text-primary hover:underline">View All</Link>
      </div>
      
      <div className="bg-white rounded-3xl p-2 shadow-card border border-slate-100">
        {isLoading ? (
          <div className="text-center py-4 text-slate-500">Loading timeline...</div>
        ) : !events || events.length === 0 ? (
          <div className="text-center py-4 text-slate-500">No recent events.</div>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          events.slice(0, 3).map((event: any, index: number) => {
            const Icon = event.type === 'LAB_RESULT' ? TestTube : event.type === 'PRESCRIPTION' ? Pill : FileText;
            const colorClass = event.type === 'LAB_RESULT' ? 'bg-emerald-50 text-emerald-600' : 
                               event.type === 'PRESCRIPTION' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600';
                               
            return (
              <React.Fragment key={event.id}>
                <motion.div whileTap={{ scale: 0.98 }} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-[15px] truncate">{event.title}</h4>
                    <p className="text-[13px] text-slate-500 font-medium">
                      {new Date(event.occurred_at || event.date).toLocaleDateString()} • {event.status || 'Pending'}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </motion.div>
                {index < recentEvents.length - 1 && <div className="h-px bg-slate-100 mx-4" />}
              </React.Fragment>
            );
          })
        )}
      </div>
    </section>
  );
}
