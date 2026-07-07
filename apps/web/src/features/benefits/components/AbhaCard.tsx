"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { FileHeart, ShieldAlert, ChevronRight } from "lucide-react";

export function AbhaCard() {
  return (
    <section className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Government Schemes</h3>
      </div>
      
      <motion.div 
        whileTap={{ scale: 0.98 }}
        className="relative bg-white rounded-3xl p-5 shadow-card border border-slate-100 overflow-hidden cursor-pointer hover:shadow-float transition-all"
      >
        <div className="absolute right-0 top-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-purple-50 text-purple-600 p-3.5 rounded-2xl shrink-0">
            <FileHeart className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-[17px] tracking-tight mb-1">Ayushman Bharat (ABHA)</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">Create and link your digital health ID for seamless care across providers.</p>
            
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Not Linked
              </span>
              <span className="text-primary font-bold text-[14px] flex items-center gap-1">
                Link Now <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
