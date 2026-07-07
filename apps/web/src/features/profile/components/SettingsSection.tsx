"use client";

import * as React from "react";
import { User, Phone, Bell, ChevronRight, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { PersonalDetailsModal } from "./PersonalDetailsModal";
import { EmergencyContactsModal } from "./EmergencyContactsModal";
import { MedicalInformationModal } from "./MedicalInformationModal";
import { NotificationSettingsModal } from "./NotificationSettingsModal";

export function SettingsSection() {
  const [showPersonalDetails, setShowPersonalDetails] = React.useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = React.useState(false);
  const [showMedicalInfo, setShowMedicalInfo] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  
  return (
    <>
      <div className="space-y-6">
        <section>
          <h3 className="text-[15px] font-bold text-slate-900 tracking-tight mb-3 px-1">Account & Medical</h3>
          <div className="bg-white rounded-3xl p-2 shadow-card border border-slate-100">
            <motion.div 
              whileTap={{ scale: 0.98 }} 
              onClick={() => setShowPersonalDetails(true)}
              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="bg-primary/10 text-primary p-3 rounded-2xl">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-[15px]">Personal Details</h4>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </motion.div>
            
            <div className="h-px bg-slate-100 mx-4 my-1" />
            
            <motion.div 
              whileTap={{ scale: 0.98 }} 
              onClick={() => setShowEmergencyContacts(true)}
              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-[15px]">Emergency Contacts</h4>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </motion.div>
            
            <div className="h-px bg-slate-100 mx-4 my-1" />
            
            <motion.div 
              whileTap={{ scale: 0.98 }} 
              onClick={() => setShowMedicalInfo(true)}
              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-[15px]">Conditions & Allergies</h4>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </motion.div>
          </div>
        </section>

        <section>
          <h3 className="text-[15px] font-bold text-slate-900 tracking-tight mb-3 px-1">Preferences</h3>
          <div className="bg-white rounded-3xl p-2 shadow-card border border-slate-100">
            <motion.div 
              whileTap={{ scale: 0.98 }} 
              onClick={() => setShowNotifications(true)}
              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="bg-slate-100 text-slate-600 p-3 rounded-2xl">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-[15px]">Notifications</h4>
                <p className="text-[13px] text-slate-500 font-medium">Push & Email</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </motion.div>
          </div>
        </section>
      </div>
      
      {/* Modals */}
      <PersonalDetailsModal isOpen={showPersonalDetails} onClose={() => setShowPersonalDetails(false)} />
      <EmergencyContactsModal isOpen={showEmergencyContacts} onClose={() => setShowEmergencyContacts(false)} />
      <MedicalInformationModal isOpen={showMedicalInfo} onClose={() => setShowMedicalInfo(false)} />
      <NotificationSettingsModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}
