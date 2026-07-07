"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@healthtribe/ui";
import { FileKey, CheckCircle2, Loader2, Plus, X } from "lucide-react";
import { useConsents, useGrantConsent, useRevokeConsent } from "../hooks/useConsents";
import { useHospitals } from "@/features/hospitals/hooks/useHospitals";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function usePatientId() {
  const { getToken, isLoaded } = useAuth();
  return useQuery({
    queryKey: ["patient-id"],
    queryFn: async () => {
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      return data.id as string;
    },
    enabled: isLoaded
  });
}

export function ConsentManagementSection() {
  const { data: patientId } = usePatientId();
  const { data: consents, isLoading } = useConsents(patientId ?? undefined);
  const { data: hospitals } = useHospitals();
  const { mutate: grantConsent, isPending: isGranting } = useGrantConsent();
  const { mutate: revokeConsent, isPending: isRevoking } = useRevokeConsent();

  const [selectedHospital, setSelectedHospital] = useState("");
  const [showGrantForm, setShowGrantForm] = useState(false);

  const getHospitalName = (id: string) =>
    hospitals?.find((h) => h.id === id)?.name || "Unknown Hospital";

  const handleGrant = () => {
    if (!patientId || !selectedHospital) return;
    grantConsent(
      { patientId, hospitalId: selectedHospital },
      {
        onSuccess: () => {
          toast.success("✓ Consent granted successfully!");
          setShowGrantForm(false);
          setSelectedHospital("");
        },
        onError: (err) => toast.error(`Failed to grant consent: ${err.message}`)
      }
    );
  };

  const handleRevoke = (consentId: string, hospitalName: string) => {
    revokeConsent(consentId, {
      onSuccess: () => toast.success(`✓ Consent revoked for ${hospitalName}`),
      onError: (err) => toast.error(`Failed to revoke consent: ${err.message}`)
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <FileKey className="w-5 h-5 text-indigo-600" />
            Consent Management
          </CardTitle>
          <button
            onClick={() => setShowGrantForm((p) => !p)}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Grant New
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Manage which hospitals have permission to share your records with HealthTribe.
          </p>

          {/* Grant consent form */}
          {showGrantForm && (
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-3">
              <p className="text-sm font-medium text-indigo-800">Grant hospital consent</p>
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="w-full text-sm border border-indigo-200 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select hospital...</option>
                {hospitals?.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowGrantForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGrant}
                  disabled={isGranting || !selectedHospital}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGranting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isGranting ? "Granting..." : "Grant Access"}
                </button>
              </div>
            </div>
          )}

          {/* Consent list */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : !consents || consents.length === 0 ? (
              <p className="text-sm text-slate-500 text-center p-6 border border-dashed border-slate-200 rounded-lg">
                No consents granted yet. Grant access to a hospital above to import records.
              </p>
            ) : (
              consents.map((consent) => (
                <div
                  key={consent.id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{getHospitalName(consent.hospital_id)}</p>
                    {consent.granted_at && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        Granted: {new Date(consent.granted_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {consent.status === "ACTIVE" ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                        {consent.status}
                      </span>
                    )}
                    {consent.status === "ACTIVE" && (
                      <button
                        onClick={() => handleRevoke(consent.id, getHospitalName(consent.hospital_id))}
                        disabled={isRevoking}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Revoke consent"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
