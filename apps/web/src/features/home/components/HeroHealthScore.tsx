"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export function HeroHealthScore() {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col items-center text-center relative overflow-hidden"
    >
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
      
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Health Score</p>
      
      <div className="flex items-end justify-center gap-1 mb-2">
        <h2 className="text-6xl font-black text-slate-900 tracking-tighter">92</h2>
        <span className="text-xl font-bold text-emerald-500 mb-2">/100</span>
      </div>
      
      <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-sm font-bold mb-4">
        <TrendingUp className="w-4 h-4" />
        <span>+3 this week</span>
      </div>
      
      <p className="text-slate-900 font-bold text-lg mb-1">Excellent</p>
      <p className="text-slate-500 text-sm font-medium">Keep maintaining your routine.</p>
    </motion.div>
  );
}
