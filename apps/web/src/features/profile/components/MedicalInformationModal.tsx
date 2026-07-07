"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { X, Plus, Trash2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface MedicalInformation {
  id: string;
  patient_id: string;
  conditions: string[];
  allergies: string[];
  chronic_diseases: string[];
  past_surgeries: string[];
  medical_notes: string | null;
}

interface MedicalInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MedicalInformationModal({ isOpen, onClose }: MedicalInformationModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  
  const [conditions, setConditions] = React.useState<string[]>([]);
  const [allergies, setAllergies] = React.useState<string[]>([]);
  const [chronicDiseases, setChronicDiseases] = React.useState<string[]>([]);
  const [pastSurgeries, setPastSurgeries] = React.useState<string[]>([]);
  const [medicalNotes, setMedicalNotes] = React.useState("");
  
  const [newCondition, setNewCondition] = React.useState("");
  const [newAllergy, setNewAllergy] = React.useState("");
  const [newChronicDisease, setNewChronicDisease] = React.useState("");
  const [newSurgery, setNewSurgery] = React.useState("");
  
  // Fetch medical info
  const { data: medicalInfo, isLoading } = useQuery({
    queryKey: ["medical-info"],
    queryFn: async () => {
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/profile/medical-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error("Failed to fetch medical info");
      return resp.json() as Promise<MedicalInformation>;
    },
    enabled: isOpen
  });
  
  React.useEffect(() => {
    if (medicalInfo) {
      setConditions(medicalInfo.conditions || []);
      setAllergies(medicalInfo.allergies || []);
      setChronicDiseases(medicalInfo.chronic_diseases || []);
      setPastSurgeries(medicalInfo.past_surgeries || []);
      setMedicalNotes(medicalInfo.medical_notes || "");
    }
  }, [medicalInfo]);
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<MedicalInformation>) => {
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/profile/medical-info`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!resp.ok) throw new Error("Failed to update medical info");
      return resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-info"] });
      toast.success("✓ Medical information updated");
    },
    onError: () => {
      toast.error("Failed to update medical information");
    }
  });
  
  const handleSave = () => {
    updateMutation.mutate({
      conditions,
      allergies,
      chronic_diseases: chronicDiseases,
      past_surgeries: pastSurgeries,
      medical_notes: medicalNotes
    });
  };
  
  const addItem = (list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, value: string, clearFn: () => void) => {
    if (value.trim() && !list.includes(value.trim())) {
      setter([...list, value.trim()]);
      clearFn();
    }
  };
  
  const removeItem = (list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter(list.filter((_, i) => i !== index));
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[700px] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Medical Information</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <p className="text-center text-slate-500 py-8">Loading medical information...</p>
          ) : (
            <>
              {/* Known Conditions */}
              <div>
                <label className="text-sm font-semibold text-slate-900 block mb-2">Known Conditions</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem(conditions, setConditions, newCondition, () => setNewCondition(""));
                      }
                    }}
                    placeholder="Add condition..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => addItem(conditions, setConditions, newCondition, () => setNewCondition(""))}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((condition, index) => (
                    <div key={index} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
                      <span>{condition}</span>
                      <button
                        onClick={() => removeItem(conditions, setConditions, index)}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {conditions.length === 0 && <p className="text-sm text-slate-400">No conditions added</p>}
                </div>
              </div>
              
              {/* Allergies */}
              <div>
                <label className="text-sm font-semibold text-slate-900 block mb-2">Known Allergies</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem(allergies, setAllergies, newAllergy, () => setNewAllergy(""));
                      }
                    }}
                    placeholder="Add allergy..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => addItem(allergies, setAllergies, newAllergy, () => setNewAllergy(""))}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy, index) => (
                    <div key={index} className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-sm">
                      <span>{allergy}</span>
                      <button
                        onClick={() => removeItem(allergies, setAllergies, index)}
                        className="ml-1 hover:text-rose-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {allergies.length === 0 && <p className="text-sm text-slate-400">No allergies added</p>}
                </div>
              </div>
              
              {/* Chronic Diseases */}
              <div>
                <label className="text-sm font-semibold text-slate-900 block mb-2">Current Chronic Diseases</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newChronicDisease}
                    onChange={(e) => setNewChronicDisease(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem(chronicDiseases, setChronicDiseases, newChronicDisease, () => setNewChronicDisease(""));
                      }
                    }}
                    placeholder="Add chronic disease..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => addItem(chronicDiseases, setChronicDiseases, newChronicDisease, () => setNewChronicDisease(""))}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {chronicDiseases.map((disease, index) => (
                    <div key={index} className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm">
                      <span>{disease}</span>
                      <button
                        onClick={() => removeItem(chronicDiseases, setChronicDiseases, index)}
                        className="ml-1 hover:text-amber-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {chronicDiseases.length === 0 && <p className="text-sm text-slate-400">No chronic diseases added</p>}
                </div>
              </div>
              
              {/* Past Surgeries */}
              <div>
                <label className="text-sm font-semibold text-slate-900 block mb-2">Past Surgeries</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSurgery}
                    onChange={(e) => setNewSurgery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem(pastSurgeries, setPastSurgeries, newSurgery, () => setNewSurgery(""));
                      }
                    }}
                    placeholder="Add surgery..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => addItem(pastSurgeries, setPastSurgeries, newSurgery, () => setNewSurgery(""))}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pastSurgeries.map((surgery, index) => (
                    <div key={index} className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm">
                      <span>{surgery}</span>
                      <button
                        onClick={() => removeItem(pastSurgeries, setPastSurgeries, index)}
                        className="ml-1 hover:text-purple-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {pastSurgeries.length === 0 && <p className="text-sm text-slate-400">No past surgeries added</p>}
                </div>
              </div>
              
              {/* Medical Notes */}
              <div>
                <label className="text-sm font-semibold text-slate-900 block mb-2">Medical Notes</label>
                <textarea
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  rows={4}
                  placeholder="Any additional medical information..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
