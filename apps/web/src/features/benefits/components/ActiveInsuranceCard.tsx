"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Shield, Eye, Activity } from "lucide-react";

export function ActiveInsuranceCard() {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      className="relative bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[32px] p-6 shadow-card overflow-hidden cursor-pointer mb-8"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-900/30 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="bg-emerald-900/40 text-emerald-100 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
            Active
          </span>
        </div>
        
        <h2 className="text-white text-2xl font-black tracking-tight mb-1">Star Health Premium</h2>
        <p className="text-emerald-100 font-medium text-[15px] mb-8">Family Floater Plan • ID: SHP-2983-00</p>
        
        <div className="bg-emerald-900/20 rounded-2xl p-4 mb-6 backdrop-blur-sm border border-emerald-400/20">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-emerald-100/80 text-xs font-bold uppercase tracking-widest mb-1">Coverage Limit</p>
              <p className="text-white text-2xl font-black tracking-tight">₹5,00,000</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-100/80 text-xs font-bold uppercase tracking-widest mb-1">Utilized</p>
              <p className="text-white font-bold text-[15px]">₹45,200</p>
            </div>
          </div>
          
          <div className="w-full bg-emerald-950/50 rounded-full h-2 mt-4 overflow-hidden">
            <div className="bg-emerald-300 h-full rounded-full" style={{ width: "9%" }}></div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="flex-1 bg-white text-emerald-700 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors shadow-sm">
            <Eye className="w-4 h-4" />
            View E-Card
          </button>
          <button className="flex-1 bg-emerald-600/50 text-white border border-emerald-400/30 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors">
            <Activity className="w-4 h-4" />
            Claims
          </button>
        </div>
      </div>
    </motion.div>
  );
}
