"use client";

import * as React from "react";
import { PageContainer, SectionHeader } from "@/components/shared/layout";
import { AlertTriangle, ShieldAlert, Ambulance } from "lucide-react";

export default function EmergencyPage() {
  return (
    <PageContainer>
      <div className="pt-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-8 h-8 text-rose-500" /> Emergency
        </h1>
        <p className="text-slate-500 font-medium mt-1">Quick access to emergency contacts and services.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
            <Ambulance className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Call Ambulance</h2>
          <p className="text-slate-600 mb-6 text-sm">Immediate medical transportation to the nearest hospital.</p>
          <a href="tel:911" className="bg-rose-600 hover:bg-rose-700 text-white w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-rose-200 transition-all">
            Call 911
          </a>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Emergency Hotline</h2>
          <p className="text-slate-600 mb-6 text-sm">24/7 medical advice from certified professionals.</p>
          <a href="tel:1-800-123-4567" className="bg-orange-500 hover:bg-orange-600 text-white w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-all">
            Call 1-800-HEALTH
          </a>
        </div>
      </div>
      
      <div className="mt-8">
        <SectionHeader title="Your Emergency Contacts" />
        <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-4">No emergency contacts added yet.</p>
          <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors">
            Add Contact
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
