"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, Mic, FileText, ChevronRight } from "lucide-react";

export function AiHeroCard() {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      className="relative bg-white rounded-[32px] p-6 shadow-card border border-slate-100 overflow-hidden cursor-pointer"
    >
      {/* Soft gradient glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-100/50 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-primary/10 p-1.5 rounded-xl">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[13px] font-black tracking-widest uppercase text-primary">HealthTribe AI</span>
        </div>
        
        <h2 className="text-[26px] font-black text-slate-900 tracking-tight leading-tight mb-2">
          How are you feeling today?
        </h2>
        
        <p className="text-slate-500 font-medium text-[15px] mb-6 max-w-[280px]">
          Describe your symptoms, ask a question, or upload a medical report for instant analysis.
        </p>
        
        <div className="flex flex-col gap-3">
          <button className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl font-bold shadow-float hover:bg-slate-800 transition-colors">
            <span className="flex items-center gap-3 text-[15px]">
              <Sparkles className="w-5 h-5" />
              Start Assessment
            </span>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
          
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors">
              <Mic className="w-4 h-4" />
              Voice
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors">
              <FileText className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
