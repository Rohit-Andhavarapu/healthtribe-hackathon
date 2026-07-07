"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@healthtribe/ui";
import { HeartPulse, Activity } from "lucide-react";

export function HealthSummarySection() {
  return (
    <Card className="shadow-sm border-indigo-100">
      <CardHeader className="bg-indigo-50/50 pb-4">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-rose-500" />
          AI Health Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <span className="text-sm text-slate-500">Overall Health</span>
              <span className="text-2xl font-bold text-emerald-600 mt-1">Good</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <span className="text-sm text-slate-500">Risk Factors</span>
              <span className="text-2xl font-bold text-amber-600 mt-1">Low</span>
            </div>
          </div>
          
          <div className="bg-indigo-50/30 p-4 rounded-lg text-sm text-slate-700 leading-relaxed border border-indigo-50">
            <p className="flex items-start gap-2">
              <Activity className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
              Patient's recent lab results from imported Apollo hospital records show normal lipid panels. No urgent medical attention required. Continuous monitoring of BP recommended based on family history.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
