"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { X, Plus, Edit2, Trash2, Star } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface EmergencyContact {
  id: string;
  patient_id: string;
  name: string;
  relationship: string;
  phone_number: string;
  is_primary: boolean;
}

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencyContactsModal({ isOpen, onClose }: EmergencyContactsModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = React.useState(false);
  const [editingContact, setEditingContact] = React.useState<EmergencyContact | null>(null);
  
  const [name, setName] = React.useState("");
  const [relationship, setRelationship] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [isPrimary, setIsPrimary] = React.useState(false);
  
  // Fetch contacts
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["emergency-contacts"],
    queryFn: async () => {
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/profile/emergency-contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error("Failed to fetch contacts");
      return resp.json() as Promise<EmergencyContact[]>;
    },
    enabled: isOpen
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; relationship: string; phone_number: string; is_primary: boolean }) => {
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/profile/emergency-contacts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!resp.ok) {
        const error = await resp.json();
        throw new Error(error.detail || "Failed to create contact");
      }
      return resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
      toast.success("✓ Emergency contact added");
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmergencyContact> }) => {
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/profile/emergency-contacts/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!resp.ok) throw new Error("Failed to update contact");
      return resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
      toast.success("✓ Emergency contact updated");
      resetForm();
    },
    onError: () => {
      toast.error("Failed to update contact");
    }
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/profile/emergency-contacts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error("Failed to delete contact");
      return resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
      toast.success("✓ Emergency contact deleted");
    },
    onError: () => {
      toast.error("Failed to delete contact");
    }
  });
  
  const resetForm = () => {
    setName("");
    setRelationship("");
    setPhoneNumber("");
    setIsPrimary(false);
    setShowForm(false);
    setEditingContact(null);
  };
  
  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setRelationship(contact.relationship);
    setPhoneNumber(contact.phone_number);
    setIsPrimary(contact.is_primary);
    setShowForm(true);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingContact) {
      updateMutation.mutate({
        id: editingContact.id,
        data: {
          name,
          relationship,
          phone_number: phoneNumber,
          is_primary: isPrimary
        }
      });
    } else {
      createMutation.mutate({
        name,
        relationship,
        phone_number: phoneNumber,
        is_primary: isPrimary
      });
    }
  };
  
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this emergency contact?")) {
      deleteMutation.mutate(id);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[600px] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Emergency Contacts</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {!showForm && (
            <>
              <div className="mb-4">
                <button
                  onClick={() => setShowForm(true)}
                  disabled={contacts.length >= 5}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Emergency Contact {contacts.length > 0 && `(${contacts.length}/5)`}
                </button>
                {contacts.length >= 5 && (
                  <p className="text-xs text-amber-600 mt-2 text-center">Maximum 5 contacts allowed</p>
                )}
              </div>
              
              {isLoading ? (
                <p className="text-center text-slate-500 py-8">Loading contacts...</p>
              ) : contacts.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No emergency contacts added yet</p>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{contact.name}</h3>
                            {contact.is_primary && (
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{contact.relationship}</p>
                          <p className="text-sm text-slate-500 mt-1">{contact.phone_number}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(contact)}
                            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id)}
                            className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Relationship</label>
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  required
                  placeholder="e.g., Spouse, Parent, Sibling"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-primary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="is-primary" className="text-sm font-medium text-slate-700">
                  Set as primary contact
                </label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingContact ? "Update" : "Add Contact"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
