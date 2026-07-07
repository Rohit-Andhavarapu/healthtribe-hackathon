"use client";

import React, { useState } from "react";
import { UploadCloud, X, FileText, CheckCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { createLabReportApiV1LabsPost } from "@healthtribe/api-client";

interface UploadLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export function UploadLabModal({ isOpen, onClose, patientId }: UploadLabModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("Final");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    setIsSubmitting(true);
    try {
      await createLabReportApiV1LabsPost({
        body: {
          patient_id: patientId,
          title,
          date,
          status,
          results: {}
        }
      });
      
      queryClient.invalidateQueries({ queryKey: ['labs'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      
      setTitle("");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to upload lab report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[425px] flex flex-col">
        <div className="flex items-center justify-between p-6 pb-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" /> Upload Lab Report
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Report Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                placeholder="e.g. Complete Blood Count"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50" 
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" 
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="Final">Final</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            
            <div className="pt-4 flex justify-end gap-2 mt-4">
              <button type="button" className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-50 transition-colors" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2" disabled={isSubmitting}>
                {isSubmitting ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
