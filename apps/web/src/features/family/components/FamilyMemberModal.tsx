"use client";

import * as React from "react";

import { useQueryClient } from "@tanstack/react-query";
import { 
  createFamilyMemberApiV1FamilyPost, 
  updateFamilyMemberApiV1FamilyMemberIdPut, 
  deleteFamilyMemberApiV1FamilyMemberIdDelete 
} from "@healthtribe/api-client";

export function FamilyMemberModal({ 
  isOpen, 
  onClose, 
  mode, 
  initialData 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  mode: "add" | "edit"; 
  initialData?: any;
}) {
  const queryClient = useQueryClient();
  
  const [name, setName] = React.useState("");
  const [relationType, setRelationType] = React.useState("");
  const [age, setAge] = React.useState("");
  const [accessLevel, setAccessLevel] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  
  React.useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setName(initialData.name || "");
        setRelationType(initialData.relation_type || "");
        setAge(initialData.age?.toString() || "");
        setAccessLevel(initialData.access_level || "");
      } else {
        setName("");
        setRelationType("");
        setAge("");
        setAccessLevel("Full");
      }
    }
  }, [isOpen, mode, initialData]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (mode === "add") {
        await createFamilyMemberApiV1FamilyPost({
          body: {
            name,
            relation_type: relationType,
            age: parseInt(age, 10),
            access_level: accessLevel
          }
        });
      } else if (mode === "edit" && initialData?.id) {
        await updateFamilyMemberApiV1FamilyMemberIdPut({
          path: { member_id: initialData.id },
          body: {
            name,
            relation_type: relationType,
            age: parseInt(age, 10),
            access_level: accessLevel
          }
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['family'] });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save family member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (!confirm("Are you sure you want to remove this family member?")) return;
    
    setIsDeleting(true);
    try {
      await deleteFamilyMemberApiV1FamilyMemberIdDelete({
        path: { member_id: initialData.id }
      });
      queryClient.invalidateQueries({ queryKey: ['family'] });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to delete family member");
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[425px] flex flex-col max-h-[90vh]">
        <div className="flex flex-col space-y-1.5 p-6 pb-0">
          <h2 className="text-lg font-semibold leading-none tracking-tight">{mode === "add" ? "Add Family Member" : "Edit Family Member"}</h2>
        </div>
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="relation" className="text-sm font-medium leading-none">Relation</label>
              <input id="relation" value={relationType} onChange={(e) => setRelationType(e.target.value)} required placeholder="e.g. Spouse, Child, Parent" className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="age" className="text-sm font-medium leading-none">Age</label>
              <input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="access" className="text-sm font-medium leading-none">Access Level</label>
              <select value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)} className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="" disabled>Select access level</option>
                <option value="Full">Full Access</option>
                <option value="View Only">View Only</option>
                <option value="Emergency">Emergency Only</option>
              </select>
            </div>
            
            <div className="pt-4 flex justify-between sm:justify-between w-full mt-4">
            {mode === "edit" ? (
              <button type="button" className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50" onClick={handleDelete} disabled={isDeleting}>
                Delete
              </button>
            ) : <div></div>}
            
            <div className="flex gap-2">
              <button type="button" className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-50 transition-colors" onClick={onClose}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
