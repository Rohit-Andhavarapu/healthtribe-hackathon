import React, { useMemo } from 'react';
import { Heart, Activity, Calendar, Pill, Shield, Stethoscope } from 'lucide-react';
import { AIMessage } from '../useAIChat';
import { useAppointments } from '../../appointments/hooks/useAppointments';
import { useDoctors } from '../../doctors/hooks/useDoctors';
import { useProfile } from '../../profile/hooks/useProfile';
import { AppointmentResponse, DoctorResponse } from '@healthtribe/api-client';

export function ContextPanel({ messages }: { messages: AIMessage[] }) {
  const { data: appointments = [] } = useAppointments();
  const { data: doctors = [] } = useDoctors();
  const { data: profile } = useProfile();

  const upcomingAppt = useMemo(() => {
    return appointments.find((a: AppointmentResponse) => new Date(a.date) > new Date() && (a.status === 'Upcoming' || a.status === 'Scheduled'));
  }, [appointments]);

  const upcomingDoctor = useMemo(() => {
    return upcomingAppt ? doctors.find((d: DoctorResponse) => d.id === upcomingAppt.doctor_id) : null;
  }, [upcomingAppt, doctors]);

  const topic = useMemo(() => {
    if (!messages.length) return 'general';
    const allText = messages.map(m => m.content).join(' ').toLowerCase();
    
    if (allText.includes('heart') || allText.includes('cardio') || allText.includes('chest pain') || allText.includes('ecg')) {
      return 'cardiology';
    }
    if (allText.includes('diabetes') || allText.includes('hba1c') || allText.includes('sugar') || allText.includes('insulin')) {
      return 'diabetes';
    }
    return 'general';
  }, [messages]);

  const renderCardiologyContext = () => (
    <div className="space-y-4">
      <div onClick={() => alert("Viewing ECG Report")} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-purple-300 transition-colors">
        <div className="flex items-center gap-2 mb-2 text-rose-600 dark:text-rose-400">
          <Heart className="w-5 h-5" />
          <h3 className="font-semibold text-sm">Heart Health</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Recent ECG shows normal sinus rhythm. Next checkup due in 3 months.</p>
      </div>
      
      <div onClick={() => alert("Viewing Doctor Profile")} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-purple-300 transition-colors">
        <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
          <Stethoscope className="w-5 h-5" />
          <h3 className="font-semibold text-sm">Cardiologist</h3>
        </div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Dr. Sarah Jenkins</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">City General Hospital</p>
      </div>

      <div onClick={() => alert("Viewing Medication Details")} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-purple-300 transition-colors">
        <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
          <Pill className="w-5 h-5" />
          <h3 className="font-semibold text-sm">Heart Medication</h3>
        </div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Atorvastatin 20mg</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">1 pill daily at bedtime</p>
      </div>
    </div>
  );

  const renderDiabetesContext = () => (
    <div className="space-y-4">
      <div onClick={() => alert("Viewing Lab Trends")} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-purple-300 transition-colors">
        <div className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-400">
          <Activity className="w-5 h-5" />
          <h3 className="font-semibold text-sm">HbA1c Trend</h3>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">6.2%</div>
        <p className="text-xs text-green-600 mt-1">↓ 0.3% from last month</p>
      </div>
      
      <div onClick={() => alert("Viewing Medication Details")} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-purple-300 transition-colors">
        <div className="flex items-center gap-2 mb-2 text-purple-600 dark:text-purple-400">
          <Pill className="w-5 h-5" />
          <h3 className="font-semibold text-sm">Diabetes Medication</h3>
        </div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Metformin 500mg</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Twice daily with meals</p>
      </div>
    </div>
  );

  const renderGeneralContext = () => (
    <div className="space-y-4">
      <div onClick={() => alert("Viewing Health Profile")} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl cursor-pointer hover:ring-1 hover:ring-purple-300 transition-all">
        <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
          <Activity className="w-5 h-5" />
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">Health Score</h3>
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{((profile?.demographics as Record<string, unknown>)?.health_score as number) || 85}/100</div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Excellent condition</p>
      </div>
      
      <div onClick={() => upcomingAppt && alert("Viewing Appointment Details")} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-purple-300 transition-colors">
        <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
          <Calendar className="w-5 h-5" />
          <h3 className="font-semibold text-sm">Upcoming Appointment</h3>
        </div>
        {upcomingAppt ? (
          <>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{upcomingDoctor?.name || 'Doctor'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(upcomingAppt.date).toLocaleDateString()} • {upcomingAppt.time || 'TBD'}</p>
          </>
        ) : (
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">No appointments</p>
        )}
      </div>
      
      <div onClick={() => alert("Viewing Insurance Details")} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer hover:border-purple-300 transition-colors">
        <div className="flex items-center gap-2 mb-2 text-slate-600 dark:text-slate-400">
          <Shield className="w-5 h-5" />
          <h3 className="font-semibold text-sm">Insurance</h3>
        </div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{(profile?.demographics as Record<string, unknown>)?.insurance_provider as string || 'BlueCross Silver'}</p>
        <p className="text-xs text-green-600 mt-1">Active</p>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-900/50 border-l border-slate-200 dark:border-slate-800 overflow-y-auto hidden lg:flex lg:flex-col lg:w-[22%] shrink-0 p-4 md:p-6">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
        Smart Context
      </h2>
      
      {topic === 'cardiology' && renderCardiologyContext()}
      {topic === 'diabetes' && renderDiabetesContext()}
      {topic === 'general' && renderGeneralContext()}
      
      <div className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          Quick Actions
        </h2>
        <div className="space-y-2">
          <button onClick={() => alert('Refill request initiated.')} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm">
            Request Refill
          </button>
          <button onClick={() => alert('Contacting clinic...')} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm">
            Contact Clinic
          </button>
          <button onClick={() => alert('Opening share records modal...')} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm">
            Share Records
          </button>
        </div>
      </div>
    </div>
  );
}
