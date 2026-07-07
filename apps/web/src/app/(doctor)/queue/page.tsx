'use client';

import React, { useState } from 'react';
import { useAppointments } from '@/features/appointments/hooks/useAppointments';
import { useClinicalAnalytics } from '@/features/appointments/hooks/useClinicalAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@healthtribe/ui';
import { Loader2, Calendar, User, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

type TabType = 'Today' | 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';

export default function DoctorQueue() {
  const { data: appointments, isLoading } = useAppointments();
  const { data: analytics } = useClinicalAnalytics();
  const [activeTab, setActiveTab] = useState<TabType>('Today');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const today = new Date();
  
  const filteredAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.date);
    const isToday = aptDate.toDateString() === today.toDateString();
    
    switch (activeTab) {
      case 'Today':
        return isToday && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED';
      case 'Upcoming':
        return aptDate > today && !isToday && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED';
      case 'In Progress':
        return apt.status === 'IN_PROGRESS';
      case 'Completed':
        return apt.status === 'COMPLETED';
      case 'Cancelled':
        return apt.status === 'CANCELLED';
      default:
        return false;
    }
  }).sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime()) || [];

  const todayAppointments = appointments?.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.toDateString() === today.toDateString();
  }) || [];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Queue</h1>
          <p className="text-slate-500 mt-2">{format(today, 'EEEE, MMMM do, yyyy')}</p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(['Today', 'Upcoming', 'In Progress', 'Completed', 'Cancelled'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card className="border-dashed bg-slate-50/50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
                <Calendar className="w-12 h-12 mb-4 text-slate-300" />
                <p className="font-medium text-lg text-slate-700">No appointments</p>
                <p>No appointments match the selected filter.</p>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((apt, index) => (
              <Card key={apt.id} className="hover:border-indigo-200 transition-colors shadow-sm">
                <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`font-bold w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                      apt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                      apt.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                      'bg-indigo-50 text-indigo-700'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                        {apt.patient_name || `Patient #${apt.patient_id.substring(0, 8)}`}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {format(new Date(apt.date), 'MMM d, yyyy')}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {apt.time || '10:00 AM'}</span>
                        <span className="flex items-center gap-1 font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700"><FileText className="w-3.5 h-3.5" /> {apt.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 flex-wrap">
                    {apt.type?.toLowerCase() === 'video' && (apt as any).meet_link && (
                      <a href={(apt as any).meet_link} target="_blank" rel="noreferrer" className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors w-full md:w-auto text-center border border-emerald-200">
                        Join Meeting
                      </a>
                    )}
                    <Link href={`/patients/${apt.patient_id}?appointmentId=${apt.id}`} className="px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium transition-colors w-full md:w-auto text-center">
                      View Profile
                    </Link>
                    {apt.status === 'COMPLETED' ? (
                      <Link href={`/consultation/${apt.id}`} className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors w-full md:w-auto text-center">
                        View Consultation
                      </Link>
                      ) : apt.status === 'CANCELLED' ? (
                        null
                      ) : (
                        <div className="flex gap-2 w-full md:w-auto">
                          {apt.type?.toLowerCase() === 'video' && (apt as any).meet_link && (
                            <a href={(apt as any).meet_link} target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors w-full md:w-auto text-center border border-indigo-200">
                              Join Meeting
                            </a>
                          )}
                          {apt.status === 'IN_PROGRESS' ? (
                            <Link href={`/consultation/${apt.id}`} className="px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 rounded-lg text-sm font-medium transition-colors w-full md:w-auto text-center shadow-sm">
                              Resume
                            </Link>
                          ) : (
                            <Link href={`/consultation/${apt.id}`} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors w-full md:w-auto text-center shadow-sm">
                              Start
                            </Link>
                          )}
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Total Today</span>
                <span className="font-bold text-slate-900">{analytics?.today_total_appointments ?? todayAppointments.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Completed</span>
                <span className="font-bold text-emerald-600">
                  {analytics?.today_completed_appointments ?? todayAppointments.filter(a => a.status === 'COMPLETED').length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500">Pending</span>
                <span className="font-bold text-amber-600">
                  {todayAppointments.filter(a => a.status !== 'COMPLETED' && a.status !== 'CANCELLED').length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500">Avg Duration</span>
                <span className="font-bold text-indigo-600">
                  {analytics?.average_duration_mins ?? 0} mins
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
