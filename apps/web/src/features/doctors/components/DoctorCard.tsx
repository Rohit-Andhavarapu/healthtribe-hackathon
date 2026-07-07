"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star, Clock, Languages, Award } from 'lucide-react';
import Image from "next/image";
import { Doctor } from "../types";

interface DoctorCardProps {
  doctor: Doctor;
  onClick: (doc: Doctor) => void;
}

export function DoctorCard({ doctor, onClick }: DoctorCardProps) {
  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(doctor)}
      className="bg-white rounded-3xl p-4 shadow-card hover:shadow-float border border-slate-100 transition-all cursor-pointer flex gap-4 min-h-[140px]"
    >
      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
        <Image 
          src={doctor.image_url || "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=256&auto=format&fit=crop"} 
          alt={doctor.name} 
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>
      <div className="flex-1 py-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-slate-900 text-[17px] tracking-tight truncate">{doctor.name}</h3>
          <span className="flex items-center text-xs font-bold text-amber-600 shrink-0 bg-amber-50 px-2 py-0.5 rounded-lg">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1" /> {doctor.rating?.toFixed(1) || "New"}
          </span>
        </div>
        
        <p className="text-[13px] text-slate-500 font-medium mb-3 truncate">{doctor.specialty} • {doctor.hospital_name}</p>
        
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 mb-4">
          <span className="flex items-center bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
            <Award className="w-3 h-3 mr-1 text-slate-400" /> {doctor.experience || "N/A"}
          </span>
          <span className="flex items-center bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
            <Languages className="w-3 h-3 mr-1 text-slate-400" /> {doctor.languages || "N/A"}
          </span>
        </div>
        
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="font-bold text-slate-900 text-[15px]">{doctor.consultation_fee || "Contact for pricing"} <span className="text-xs text-slate-400 font-normal">/visit</span></span>
          <span className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-bold">
            <Clock className="w-3 h-3 mr-1" /> {doctor.availability || "Check schedule"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
