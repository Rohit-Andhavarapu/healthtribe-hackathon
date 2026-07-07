import React from 'react';
import { Calendar, User, Pill, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function ActionCard({ children, title, icon: Icon, className = '' }: { children: React.ReactNode, title: string, icon?: React.ElementType, className?: string }) {
  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm my-3 ${className}`}>
      <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{title}</span>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

export function DoctorCard({ doctor, onBook }: { doctor: Record<string, unknown>, onBook?: () => void }) {
  return (
    <ActionCard title="Available Doctor" icon={User}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="font-medium text-slate-900 dark:text-slate-100">{String(doctor.name)}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{String(doctor.specialty)} • {String(doctor.hospital)}</p>
          <div className="mt-2 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md inline-block">
            {String(doctor.availability || 'Available')}
          </div>
        </div>
        {onBook && (
          <button 
            onClick={onBook}
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Book Appointment
          </button>
        )}
      </div>
    </ActionCard>
  );
}

export function AppointmentCard({ appointment }: { appointment: Record<string, unknown> }) {
  return (
    <ActionCard title="Appointment Booked" icon={CheckCircle2} className="border-green-200 dark:border-green-900/50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
          <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h4 className="font-medium text-slate-900 dark:text-slate-100">Confirmed with {String(appointment.doctor)}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{String(appointment.date)} • {String(appointment.type || 'In-Person')}</p>
        </div>
      </div>
    </ActionCard>
  );
}

export function MedicationCard({ medication }: { medication: Record<string, unknown> }) {
  return (
    <ActionCard title="Medication" icon={Pill}>
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium text-slate-900 dark:text-slate-100">{String(medication.name)}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{String(medication.dosage)} • {String(medication.frequency)}</p>
        </div>
      </div>
    </ActionCard>
  );
}

export function LabCard({ lab }: { lab: Record<string, unknown> }) {
  return (
    <ActionCard title="Lab Report" icon={FileText}>
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium text-slate-900 dark:text-slate-100">{String(lab.title)}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{String(lab.date)}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          lab.status === 'Completed' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
        }`}>
          {String(lab.status)}
        </span>
      </div>
    </ActionCard>
  );
}

export function NavigationCard({ target, label }: { target: string, label?: string }) {
  return (
    <Link href={target} className="block mt-2">
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 flex justify-between items-center hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors group">
        <span className="font-medium text-purple-900 dark:text-purple-100">
          {label || `Open ${target.replace('/', '')}`}
        </span>
        <ArrowRight className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
