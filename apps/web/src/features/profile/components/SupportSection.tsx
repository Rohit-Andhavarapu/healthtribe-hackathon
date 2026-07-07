"use client";

import * as React from "react";
import { Shield, Info, ChevronRight, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { HelpCenterModal } from "./HelpCenterModal";
import { PrivacySecurityModal } from "./PrivacySecurityModal";
import { AboutHealthTribeModal } from "./AboutHealthTribeModal";

export function SupportSection() {
  const [showHelpCenter, setShowHelpCenter] = React.useState(false);
  const [showPrivacySecurity, setShowPrivacySecurity] = React.useState(false);
  const [showAbout, setShowAbout] = React.useState(false);
  
  return (
    <>
      <section className="mt-6 mb-8">
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight mb-3 px-1">Support & About</h3>
        <div className="bg-white rounded-3xl p-2 shadow-card border border-slate-100">
          <motion.div 
            whileTap={{ scale: 0.98 }} 
            onClick={() => setShowHelpCenter(true)}
            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="bg-slate-100 text-slate-600 p-3 rounded-2xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-[15px]">Help Center</h4>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </motion.div>
          
          <div className="h-px bg-slate-100 mx-4 my-1" />
          
          <motion.div 
            whileTap={{ scale: 0.98 }} 
            onClick={() => setShowPrivacySecurity(true)}
            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="bg-slate-100 text-slate-600 p-3 rounded-2xl">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-[15px]">Privacy & Security</h4>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </motion.div>
          
          <div className="h-px bg-slate-100 mx-4 my-1" />
          
          <motion.div 
            whileTap={{ scale: 0.98 }} 
            onClick={() => setShowAbout(true)}
            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div className="bg-slate-100 text-slate-600 p-3 rounded-2xl">
              <Info className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-[15px]">About HealthTribe</h4>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </motion.div>
        </div>
      </section>
      
      {/* Modals */}
      <HelpCenterModal isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} />
      <PrivacySecurityModal isOpen={showPrivacySecurity} onClose={() => setShowPrivacySecurity(false)} />
      <AboutHealthTribeModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  );
}
