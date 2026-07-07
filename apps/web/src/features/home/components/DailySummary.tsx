"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Flame, Footprints, Moon } from "lucide-react";

export function DailySummary() {
  return (
    <div className="grid grid-cols-3 gap-3">
      <motion.div whileTap={{ scale: 0.95 }} className="bg-white rounded-2xl p-4 shadow-float flex flex-col items-center justify-center text-center">
        <Footprints className="w-5 h-5 text-sky-500 mb-2" />
        <span className="text-lg font-black text-slate-900 tracking-tight">8.2k</span>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Steps</span>
      </motion.div>
      
      <motion.div whileTap={{ scale: 0.95 }} className="bg-white rounded-2xl p-4 shadow-float flex flex-col items-center justify-center text-center">
        <Flame className="w-5 h-5 text-orange-500 mb-2" />
        <span className="text-lg font-black text-slate-900 tracking-tight">420</span>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kcal</span>
      </motion.div>
      
      <motion.div whileTap={{ scale: 0.95 }} className="bg-white rounded-2xl p-4 shadow-float flex flex-col items-center justify-center text-center">
        <Moon className="w-5 h-5 text-indigo-500 mb-2" />
        <span className="text-lg font-black text-slate-900 tracking-tight">7h 12m</span>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sleep</span>
      </motion.div>
    </div>
  );
}
