"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star, Award } from "lucide-react";
import Image from "next/image";
import { Doctor } from "../types";

interface DoctorFeaturedCardProps {
  doctor: Doctor;
  onClick: (doc: Doctor) => void;
}

export function DoctorFeaturedCard({ doctor, onClick }: DoctorFeaturedCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="snap-start min-w-[240px] max-w-[260px] bg-white border border-slate-100/80 rounded-[28px] p-4 shadow-card hover:shadow-float transition-shadow flex flex-col"
    >
      <div className="relative mb-4">
        <div className="w-full h-[150px] rounded-[20px] overflow-hidden bg-slate-100 relative">
          <Image 
            src={doctor.image_url || "https://images.unsplash.com/photo-1612349317150-e410f624c4a5?q=80&w=256&auto=format&fit=crop"} 
            alt={doctor.name} 
            fill
            sizes="240px"
            className="object-cover"
          />
        </div>
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-sm flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-primary" />
          {doctor.experience || "Experienced"}
        </div>
      </div>
      
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-bold text-slate-900 text-[18px] tracking-tight truncate">{doctor.name}</h3>
        <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg shrink-0">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1" /> {doctor.rating?.toFixed(1) || "New"}
        </span>
      </div>
      
      <p className="text-[14px] font-medium text-slate-500 mb-5 truncate">{doctor.specialty} • {doctor.hospital_name}</p>
      
      <motion.button 
        whileTap={{ scale: 0.97 }}
        onClick={() => onClick(doctor)}
        className="mt-auto w-full py-3.5 rounded-[16px] bg-slate-900 text-white font-bold text-[14px] hover:bg-slate-800 transition-colors shadow-float"
      >
        Book • {doctor.consultation_fee || "See pricing"}
      </motion.button>
    </motion.div>
  );
}
