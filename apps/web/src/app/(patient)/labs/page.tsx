"use client";

import * as React from "react";
import { useState } from "react";
import { PageContainer, SectionHeader } from "@/components/shared/layout";
import { InfoCard } from "@/components/shared/cards";
import { Search, TestTube, FileText, UploadCloud, Activity, Droplet } from "lucide-react";
import { useLabs } from "@/features/labs/hooks/useLabs";
import { ViewLabModal } from "@/features/labs/components/ViewLabModal";

export default function LabsPage() {
  const { data: reports = [], isLoading } = useLabs();
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const handleUploadClick = () => {
    alert("Patient uploads are currently disabled. Please contact your provider.");
  };

  return (
    <PageContainer>
      <div className="pt-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Lab Tests</h1>
        <p className="text-slate-500 font-medium mt-1">Book tests or view your reports.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search for blood tests, profiles..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
        />
      </div>

      <section>
        <SectionHeader title="Popular Tests" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <InfoCard hover className="flex flex-col items-start gap-3">
            <div className="bg-red-50 text-red-600 p-2.5 rounded-xl">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Complete Blood Count</h4>
              <p className="text-xs text-slate-500 font-medium">Includes 24 parameters</p>
            </div>
            <p className="font-bold text-primary text-sm mt-1">$45.00</p>
          </InfoCard>
          <InfoCard hover className="flex flex-col items-start gap-3">
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Lipid Profile</h4>
              <p className="text-xs text-slate-500 font-medium">Cholesterol check</p>
            </div>
            <p className="font-bold text-primary text-sm mt-1">$35.00</p>
          </InfoCard>
        </div>
      </section>

      <section>
        <SectionHeader title="My Reports" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="text-slate-500 py-4 text-center md:col-span-2 lg:col-span-3">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-slate-500 py-4 text-center md:col-span-2 lg:col-span-3">No reports found.</div>
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            reports.map((report: any) => (
              <InfoCard key={report.id} className="flex items-center gap-4 p-3 h-full" hover>
                <div className={`p-3 rounded-2xl shrink-0 ${report.status === 'Final' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-slate-100 text-slate-500'}`}>
                  {report.status === 'Final' ? <FileText className="w-6 h-6" /> : <TestTube className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{report.title}</h4>
                  <p className="text-xs text-slate-500 font-medium truncate">{report.status === 'Final' ? `Report ready • ${new Date(report.date).toLocaleDateString()}` : `Pending • ${report.status}`}</p>
                </div>
                {report.status === 'Final' && (
                  <button onClick={() => setSelectedReport(report)} className="text-primary font-bold text-xs bg-primary-light px-3 py-1.5 rounded-lg shrink-0">View</button>
                )}
              </InfoCard>
            ))
          )}
        </div>
      </section>

      <section>
        <button onClick={handleUploadClick} className="w-full border-2 border-dashed border-primary/30 bg-primary-light/30 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-primary-light/50 hover:border-primary/50 transition-colors">
          <div className="bg-white p-3 rounded-full shadow-sm text-primary">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-primary text-sm">Upload Previous Reports</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">PDF or Image formats supported</p>
          </div>
        </button>
      </section>

      <ViewLabModal 
        isOpen={!!selectedReport} 
        onClose={() => setSelectedReport(null)} 
        report={selectedReport} 
      />
    </PageContainer>
  );
}
