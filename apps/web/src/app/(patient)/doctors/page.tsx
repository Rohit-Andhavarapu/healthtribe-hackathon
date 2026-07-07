"use client";

import * as React from "react";
import { PageContainer } from "@/components/shared/layout";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { Doctor } from "@/features/doctors/types";
import { DoctorCard, DoctorFeaturedCard, BookingOverlay } from "@/features/doctors/components";

import { useDoctors } from "@/features/doctors/hooks/useDoctors";

// We keep SPECIALTIES to populate the category chips
const SPECIALTIES = ["General", "Cardiologist", "Dentist", "Neurologist", "Pediatrician"];

export default function DoctorsPage() {
  const [activeSpec, setActiveSpec] = React.useState("General");
  const [selectedDoctor, setSelectedDoctor] = React.useState<Doctor | null>(null);
  
  const { data: doctors = [], isLoading } = useDoctors(activeSpec);

  return (
    <>
      <PageContainer className="space-y-8 pb-10">
        {/* Header & Search */}
        <div className="pt-2 space-y-6">
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Find a Doctor</h1>
            <p className="text-slate-500 font-medium mt-1">Book an appointment easily.</p>
          </div>
          
          <div className="relative shadow-sm rounded-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={2.5} />
            <input 
              type="text" 
              placeholder="Search doctors, specialties..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200/60 rounded-2xl text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Specialty Categories */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Categories</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x">
            {SPECIALTIES.map(spec => (
              <motion.button
                whileTap={{ scale: 0.95 }}
                key={spec}
                onClick={() => setActiveSpec(spec)}
                className={`snap-start whitespace-nowrap px-5 py-3 rounded-[16px] font-bold text-[14px] transition-all shadow-sm ${
                  activeSpec === spec 
                    ? "bg-slate-900 text-white shadow-float" 
                    : "bg-white text-slate-600 border border-slate-200/60 hover:border-slate-300"
                }`}
              >
                {spec}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Featured Doctors */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Best Doctors</h3>
          </div>
          <div className="flex lg:grid lg:grid-cols-3 gap-4 overflow-x-auto lg:overflow-x-visible pb-6 lg:pb-0 -mx-4 lg:mx-0 px-4 lg:px-0 snap-x lg:snap-none">
            {isLoading ? (
              <div className="w-full text-center py-4 text-slate-500 lg:col-span-3">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="w-full text-center py-4 text-slate-500 lg:col-span-3">No doctors found for this specialty.</div>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              doctors.slice(0, 3).map((doc: any) => (
                <DoctorFeaturedCard 
                  key={doc.id} 
                  doctor={doc as Doctor} 
                  onClick={setSelectedDoctor} 
                />
              ))
            )}
          </div>
        </section>

        {/* Doctor List */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Nearby</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
            {isLoading ? (
              <div className="text-center py-4 text-slate-500 md:col-span-2 lg:col-span-3">Loading...</div>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              doctors.map((doc: any) => (
                <DoctorCard 
                  key={doc.id} 
                  doctor={doc as Doctor} 
                  onClick={setSelectedDoctor} 
                />
              ))
            )}
          </div>
        </section>
      </PageContainer>

      {/* Booking Overlay */}
      <BookingOverlay 
        doctor={selectedDoctor} 
        onClose={() => setSelectedDoctor(null)} 
      />
    </>
  );
}

