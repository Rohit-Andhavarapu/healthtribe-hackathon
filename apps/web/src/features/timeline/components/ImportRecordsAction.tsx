"use client";

import React, { useState } from "react";
import { DownloadCloud, CheckCircle, Loader2, X } from "lucide-react";
import { useImportRecords } from "../../abha/hooks/useImportRecords";
import { useHospitals } from "@/features/hospitals/hooks/useHospitals";
import { toast } from "sonner";

export function ImportRecordsAction() {
  const { data: hospitals } = useHospitals();
  const { mutateAsync: importRecords, isPending } = useImportRecords();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"select" | "importing" | "done">("select");
  const [hospitalId, setHospitalId] = useState("");
  const [lastResult, setLastResult] = useState<{ imported_count: number; hospital: string } | null>(null);

  const handleImport = async () => {
    if (!hospitalId) return;
    const hospitalName = hospitals?.find(h => h.id === hospitalId)?.name || "Hospital";
    setStep("importing");

    try {
      const result = await importRecords({ hospitalId });
      setLastResult({ imported_count: result.imported_count, hospital: hospitalName });
      setStep("done");
      toast.success(`✓ ${result.imported_count} records imported from ${hospitalName}!`);
      // Auto close after success
      setTimeout(() => {
        setIsOpen(false);
        setStep("select");
        setHospitalId("");
        setLastResult(null);
      }, 3000);
    } catch (error: unknown) {
      console.error(error);
      setStep("select");
      toast.error(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="shadow-sm rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 px-4 py-3.5 text-[15px] font-medium transition flex items-center gap-2 flex-shrink-0"
      >
        <DownloadCloud className="w-4 h-4" />
        <span className="hidden sm:inline">Import Records</span>
      </button>
    );
  }

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <DownloadCloud className="w-4 h-4 text-indigo-600" />
          Import External Records
        </h3>
        <button
          onClick={() => { setIsOpen(false); setStep("select"); setHospitalId(""); }}
          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {step === "select" && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Fetch your medical records via ABHA from any hospital in India. Records will appear on your Timeline.
          </p>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Select Hospital / Clinic</label>
            <select
              className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={hospitalId}
              onChange={e => setHospitalId(e.target.value)}
            >
              <option value="" disabled>Choose a facility...</option>
              {hospitals?.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleImport}
            disabled={!hospitalId || isPending}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <DownloadCloud className="w-4 h-4" />
            Import Records
          </button>
        </div>
      )}

      {step === "importing" && (
        <div className="py-6 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-indigo-600">Fetching records via ABHA...</p>
          <p className="text-xs text-slate-400">This may take a moment</p>
        </div>
      )}

      {step === "done" && lastResult && (
        <div className="py-4 text-center space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
          <p className="text-sm font-bold text-emerald-700">Import Complete!</p>
          <p className="text-xs text-slate-600">
            <span className="font-semibold">{lastResult.imported_count}</span> records imported from{" "}
            <span className="font-semibold">{lastResult.hospital}</span>
          </p>
          <p className="text-xs text-slate-400">Your Timeline has been updated with the new records.</p>
        </div>
      )}
    </div>
  );
}
