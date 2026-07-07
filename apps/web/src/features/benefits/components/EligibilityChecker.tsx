"use client";

import * as React from "react";
import { CreditCard, Lock } from "lucide-react";

export function EligibilityChecker() {
  return (
    <div className="flex items-center justify-between p-5 bg-slate-50 border-dashed border-2 border-slate-200 rounded-3xl opacity-80 cursor-not-allowed">
      <div className="flex items-center gap-4">
        <div className="bg-slate-200 text-slate-500 p-3.5 rounded-2xl shrink-0">
          <CreditCard className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-[17px] tracking-tight mb-0.5">Eligibility Checker</h3>
          <p className="text-sm text-slate-500 font-medium">Coming Soon</p>
        </div>
      </div>
      <Lock className="w-5 h-5 text-slate-400 shrink-0" />
    </div>
  );
}
