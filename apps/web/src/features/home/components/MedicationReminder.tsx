"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Pill, Check } from "lucide-react";
import { useTimeline } from "@/features/timeline/hooks/useTimeline";
import type { TimelineEvent } from "@/features/timeline/types/timeline";

export function MedicationReminder() {
  const [taken, setTaken] = React.useState(false);
  const { data: timeline = [], isLoading } = useTimeline({ searchQuery: "", selectedType: "PRESCRIPTION", selectedStatus: null });

  const prescription = timeline.find((t: TimelineEvent) => t.type === 'imported_prescription' || t.type === 'PRESCRIPTION');
  const payload = prescription?.structured_payload as { medications?: string[]; drug?: string } | undefined;
  const medication = payload?.drug || payload?.medications?.[0] || null;

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Medications</h3>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow-card text-center text-slate-500 border border-slate-100">
          Loading...
        </div>
      </section>
    );
  }

  if (!medication) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Medications</h3>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow-card text-center text-slate-500 border border-slate-100">
          No current medications
        </div>
      </section>
    );
  }

  // Parse medication string like "Metformin 500mg (2x daily)"
  const parts = typeof medication === 'string' ? medication.split(' (') : [medication];
  const medName = parts[0];
  const medDesc = parts.length > 1 ? parts[1].replace(')', '') : "As prescribed";

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Medications</h3>
      </div>
      
      <motion.div 
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-3xl p-4 shadow-card flex items-center justify-between cursor-pointer border border-slate-100"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
            <Pill className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-[17px] mb-0.5">{medName}</h4>
            <p className="text-sm font-medium text-slate-500">{medDesc}</p>
          </div>
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            setTaken(!taken);
          }}
          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors ${
            taken 
              ? "bg-emerald-500 border-emerald-500 text-white" 
              : "border-slate-200 text-slate-300 hover:border-emerald-500 hover:text-emerald-500"
          }`}
        >
          <Check className="w-6 h-6" strokeWidth={taken ? 2.5 : 2} />
        </motion.button>
      </motion.div>
    </section>
  );
}
