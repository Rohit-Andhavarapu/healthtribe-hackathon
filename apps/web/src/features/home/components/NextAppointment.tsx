/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import * as React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Video } from "lucide-react";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { useDoctors } from "@/features/doctors/hooks/useDoctors";

export function NextAppointment() {
  const { data: appointments = [], isLoading: loadingAppts } = useAppointments();
  const { data: doctors = [], isLoading: loadingDocs } = useDoctors();
  
  const upcoming = appointments.find((a: any) => new Date(a.date) > new Date() && a.status === 'Upcoming' || a.status === 'Scheduled');
  const doctor = upcoming ? doctors.find((d: any) => d.id === upcoming.doctor_id) : null;
  
  if (loadingAppts || loadingDocs) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Upcoming Appointment</h3>
        </div>
        <div className="bg-white rounded-3xl p-5 shadow-card text-center text-slate-500">Loading...</div>
      </section>
    );
  }

  if (!upcoming || !doctor) {
    return (
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Upcoming Appointment</h3>
        </div>
        <div className="bg-white rounded-3xl p-5 shadow-card text-center text-slate-500">No upcoming appointments</div>
      </section>
    );
  }

  const dateObj = new Date(upcoming.date);
  const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isVideo = upcoming.type === 'Video';
  const docInitials = doctor.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).replace('D', ''); // Crude initals removing 'D' for Dr.

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Upcoming Appointment</h3>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Soon</span>
      </div>
      
      <Link href="/appointments" className="block">
        <motion.div whileTap={{ scale: 0.98 }} className="bg-white rounded-3xl p-5 shadow-card relative overflow-hidden group cursor-pointer hover:shadow-float transition-all border border-slate-100">
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
              {doctor.image_url ? (
                <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white font-bold text-lg">
                  {docInitials}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-bold text-slate-900 truncate">{doctor.name}</h4>
              <p className="text-sm text-slate-500 font-medium">{doctor.specialty} • {doctor.hospital_name}</p>
              <div className="flex items-center gap-1.5 mt-2 text-[13px] font-bold text-slate-600 bg-slate-100 w-fit px-2.5 py-1 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {dateObj.toLocaleDateString()}, {timeString}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 relative z-10">
            <button className={`flex-1 ${isVideo ? 'bg-primary text-white' : 'bg-slate-900 text-white'} py-2.5 rounded-full font-bold text-sm shadow-float hover:opacity-90 transition-colors flex items-center justify-center gap-2`}>
              {isVideo ? <Video className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              {isVideo ? 'Join Call' : 'Details'}
            </button>
          </div>
        </motion.div>
      </Link>
    </section>
  );
}
