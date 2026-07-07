'use client';

import { useAppointments } from '@/features/appointments/hooks/useAppointments';
import { Card, CardContent } from '@healthtribe/ui';
import { Loader2, Users, FileText, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';
import { useUserRole } from '@/features/auth/hooks/useUserRole';

export default function PatientsDirectory() {
  const { data: roleData, isLoading: roleLoading } = useUserRole();
  const { data: appointments, isLoading: apptsLoading } = useAppointments();
  
  if (roleLoading || apptsLoading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  // Extract unique patients from appointments
  const uniquePatientsMap = new Map<string, string>();
  appointments?.forEach(a => {
    if (!uniquePatientsMap.has(a.patient_id)) {
      uniquePatientsMap.set(a.patient_id, a.patient_name || '');
    }
  });
  const uniquePatients = Array.from(uniquePatientsMap.entries());

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Patients Directory</h1>
        <p className="text-slate-500 mt-2">View all patients you have consulted with.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniquePatients.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No patients found</h3>
            <p className="text-slate-500 mt-1">You don&apos;t have any patients in your directory yet.</p>
          </div>
        ) : (
          uniquePatients.map(([patientId, patientName]) => (
            <Card key={patientId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{patientName || `Patient #${patientId.substring(0, 8)}`}</h3>
                      <p className="text-sm text-slate-500">ID: {patientId.substring(0, 8)}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Link href={`/patients/${patientId}`} className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors">
                    <FileText className="w-4 h-4" />
                    View Profile
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
