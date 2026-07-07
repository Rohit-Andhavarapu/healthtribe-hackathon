"use client";

import * as React from "react";
import Image from "next/image";
import { PageContainer, SectionHeader } from "@/components/shared/layout";
import { InfoCard } from "@/components/shared/cards";
import { UserPlus, Activity, ShieldCheck, Edit2 } from "lucide-react";
import { motion } from "framer-motion";
import { useFamily } from "@/features/family/hooks/useFamily";
import { FamilyMemberModal } from "@/features/family/components/FamilyMemberModal";

export default function FamilyPage() {
  const { data: family = [], isLoading } = useFamily();
  const [activeUser, setActiveUser] = React.useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");
  const [modalData, setModalData] = React.useState<any>(null);

  const handleAddMember = () => {
    setModalMode("add");
    setModalData(null);
    setIsModalOpen(true);
  };
  
  const handleEditMember = () => {
    setModalMode("edit");
    const activeMemberData = family.find((m: any) => m.id === activeUser);
    setModalData(activeMemberData);
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    if (family.length > 0 && !activeUser) {
      setTimeout(() => setActiveUser(family[0].id), 0);
    }
  }, [family, activeUser]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeMember = family.find((m: any) => m.id === activeUser);

  return (
    <PageContainer>
      <div className="pt-2 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Family</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your dependents.</p>
        </div>
        <button onClick={handleAddMember} className="bg-primary-light text-primary p-3 rounded-full hover:bg-primary hover:text-white transition-colors shadow-sm">
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Switch Profiles */}
      <section>
        <SectionHeader title="Profiles" />
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x">
          {isLoading ? (
            <div className="text-slate-500 py-2">Loading family members...</div>
          ) : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            family.map((member: any) => (
              <motion.button
                key={member.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveUser(member.id)}
                className={`snap-start relative flex items-center gap-3 p-3 rounded-2xl border transition-all shrink-0 ${
                  activeUser === member.id 
                    ? "bg-slate-900 border-slate-900 text-white shadow-float" 
                    : "bg-white border-slate-200/60 text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 relative">
                  <Image src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`} alt={member.name} fill sizes="40px" className="object-cover" />
                </div>
                <div className="text-left pr-4">
                  <h3 className="font-bold text-[14px] leading-tight">{member.name}</h3>
                  <p className={`text-[12px] ${activeUser === member.id ? "text-slate-300" : "text-slate-500"}`}>
                    {member.relation_type} • {member.age}y
                  </p>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </section>

      {/* Selected Member Details */}
      {activeMember && (
        <motion.section 
          key={activeUser}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xl:gap-6">
            <InfoCard className="flex flex-col gap-2 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
              <Activity className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Health Score</p>
                <p className="text-2xl font-bold text-slate-900">95/100</p>
              </div>
            </InfoCard>
            
            <InfoCard className={`flex flex-col gap-2 bg-blue-50 border-blue-100`}>
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Status</p>
                <p className="text-lg font-bold text-slate-900">Healthy</p>
              </div>
            </InfoCard>
          </div>

          <SectionHeader title="Upcoming Appointments" />
          <div className="text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm font-medium text-slate-500">No upcoming appointments.</p>
          </div>
          
          <div className="flex justify-end mt-4">
            <button onClick={handleEditMember} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </motion.section>
      )}

      <FamilyMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        mode={modalMode} 
        initialData={modalData} 
      />
    </PageContainer>
  );
}
