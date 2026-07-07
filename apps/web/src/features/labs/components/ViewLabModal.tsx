"use client";

import React from "react";
import { X, FileText, Download } from "lucide-react";

interface ViewLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  report: any;
}

export function ViewLabModal({ isOpen, onClose, report }: ViewLabModalProps) {
  if (!isOpen || !report) return null;

  const handleDownload = () => {
    alert("Downloading report PDF...");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900">
            <FileText className="w-5 h-5 text-indigo-600" /> Report Details
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{report.title}</h3>
            <p className="text-sm text-slate-500 mt-1">Date: {new Date(report.date).toLocaleDateString()}</p>
            <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-md bg-[#D1FAE5] text-[#065F46] text-xs font-bold uppercase tracking-wider">
              {report.status}
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="font-semibold text-slate-700 mb-2">Results</h4>
            {report.results && Object.keys(report.results).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(report.results).map(([key, value]) => (
                  <li key={key} className="flex justify-between text-sm">
                    <span className="text-slate-600">{key}</span>
                    <span className="font-medium text-slate-900">{String(value)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">Detailed parameters are available in the PDF report.</p>
            )}
          </div>
          
          <div className="pt-2 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-50 transition-colors">
              Close
            </button>
            <button onClick={handleDownload} className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
