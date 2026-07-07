"use client";

import * as React from "react";
import { Shield, Droplet, Calendar, HeartPulse, Pencil } from "lucide-react";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useUser } from "@clerk/nextjs";
import { EditProfileModal } from "./EditProfileModal";

export function ProfileHeader() {
  const { data: profile, isLoading } = useProfile();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  if (!isUserLoaded || isLoading) {
    return <div className="pt-2 text-center text-slate-500 py-8 animate-pulse">Loading profile...</div>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyProfile = profile as any;
  const name = user?.fullName || anyProfile?.name || "Patient";
  const email = user?.primaryEmailAddress?.emailAddress || anyProfile?.email || "";
  // Use plain <img> to avoid next/image hostname restrictions
  const avatarUrl = user?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=200`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const demographics = (profile?.demographics as any) || {};
  const bloodType = demographics?.blood_group || "O+";
  const age = demographics?.age ? `${demographics.age} Yrs` : "28 Yrs";
  const status = demographics?.status || "Healthy";

  return (
    <div className="pt-2 text-center flex flex-col items-center mb-8">
      <div className="relative w-28 h-28 mb-5">
        {/* Using <img> instead of next/image to avoid hostname configuration issues */}
        <img
          src={avatarUrl}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border-[5px] border-white shadow-card bg-slate-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=200`;
          }}
        />
        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm">
          <Shield className="w-4 h-4" />
        </div>
      </div>

      <h1 className="text-[26px] font-black text-slate-900 tracking-tight mb-1">{name}</h1>
      <p className="text-slate-500 font-medium text-[15px] mb-6">{email}</p>

      <div className="flex gap-3 justify-center w-full px-4 mb-4">
        <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col items-center">
          <Droplet className="w-5 h-5 text-rose-500 mb-1.5" />
          <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Blood</span>
          <span className="text-sm font-black text-slate-800">{bloodType}</span>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col items-center">
          <Calendar className="w-5 h-5 text-blue-500 mb-1.5" />
          <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Age</span>
          <span className="text-sm font-black text-slate-800">{age}</span>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col items-center">
          <HeartPulse className="w-5 h-5 text-emerald-500 mb-1.5" />
          <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
          <span className="text-sm font-black text-slate-800">{status}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsEditModalOpen(true)}
        className="flex items-center rounded-full px-6 py-2 text-sm font-medium bg-white/50 hover:bg-slate-100 shadow-sm border border-slate-200 text-slate-700 transition-colors"
      >
        <Pencil className="w-4 h-4 mr-2" />
        Edit Profile
      </button>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </div>
  );
}
