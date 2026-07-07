"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, CheckCircle2, MapPin, Calendar } from "lucide-react";
import Image from "next/image";
import { Doctor } from "../types";
import { useCreateAppointment } from "../../appointments/hooks/useCreateAppointment";
import { useDoctorAvailability } from "../hooks/useDoctorAvailability";
import { Loader2 } from "lucide-react";

interface BookingOverlayProps {
  doctor: Doctor | null;
  onClose: () => void;
}

export function BookingOverlay({ doctor, onClose }: BookingOverlayProps) {
  const [step, setStep] = React.useState<"slots" | "type" | "confirm" | "success">("slots");
  
  const [selectedDateIndex, setSelectedDateIndex] = React.useState(0);
  const [selectedTimeIndex, setSelectedTimeIndex] = React.useState(0);
  const [appointmentType, setAppointmentType] = React.useState<"In-Person" | "Video Consultation">("In-Person");
  
  const { data: availabilityData, isLoading } = useDoctorAvailability(doctor?.id ? String(doctor.id) : undefined);
  
  const dates = React.useMemo(() => {
    if (!availabilityData) return [];
    // Extract unique dates preserving order
    const unique = [];
    const seen = new Set();
    for (const item of availabilityData) {
      if (!seen.has(item.isoDate)) {
        seen.add(item.isoDate);
        // parse the date and format it safely
        const dateObj = new Date(item.isoDate);
        unique.push({
          isoDate: item.isoDate,
          display: item.display,
          dayNumber: dateObj.getDate().toString()
        });
      }
    }
    return unique;
  }, [availabilityData]);
  
  const times = React.useMemo(() => {
    if (!availabilityData || dates.length === 0) return [];
    const currentIsoDate = dates[selectedDateIndex]?.isoDate;
    return availabilityData.filter(a => a.isoDate === currentIsoDate).map(a => a.time);
  }, [availabilityData, dates, selectedDateIndex]);
  
  const { mutateAsync: createAppointment, isPending } = useCreateAppointment();

  // Reset step when doctor changes
  React.useEffect(() => {
    if (doctor) {
      setTimeout(() => setStep("slots"), 0);
      setSelectedDateIndex(0);
      setSelectedTimeIndex(0);
    }
  }, [doctor]);

  // Reset time index when date changes
  React.useEffect(() => {
    setSelectedTimeIndex(0);
  }, [selectedDateIndex]);

  if (!doctor) return null;

  const imageUrl = doctor.image_url || "https://images.unsplash.com/photo-1612349317150-e410f624c4a5?q=80&w=256&auto=format&fit=crop";
  const selectedDateLabel = dates[selectedDateIndex]?.display || "";
  const selectedDateValue = dates[selectedDateIndex]?.isoDate || "";
  const selectedTimeLabel = times[selectedTimeIndex] || "";

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 bg-background z-50 flex flex-col h-screen"
      >
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-4 flex items-center gap-4 sticky top-0 z-10 pt-safe">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => {
            if (step === "confirm") setStep("type");
            else if (step === "type") setStep("slots");
            else onClose();
          }} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </motion.button>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {step === "slots" ? "Book Appointment" : step === "type" ? "Consultation Type" : step === "confirm" ? "Confirm Details" : "Success"}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-md mx-auto w-full space-y-8">
          {step !== "success" && (
            <div className="bg-white rounded-[24px] p-5 shadow-card border border-slate-100 flex items-center gap-5">
              <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden bg-slate-100 relative shrink-0">
                <Image src={imageUrl} alt={doctor.name} fill sizes="72px" className="object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{doctor.name}</h3>
                <p className="text-[14px] text-slate-500 font-medium">{doctor.specialty} • {doctor.hospital_name}</p>
              </div>
            </div>
          )}

          {step === "slots" && isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {step === "slots" && !isLoading && (
            <div className="space-y-8">
              <div>
                <h3 className="font-bold text-slate-900 text-[17px] tracking-tight mb-4">Select Date</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 snap-x">
                  {dates.map((d, i) => (
                    <motion.button 
                      whileTap={{ scale: 0.95 }} 
                      key={d.isoDate} 
                      onClick={() => setSelectedDateIndex(i)}
                      className={`snap-start min-w-[76px] p-4 rounded-[20px] text-center border transition-all ${i === selectedDateIndex ? 'bg-primary text-white border-primary shadow-float' : 'bg-white border-slate-200/60 text-slate-700 hover:border-primary/30 shadow-sm'}`}>
                      <p className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-1">
                        {d.display === "Today" || d.display === "Tomorrow" ? "" : d.display.split(',')[0]}
                      </p>
                      <p className={`font-bold ${d.display === "Today" || d.display === "Tomorrow" ? "text-lg" : "text-xl"}`}>
                        {d.display === "Today" || d.display === "Tomorrow" ? d.display : d.dayNumber}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-[17px] tracking-tight mb-4">Select Time</h3>
                {times.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {times.map((t, i) => (
                      <motion.button 
                        whileTap={{ scale: 0.95 }} 
                        key={t} 
                        onClick={() => setSelectedTimeIndex(i)}
                        className={`p-3.5 rounded-[16px] text-[13px] font-bold border transition-all ${i === selectedTimeIndex ? 'bg-primary text-white border-primary shadow-float' : 'bg-white border-slate-200/60 text-slate-700 hover:border-primary/30 shadow-sm'}`}>
                        {t}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No available slots for this date.</p>
                )}
              </div>
              <div className="pt-4 pb-safe">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("type")}
                  disabled={times.length === 0}
                  className="w-full bg-primary text-white py-4 rounded-full font-bold shadow-float hover:bg-primary/90 transition-all text-[15px] disabled:opacity-50"
                >
                  Continue
                </motion.button>
              </div>
            </div>
          )}

          {step === "type" && (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-900 text-[17px] tracking-tight mb-4">How would you like to consult?</h3>
              <div className="grid grid-cols-1 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAppointmentType("In-Person")}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${appointmentType === "In-Person" ? 'border-primary bg-primary-light/10 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${appointmentType === "In-Person" ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <MapPin className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-lg text-slate-900">In-Person Visit</h4>
                    </div>
                    {appointmentType === "In-Person" && <CheckCircle2 className="w-6 h-6 text-primary" />}
                  </div>
                  <p className="text-slate-500 text-sm mt-2 ml-[60px]">Visit the doctor at their clinic or hospital.</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setAppointmentType("Video Consultation")}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${appointmentType === "Video Consultation" ? 'border-primary bg-primary-light/10 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${appointmentType === "Video Consultation" ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
                      </div>
                      <h4 className="font-bold text-lg text-slate-900">Video Consultation</h4>
                    </div>
                    {appointmentType === "Video Consultation" && <CheckCircle2 className="w-6 h-6 text-primary" />}
                  </div>
                  <p className="text-slate-500 text-sm mt-2 ml-[60px]">Consult with the doctor remotely via a secure video link.</p>
                </motion.button>
              </div>
              <div className="pt-8 pb-safe">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("confirm")}
                  className="w-full bg-primary text-white py-4 rounded-full font-bold shadow-float hover:bg-primary/90 transition-all text-[15px]"
                >
                  Continue
                </motion.button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-8">
              <div className="bg-white rounded-[24px] p-6 shadow-card border border-slate-100 space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100/80 pb-5">
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Calendar className="w-5 h-5 text-slate-400" /> Date & Time
                  </div>
                  <span className="font-bold text-slate-900">{selectedDateLabel} • {selectedTimeLabel}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100/80 pb-5">
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <MapPin className="w-5 h-5 text-slate-400" /> Type
                  </div>
                  <span className="font-bold text-primary bg-primary-light px-3 py-1.5 rounded-lg text-sm">{appointmentType}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 font-medium">Consultation Fee</span>
                  <span className="font-bold text-2xl tracking-tight text-slate-900">{doctor.consultation_fee || "—"}</span>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  try {
                    await createAppointment({
                      doctor_id: String(doctor.id),
                      date: selectedDateValue,
                      time: selectedTimeLabel,
                      type: appointmentType
                    });
                    setStep("success");
                  } catch (e) {
                    console.error("Booking failed", e);
                  }
                }}
                disabled={isPending}
                className="w-full bg-primary text-white py-4 rounded-full font-bold shadow-float hover:bg-primary/90 transition-all text-[15px] disabled:opacity-50"
              >
                {isPending ? "Booking..." : "Confirm Booking"}
              </motion.button>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center text-center py-12 h-full">
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-sm"
              >
                <CheckCircle2 className="w-12 h-12" strokeWidth={2.5} />
              </motion.div>
              <h2 className="text-[28px] font-bold text-slate-900 tracking-tight mb-3">Confirmed!</h2>
              <p className="text-slate-500 font-medium mb-12 text-[15px] leading-relaxed max-w-[260px]">
                Your appointment with <span className="text-slate-900 font-bold">{doctor.name}</span> is set for {selectedDateLabel} at {selectedTimeLabel}.
              </p>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full bg-slate-900 text-white py-4 rounded-full font-bold shadow-float hover:bg-slate-800 transition-all text-[15px]"
              >
                Back to Directory
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
