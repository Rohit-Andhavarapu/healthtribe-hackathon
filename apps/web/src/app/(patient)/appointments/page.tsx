"use client";

import * as React from "react";
import Image from "next/image";
import { PageContainer, SectionHeader } from "@/components/shared/layout";
import { InfoCard } from "@/components/shared/cards";
import { CalendarClock, Video, MapPin, CheckCircle, Clock } from "lucide-react";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { useDoctors } from "@/features/doctors/hooks/useDoctors";
import { AppointmentResponse, DoctorResponse } from "@healthtribe/api-client";

export default function AppointmentsPage() {
  const { data: appointments = [], isLoading: apptsLoading } = useAppointments();
  const { data: doctors = [], isLoading: docsLoading } = useDoctors();
  
  const isLoading = apptsLoading || docsLoading;

  const upcoming = appointments.filter((app: AppointmentResponse) => app.status === "Upcoming" || app.status === "Scheduled");
  const past = appointments.filter((app: AppointmentResponse) => app.status !== "Upcoming" && app.status !== "Scheduled");

  const getDoctor = (id: string) => {
    const doc = doctors.find((d: DoctorResponse) => d.id === id);
    return doc || { name: `Dr. ${id.substring(0,6)}`, image_url: null };
  };

  const getAvatarUrl = (doc: { image_url?: string | null, name?: string }) => {
    if (doc.image_url) return doc.image_url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name || 'Doctor')}&background=random`;
  };

  return (
    <PageContainer className="pb-10">
      <div className="pt-2 mb-8">
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Appointments</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your upcoming visits and past consultations.</p>
      </div>

      <section className="mb-10">
        <SectionHeader title="Upcoming" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="text-slate-500 py-4 text-center md:col-span-2 lg:col-span-3">Loading appointments...</div>
          ) : upcoming.length === 0 ? (
            <div className="text-slate-500 py-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 w-full md:col-span-2 lg:col-span-3">No upcoming appointments.</div>
          ) : (
            upcoming.map((app: AppointmentResponse) => {
              const doctor = getDoctor(app.doctor_id);
              return (
                <InfoCard key={app.id} hover className="flex flex-col p-5 border-l-4 border-l-primary h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-primary/10 text-primary p-2.5 rounded-xl">
                      <CalendarClock className="w-5 h-5" />
                    </div>
                    <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Upcoming
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{app.type || "Consultation"}</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1 mb-4">{new Date(app.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  
                  <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                        <Image 
                          src={getAvatarUrl(doctor)} 
                          alt="Doctor" 
                          width={48} 
                          height={48} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{doctor.name}</span>
                    </div>
                    {app.type?.toLowerCase() === 'video' && (app as any).meet_link && (
                      <a href={(app as any).meet_link} target="_blank" rel="noreferrer" className="mt-1 block w-full text-center py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-semibold transition-colors border border-indigo-100">
                        Join Video Call
                      </a>
                    )}
                  </div>
                </InfoCard>
              );
            })
          )}
        </div>
      </section>

      <section>
        <SectionHeader title="Past Consultations" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="text-slate-500 py-4 text-center md:col-span-2 lg:col-span-3">Loading appointments...</div>
          ) : past.length === 0 ? (
            <div className="text-slate-500 py-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 w-full md:col-span-2 lg:col-span-3">No past appointments found.</div>
          ) : (
            past.map((app: AppointmentResponse) => {
              const doctor = getDoctor(app.doctor_id);
              return (
                <InfoCard key={app.id} hover className="flex flex-col p-4 opacity-75 h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-slate-100 text-slate-500 p-2 rounded-xl">
                      {app.type === 'Video' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    </div>
                    <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {app.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-md">{app.type || "Consultation"}</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1 mb-3">{new Date(app.date).toLocaleDateString()}</p>
                  
                  <div className="mt-auto pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-600">{doctor.name}</span>
                  </div>
                </InfoCard>
              );
            })
          )}
        </div>
      </section>
    </PageContainer>
  );
}
