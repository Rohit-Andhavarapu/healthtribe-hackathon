'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { usePatientProfileById } from '@/features/profile/hooks/usePatientProfileById';
import { useTimeline } from '@/features/timeline/hooks/useTimeline';
import { usePatientMedications } from '@/features/clinical/hooks/usePatientMedications';
import { usePatientLabOrders } from '@/features/clinical/hooks/usePatientLabOrders';
import { useAppointments } from '@/features/appointments/hooks/useAppointments';
import { Card, CardContent, CardHeader, CardTitle } from '@healthtribe/ui';
import { Loader2, User, FileText, Stethoscope, Pill, FlaskConical, Shield, CheckCircle, Calendar, Clock, AlertCircle } from 'lucide-react';
import { TimelineContainer } from '@/features/timeline/components/TimelineContainer';
import { UploadLabModal } from '@/features/labs/components/UploadLabModal';
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function ConsultationWorkspace() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const patientId = params.id as string;
  const appointmentId = searchParams.get('appointmentId');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [abhaIdentity, setAbhaIdentity] = useState<any>(null);
  const [loadingAbha, setLoadingAbha] = useState(true);
  
  const { data: profile, isLoading: isProfileLoading } = usePatientProfileById(patientId);
  const { data: timelineEvents, isLoading: isTimelineLoading } = useTimeline({
    searchQuery: '',
    selectedType: null,
    selectedStatus: null,
    patientId
  });
  const { data: medications, isLoading: isMedicationsLoading } = usePatientMedications(patientId);
  const { data: labOrders, isLoading: isLabOrdersLoading } = usePatientLabOrders(patientId);
  const { data: appointments, isLoading: isAppointmentsLoading } = useAppointments();

  // Fetch ABHA identity for this patient
  useState(() => {
    const fetchAbha = async () => {
      try {
        const token = await getToken();
        const resp = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/abha/identity/${patientId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (resp.ok) {
          const data = await resp.json();
          setAbhaIdentity(data);
        }
      } catch (error) {
        console.log('No ABHA identity found for patient');
      } finally {
        setLoadingAbha(false);
      }
    };
    fetchAbha();
  });

  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-full pt-10">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const name = String(profile?.demographics?.name || 'Unknown Patient');
  const age = String(profile?.demographics?.age ?? 'N/A');
  const gender = String(profile?.demographics?.gender || 'N/A');
  const bloodType = String(profile?.demographics?.bloodType || profile?.demographics?.blood_group || 'N/A');

  // Get patient appointments
  const patientAppointments = appointments?.filter((a: any) => a.patient_id === patientId) || [];
  const upcomingAppointments = patientAppointments.filter((a: any) => 
    new Date(a.date) >= new Date() && a.status !== 'CANCELLED' && a.status !== 'COMPLETED'
  );
  const pastAppointments = patientAppointments.filter((a: any) => 
    a.status === 'COMPLETED' || new Date(a.date) < new Date()
  ).slice(0, 5);

  // Count imported records
  const importedRecords = timelineEvents?.filter((e: any) => e.type?.startsWith('imported_')) || [];
  const aiSummaries = timelineEvents?.filter((e: any) => e.type === 'ai_summary' || e.type === 'AI_SUMMARY') || [];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-slate-500">Patient Details & Medical History</p>
            {!loadingAbha && abhaIdentity && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200">
                <Shield className="w-3.5 h-3.5" />
                ABHA Verified
              </span>
            )}
          </div>
        </div>
        <div className="space-x-4">
          <button 
            onClick={() => {
              if (appointmentId) {
                router.push(`/consultation/${appointmentId}`);
              } else {
                alert('No active appointment ID available to start consultation.');
              }
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Stethoscope className="w-4 h-4" />
            Start Consultation
          </button>
        </div>
      </div>

      {/* ABHA Status Banner */}
      {!loadingAbha && abhaIdentity && importedRecords.length > 0 && (
        <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-900 mb-1">ABHA Records Available</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-emerald-600 font-medium">ABHA Number</p>
                    <p className="text-emerald-900 font-semibold">{abhaIdentity.abha_number}</p>
                  </div>
                  <div>
                    <p className="text-emerald-600 font-medium">Imported Records</p>
                    <p className="text-emerald-900 font-semibold">{importedRecords.length} records</p>
                  </div>
                  <div>
                    <p className="text-emerald-600 font-medium">Linked Date</p>
                    <p className="text-emerald-900 font-semibold">
                      {abhaIdentity.linked_at ? new Date(abhaIdentity.linked_at).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                  <div>
                    <p className="text-emerald-600 font-medium">AI Summaries</p>
                    <p className="text-emerald-900 font-semibold">{aiSummaries.length} generated</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loadingAbha && !abhaIdentity && (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">No ABHA Linked</h3>
                <p className="text-sm text-amber-700">This patient hasn't linked their ABHA identity. External hospital records are not available.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Demographics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div className="grid grid-cols-2">
                  <dt className="text-sm text-slate-500">Age</dt>
                  <dd className="text-sm font-medium text-slate-900">{age} {age !== 'N/A' ? 'years' : ''}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="text-sm text-slate-500">Gender</dt>
                  <dd className="text-sm font-medium text-slate-900">{gender}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="text-sm text-slate-500">Blood Type</dt>
                  <dd className="text-sm font-medium text-slate-900">{bloodType}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Appointments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAppointmentsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upcoming</h4>
                      <div className="space-y-2">
                        {upcomingAppointments.map((apt: any) => (
                          <div key={apt.id} className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                            <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium mb-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(apt.date).toLocaleDateString()}
                            </div>
                            <p className="text-sm font-semibold text-indigo-900">{apt.type || 'Consultation'}</p>
                            <p className="text-xs text-indigo-600 mt-1">{apt.status}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {pastAppointments.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recent</h4>
                      <div className="space-y-2">
                        {pastAppointments.map((apt: any) => (
                          <div key={apt.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(apt.date).toLocaleDateString()}
                            </div>
                            <p className="text-sm font-medium text-slate-700">{apt.type || 'Consultation'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {upcomingAppointments.length === 0 && pastAppointments.length === 0 && (
                    <p className="text-sm text-slate-500 italic">No appointments recorded.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                Active Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isMedicationsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
              ) : !Array.isArray(medications) || medications.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No active medications.</p>
              ) : (
                <ul className="space-y-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {medications.filter((m: any) => m.status === 'ACTIVE').map((med: any) => (
                    <li key={med.id} className="border-b border-slate-100 pb-2 last:border-0">
                      <p className="font-medium text-sm text-slate-900">{med.name} {med.dosage}</p>
                      <p className="text-xs text-slate-500">{med.frequency} • {med.duration}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-amber-600" />
                Recent Lab Orders
              </CardTitle>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Upload Report
              </button>
            </CardHeader>
            <CardContent>
              {isLabOrdersLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
              ) : !Array.isArray(labOrders) || labOrders.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No lab orders.</p>
              ) : (
                <ul className="space-y-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {labOrders.map((lab: any) => (
                    <li key={lab.id} className="border-b border-slate-100 pb-2 last:border-0 flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm text-slate-900">{lab.test_name}</p>
                        <p className="text-xs text-slate-500">Priority: {lab.priority}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-600">
                        {lab.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-6">
          <Card className="h-full border-none shadow-sm bg-white/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Clinical Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isTimelineLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : (
                <div className="max-h-[800px] overflow-y-auto pr-4">
                  <TimelineContainer patientId={patientId} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <UploadLabModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} patientId={patientId} />
    </div>
  );
}
