"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile, useUpdateProfile } from "../hooks/useProfile";
import { toast } from "sonner";

export function EditProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { data: profile } = useProfile();
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const queryClient = useQueryClient();
  
  const [age, setAge] = React.useState("");
  const [bloodGroup, setBloodGroup] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  React.useEffect(() => {
    if (profile && isOpen) {
      const demo = (profile as any).demographics || {};
      setAge(demo.age?.toString() || "");
      setBloodGroup(demo.blood_group || "");
      setStatus(demo.status || "");
    }
  }, [profile, isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsSubmitting(true);
    try {
      const demo = (profile as any).demographics || {};
      await updateProfile({
        demographics: {
          ...demo,
          age: parseInt(age, 10),
          blood_group: bloodGroup,
          status: status
        }
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('✓ Profile updated successfully!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[425px] flex flex-col max-h-[90vh]">
        <div className="flex flex-col space-y-1.5 p-6 pb-0">
          <h2 className="text-lg font-semibold leading-none tracking-tight">Edit Profile</h2>
        </div>
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <label htmlFor="age" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Age</label>
              <input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="blood" className="text-sm font-medium leading-none">Blood Group</label>
              <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="" disabled>Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium leading-none">Health Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="" disabled>Select status</option>
                <option value="Healthy">Healthy</option>
                <option value="Chronic Condition">Chronic Condition</option>
                <option value="Recovering">Recovering</option>
              </select>
            </div>
            
            <div className="pt-4 flex justify-end gap-2 mt-4">
            <button type="button" className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-50 transition-colors" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
