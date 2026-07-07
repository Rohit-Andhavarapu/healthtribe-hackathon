"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

export function HealthInsights() {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Health Insights</h3>
      </div>
      
      <div className="bg-slate-900 rounded-3xl p-5 shadow-card relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
        
        <div className="relative z-10 flex gap-4">
          <div className="bg-white/10 p-2.5 rounded-2xl h-fit shrink-0 backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h4 className="font-bold text-white text-[16px] mb-1 tracking-tight">Weekly Summary</h4>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              Your average resting heart rate has improved by 5% this week. Keep up the consistent morning walks!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
