import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

export interface MedicationOrder {
  id: string;
  patient_id: string;
  doctor_id?: string;
  appointment_id?: string;
  consultation_id?: string;
  status: 'PLACED' | 'CONFIRMED' | 'PACKED' | 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  medication_ids: string[];
}

export const usePatientMedicationOrders = (patientId?: string) => {
  const { isLoaded, getToken } = useAuth();
  
  const targetPatientId = patientId;

  return useQuery({
    queryKey: ['medication-orders', targetPatientId],
    queryFn: async (): Promise<MedicationOrder[]> => {
      if (!targetPatientId) throw new Error("No patient ID available");
      
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/api/v1/clinical/patients/${targetPatientId}/medication-orders`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch medication orders');
      }
      
      return response.json();
    },
    enabled: isLoaded && !!targetPatientId,
  });
};
