/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { TimelineEvent } from "@healthtribe/schemas";
import { BaseTimelineCard } from "./BaseTimelineCard";
import { Pill } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";

export function PrescriptionCard({ event }: { event: TimelineEvent }) {
  const evType = event.type as string;
  const [isOrdering, setIsOrdering] = React.useState(false);
  const [hasOrdered, setHasOrdered] = React.useState(false);
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  
  if (evType !== "PRESCRIPTION" && evType !== "prescription") return null;
  const data = (event.structured_payload as any) || {};
  
  const handleOrder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOrdering || hasOrdered) return;
    
    if (!data.medication_ids || data.medication_ids.length === 0) {
      alert("No medications found to order.");
      return;
    }
    
    setIsOrdering(true);
    try {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/clinical/patients/${event.patient_id}/medication-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          medication_ids: data.medication_ids,
          appointment_id: data.appointment_id,
          consultation_id: data.consultation_id
        })
      });
      
      if (!res.ok) throw new Error("Failed to order medications");
      setHasOrdered(true);
      
      // Invalidate queries to update Smart Context and orders list globally
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      queryClient.invalidateQueries({ queryKey: ['medication-orders'] });
      queryClient.invalidateQueries({ queryKey: ['smartContext'] });
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <BaseTimelineCard 
      event={event} 
      icon={<Pill className="w-5 h-5" />} 
      title={data.title || "Prescription Issued"}
      colorClass="bg-[#DBEAFE] text-[#1E3A8A] border-blue-200"
      doctorName={data.doctor_name || event.metadata?.doctor_name as string || "Dr. Sarah Jenkins"}
      hospitalName={data.hospital_name || event.metadata?.hospital_name as string || "City Hospital"}
    >
      <div className="space-y-4">
        {data.medications?.map((med: string, idx: number) => {
          const parts = med.split(' (');
          const name = parts[0];
          const doseInfo = parts.length > 1 ? parts[1].replace(')', '') : "As prescribed";
          
          return (
            <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <p className="font-semibold text-slate-900">{name}</p>
                <p className="text-sm text-slate-500">{doseInfo}</p>
              </div>
            </div>
          );
        })}
        {data.notes && (
          <div className="mt-3 text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p><span className="font-medium text-blue-900">Notes:</span> {data.notes}</p>
          </div>
        )}
        
        {data.medication_ids && data.medication_ids.length > 0 && (
          <div className="pt-3 flex justify-end">
            <button 
              onClick={handleOrder}
              disabled={isOrdering || hasOrdered}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                hasOrdered 
                  ? "bg-emerald-100 text-emerald-700 cursor-default"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isOrdering ? (
                <span>Ordering...</span>
              ) : hasOrdered ? (
                <>Order Placed</>
              ) : (
                <>Order Medicines</>
              )}
            </button>
          </div>
        )}
      </div>
    </BaseTimelineCard>
  );
}
