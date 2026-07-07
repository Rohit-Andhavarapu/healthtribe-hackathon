'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePatientProfileById } from '@/features/profile/hooks/usePatientProfileById';
import { useAppointments } from '@/features/appointments/hooks/useAppointments';
import { useCompleteConsultation } from '@/features/appointments/hooks/useCompleteConsultation';
import { useConsultation } from '@/features/appointments/hooks/useConsultation';
import { Card, CardContent, CardHeader, CardTitle } from '@healthtribe/ui';
import { Loader2, User, FileText, Pill, FlaskConical, Stethoscope, CheckCircle, Bot, Plus, Trash2, Video, Database } from 'lucide-react';
import { useTimeline } from '@/features/timeline/hooks/useTimeline';
import { ImportedRecordCard } from '@/features/timeline/components/cards/ImportedRecordCard';
import { AISummaryCard } from '@/features/timeline/components/cards/AISummaryCard';

export default function ConsultationWorkspace() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;
  
  const { data: appointments, isLoading: isAppointmentsLoading } = useAppointments();
  
  const appointment = appointments?.find(a => a.id === appointmentId);
  const patientId = appointment?.patient_id;
  
  const { data: profile, isLoading: isProfileLoading } = usePatientProfileById(patientId || '');
  
  const { data: consultationData } = useConsultation(appointmentId);
  const { data: timelineEvents } = useTimeline({ patientId });
  
  const importedEvents = timelineEvents?.filter(e => e.type.startsWith('imported_') || e.type === 'ai_summary') || [];
  
  const { completeConsultation, isCompleting, error } = useCompleteConsultation();

  const [notes, setNotes] = useState('');
  
  const isCompleted = appointment?.status === 'COMPLETED';
  
  // Structured Medications
  const [medications, setMedications] = useState<{ name: string; dosage: string; frequency: string; duration: string; instructions: string }[]>([]);
  
  // Structured Labs
  const [labOrders, setLabOrders] = useState<{ test_name: string; priority: string; notes: string }[]>([]);
  
  // Initialize from consultation if available (e.g., if already completed)
  React.useEffect(() => {
    // eslint-disable-next-line
    if (consultationData) {
      if (consultationData.notes) setNotes(consultationData.notes);
      if (consultationData.medications?.length > 0) setMedications(consultationData.medications);
      if (consultationData.lab_orders?.length > 0) setLabOrders(consultationData.lab_orders);
    } else if (appointment?.notes) {
      // Fallback to appointment notes
      setNotes(appointment.notes);
    }
  }, [consultationData, appointment?.notes]);

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };
  
  const updateMedication = (index: number, field: string, value: string) => {
    const newMeds = [...medications];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setMedications(newMeds);
  };
  
  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const addLabOrder = () => {
    setLabOrders([...labOrders, { test_name: '', priority: 'ROUTINE', notes: '' }]);
  };
  
  const updateLabOrder = (index: number, field: string, value: string) => {
    const newLabs = [...labOrders];
    newLabs[index] = { ...newLabs[index], [field]: value };
    setLabOrders(newLabs);
  };
  
  const removeLabOrder = (index: number) => {
    setLabOrders(labOrders.filter((_, i) => i !== index));
  };

  if (isAppointmentsLoading || (patientId && isProfileLoading)) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] flex-col space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Appointment Not Found</h2>
        <button onClick={() => router.push('/queue')} className="text-indigo-600 hover:underline">
          Return to Queue
        </button>
      </div>
    );
  }

  const handleComplete = async () => {
    try {
      const validMeds = medications.filter(m => m.name && m.dosage && m.frequency && m.duration);
      const validLabs = labOrders.filter(l => l.test_name);
      
      await completeConsultation(appointmentId, {
        notes: notes.trim() || undefined,
        medications: validMeds.length > 0 ? validMeds : undefined,
        lab_orders: validLabs.length > 0 ? validLabs : undefined
      });
      router.push('/queue');
    } catch (err) {
      console.error(err);
    }
  };

  const name: string = typeof profile?.demographics?.name === 'string' ? profile.demographics.name : (typeof appointment.patient_name === 'string' ? appointment.patient_name : 'Unknown Patient');
  const age = profile?.demographics?.age ?? 'N/A';
  const gender = profile?.demographics?.gender || 'N/A';

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Consultation Workspace</h1>
          <p className="text-slate-500 mt-2">
            Patient: <span className="font-medium text-slate-700">{name}</span> 
            {age !== 'N/A' ? ` • ${age} years` : ''} {gender !== 'N/A' ? ` • ${gender}` : ''}
          </p>
        </div>
        <div className="flex gap-4">
          {appointment?.type?.toLowerCase() === 'video' && (appointment as any).meet_link && (
            <a 
              href={(appointment as any).meet_link} 
              target="_blank" 
              rel="noreferrer"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Video className="w-4 h-4" />
              Join Meeting
            </a>
          )}
          <button 
            onClick={() => router.push(`/doctor/assistant?appointmentId=${appointmentId}&patientId=${patientId}`)}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium flex items-center gap-2 transition-colors border border-indigo-200"
          >
            <Bot className="w-4 h-4" />
            Launch AI Copilot
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Medical Notes (SOAP)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Subjective, Objective, Assessment, Plan..."
                disabled={isCompleted}
                className="w-full min-h-[200px] p-4 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y disabled:bg-slate-50 disabled:text-slate-500"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                Prescriptions
              </CardTitle>
              {!isCompleted && (
                <button 
                  onClick={addMedication}
                  className="flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800 font-medium"
                >
                  <Plus className="w-4 h-4" /> Add Medication
                </button>
              )}
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {medications.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No medications added.</p>
              ) : (
                medications.map((med, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-md space-y-3 relative bg-slate-50/30">
                    {!isCompleted && (
                      <button onClick={() => removeMedication(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                      <input 
                        type="text" 
                        placeholder="Medication Name (e.g. Amoxicillin)" 
                        value={med.name} 
                        onChange={e => updateMedication(idx, 'name', e.target.value)}
                        disabled={isCompleted}
                        className="w-full p-2 border border-slate-200 rounded-md text-sm disabled:bg-slate-100"
                      />
                      <input 
                        type="text" 
                        placeholder="Dosage (e.g. 500mg)" 
                        value={med.dosage} 
                        onChange={e => updateMedication(idx, 'dosage', e.target.value)}
                        disabled={isCompleted}
                        className="w-full p-2 border border-slate-200 rounded-md text-sm disabled:bg-slate-100"
                      />
                      <input 
                        type="text" 
                        placeholder="Frequency (e.g. Twice a day)" 
                        value={med.frequency} 
                        onChange={e => updateMedication(idx, 'frequency', e.target.value)}
                        disabled={isCompleted}
                        className="w-full p-2 border border-slate-200 rounded-md text-sm disabled:bg-slate-100"
                      />
                      <input 
                        type="text" 
                        placeholder="Duration (e.g. 7 days)" 
                        value={med.duration} 
                        onChange={e => updateMedication(idx, 'duration', e.target.value)}
                        disabled={isCompleted}
                        className="w-full p-2 border border-slate-200 rounded-md text-sm disabled:bg-slate-100"
                      />
                      <input 
                        type="text" 
                        placeholder="Special Instructions (Optional)" 
                        value={med.instructions} 
                        onChange={e => updateMedication(idx, 'instructions', e.target.value)}
                        disabled={isCompleted}
                        className="w-full p-2 border border-slate-200 rounded-md text-sm md:col-span-2 disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-amber-600" />
                Lab Orders
              </CardTitle>
              {!isCompleted && (
                <button 
                  onClick={addLabOrder}
                  className="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-800 font-medium"
                >
                  <Plus className="w-4 h-4" /> Add Lab Order
                </button>
              )}
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {labOrders.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No lab orders added.</p>
              ) : (
                labOrders.map((lab, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-md space-y-3 relative bg-slate-50/30">
                    {!isCompleted && (
                      <button onClick={() => removeLabOrder(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                      <input 
                        type="text" 
                        placeholder="Test Name (e.g. Lipid Panel, CBC)" 
                        value={lab.test_name} 
                        onChange={e => updateLabOrder(idx, 'test_name', e.target.value)}
                        disabled={isCompleted}
                        className="w-full p-2 border border-slate-200 rounded-md text-sm md:col-span-1 disabled:bg-slate-100"
                      />
                      <select
                        value={lab.priority}
                        onChange={e => updateLabOrder(idx, 'priority', e.target.value)}
                        disabled={isCompleted}
                        className="w-full p-2 border border-slate-200 rounded-md text-sm bg-white disabled:bg-slate-100"
                      >
                        <option value="ROUTINE">Routine</option>
                        <option value="URGENT">Urgent</option>
                        <option value="STAT">STAT</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="Notes / Justification (Optional)" 
                        value={lab.notes} 
                        onChange={e => updateLabOrder(idx, 'notes', e.target.value)}
                        disabled={isCompleted}
                        className="w-full p-2 border border-slate-200 rounded-md text-sm md:col-span-2 disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {importedEvents.length > 0 && (
            <Card>
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  Imported External Records
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {importedEvents.map(event => {
                    const evType = event.type as string;
                    if (evType === "ai_summary" || evType === "AI_SUMMARY") return <AISummaryCard key={event.id} event={event as any} />;
                    if (evType.startsWith("imported_")) return <ImportedRecordCard key={event.id} event={event as any} />;
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6">
            {isCompleted ? (
              <>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center gap-2 text-emerald-700">
                    <CheckCircle className="w-5 h-5" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-emerald-50 text-emerald-700 p-4 rounded-md text-sm font-medium text-center">
                    This consultation has been completed and is now read-only.
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-slate-600" />
                    Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-slate-500 mb-6">
                    Please ensure all notes, prescriptions, and lab orders are complete before finishing the consultation.
                  </div>
                  <button
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isCompleting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    {isCompleting ? 'Saving...' : 'Complete Consultation'}
                  </button>
                </CardContent>
              </>
            )}
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                AI Health Insights & ABHA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="bg-purple-50 p-3 rounded-md text-purple-900 border border-purple-100">
                <strong>Timeline Summary:</strong> 
                <br/>
                {String(importedEvents.find(e => e.type === "ai_summary")?.structured_payload?.summary || 
                `Patient has ${importedEvents.length} external records available.`)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-slate-600">ABHA Status</span>
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">Active</span>
                </div>
              </div>
              <button
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-sm font-medium transition"
                onClick={() => router.push(`/doctor/patients/${patientId}`)}
              >
                View Full Timeline
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
