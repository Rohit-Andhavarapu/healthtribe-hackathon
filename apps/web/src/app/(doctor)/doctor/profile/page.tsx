'use client';

import React from 'react';
import { useDoctorProfile } from '@/features/doctors/hooks/useDoctorProfile';
import { useAppointments } from '@/features/appointments/hooks/useAppointments';
import { 
  User, 
  MapPin, 
  Star, 
  Award, 
  Calendar, 
  Clock, 
  Users, 
  Activity,
  BriefcaseMedical,
  Stethoscope,
  Globe
} from 'lucide-react';
import Image from 'next/image';

export default function DoctorProfilePage() {
  const { data: profile, isLoading, error } = useDoctorProfile();
  const { data: appointments = [], isLoading: isLoadingAppointments } = useAppointments();

  if (isLoading || isLoadingAppointments) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl m-8">
        Failed to load doctor profile.
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter((a: unknown) => (a as {date: string}).date === today);
  const totalPatients = new Set(appointments.map((a: unknown) => (a as {patient_id: string}).patient_id)).size;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Doctor Profile</h1>
          <p className="text-slate-500 mt-2">Manage your professional identity and clinical statistics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Main Identity */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md absolute -top-12 left-6 overflow-hidden flex items-center justify-center">
                {profile.image_url ? (
                  <Image src={profile.image_url} alt={profile.name} fill className="object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <div className="pt-16">
                <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
                <div className="flex items-center text-indigo-600 font-medium mt-1">
                  <Stethoscope className="w-4 h-4 mr-1.5" />
                  {profile.specialty}
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center text-slate-600">
                    <MapPin className="w-4 h-4 mr-3 text-slate-400" />
                    <span className="text-sm">{profile.hospital_name || 'HealthTribe Network'}</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Award className="w-4 h-4 mr-3 text-slate-400" />
                    <span className="text-sm">License: {profile.license_ref}</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <BriefcaseMedical className="w-4 h-4 mr-3 text-slate-400" />
                    <span className="text-sm">{profile.experience} Experience</span>
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Globe className="w-4 h-4 mr-3 text-slate-400" />
                    <span className="text-sm">{profile.languages || 'English'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats and Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-500">Today&apos;s Queue</h3>
                <Calendar className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{todaysAppointments.length}</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-500">Total Patients</h3>
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{totalPatients}</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-500">Rating</h3>
                <Star className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{profile.rating}</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-slate-500">Consultation</h3>
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">{profile.consultation_fee || '$0'}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Availability Schedule</h3>
            <div className="flex items-start text-slate-600">
              <Clock className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">{profile.availability || 'Standard Hours'}</p>
                <p className="text-sm mt-1">This determines when patients can book appointments with you through the HealthTribe platform.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
             <h3 className="text-lg font-semibold text-slate-900 mb-4">Professional Bio</h3>
             <p className="text-slate-600 text-sm leading-relaxed">
               {profile.name} is a highly regarded {profile.specialty} working at {profile.hospital_name || 'the HealthTribe Network'}. 
               With {profile.experience} of dedicated practice, they have helped numerous patients achieve better health outcomes. 
               They maintain a stellar rating of {profile.rating}/5 from patient reviews.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}
