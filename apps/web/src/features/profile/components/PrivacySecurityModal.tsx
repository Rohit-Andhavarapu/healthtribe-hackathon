"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { X, Shield, Download, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface PrivacySecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacySecurityModal({ isOpen, onClose }: PrivacySecurityModalProps) {
  const { getToken } = useAuth();
  
  // Fetch ABHA status
  const { data: abhaIdentity } = useQuery({
    queryKey: ["abha-identity"],
    queryFn: async () => {
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/abha/identity`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) return null;
      return resp.json();
    },
    enabled: isOpen
  });
  
  // Fetch consents
  const { data: consents = [] } = useQuery({
    queryKey: ["consent-requests"],
    queryFn: async () => {
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/consent/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) return [];
      return resp.json();
    },
    enabled: isOpen
  });
  
  const handleDownloadData = () => {
    toast.info("Download My Data feature - Demo mode");
    // In production, this would trigger a data export
  };
  
  const handleDeleteAccount = () => {
    const confirmed = confirm(
      "⚠️ Are you absolutely sure you want to delete your account?\n\nThis action cannot be undone. All your medical records, appointments, and data will be permanently deleted."
    );
    if (confirmed) {
      toast.info("Delete Account - Demo mode (not actually deleted)");
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[700px] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Privacy & Security</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ABHA Status */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">ABHA Identity</h3>
            <div className="p-4 border border-slate-200 rounded-lg">
              {abhaIdentity ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-900">ABHA Linked</span>
                  </div>
                  <p className="text-sm text-slate-600">ABHA Number: {abhaIdentity.abha_number}</p>
                  <p className="text-sm text-slate-600">ABHA Address: {abhaIdentity.abha_address}</p>
                  <p className="text-xs text-slate-500 mt-2">Status: {abhaIdentity.verification_status}</p>
                </>
              ) : (
                <p className="text-sm text-slate-600">No ABHA identity linked</p>
              )}
            </div>
          </div>
          
          {/* Active Consents */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Active Consents</h3>
            <div className="space-y-2">
              {consents.filter((c: any) => c.status === "APPROVED" || c.status === "PENDING").length === 0 ? (
                <p className="text-sm text-slate-600 p-4 border border-slate-200 rounded-lg">No active consents</p>
              ) : (
                consents
                  .filter((c: any) => c.status === "APPROVED" || c.status === "PENDING")
                  .map((consent: any) => (
                    <div key={consent.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{consent.hospital_name}</p>
                          <p className="text-xs text-slate-600 mt-1">{consent.purpose}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Expires: {new Date(consent.expiry).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          consent.status === "APPROVED" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {consent.status}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
          
          {/* Data Rights */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Your Data Rights</h3>
            <div className="space-y-3">
              <button
                onClick={handleDownloadData}
                className="w-full flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
              >
                <Download className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Download My Data</p>
                  <p className="text-xs text-slate-600">Export all your health records and data</p>
                </div>
              </button>
              
              <button
                onClick={handleDeleteAccount}
                className="w-full flex items-center gap-3 p-4 border border-rose-200 rounded-lg hover:border-rose-300 hover:bg-rose-50 transition-colors text-left"
              >
                <Trash2 className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-rose-900">Delete My Account</p>
                  <p className="text-xs text-rose-600">Permanently delete your account and all data</p>
                </div>
              </button>
            </div>
          </div>
          
          {/* Legal Documents */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Legal & Policies</h3>
            <div className="space-y-2">
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); toast.info("Privacy Policy - Demo mode"); }}
                className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-900">Privacy Policy</span>
              </a>
              
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); toast.info("Terms of Service - Demo mode"); }}
                className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-900">Terms of Service</span>
              </a>
              
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); toast.info("Data Processing Agreement - Demo mode"); }}
                className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-4 h-4 text-slate-600" />
                <span className="text-sm text-slate-900">Data Processing Agreement</span>
              </a>
            </div>
          </div>
          
          {/* Session Info */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Session Information</h4>
            <div className="space-y-1 text-xs text-slate-600">
              <p>Last Login: {new Date().toLocaleString()}</p>
              <p>Browser: {navigator.userAgent.split(" ").slice(-1)[0]}</p>
              <p>IP Address: 192.168.1.1 (Mock)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
