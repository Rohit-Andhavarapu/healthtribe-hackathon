import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../api/queryKeys';

export function useCompleteConsultation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const completeConsultation = async (
    appointmentId: string, 
    data: { 
      notes?: string;
      medications?: Array<{ name: string; dosage: string; frequency: string; duration: string; instructions?: string }>;
      lab_orders?: Array<{ test_name: string; priority: string; notes?: string }>;
    }
  ) => {
    setIsCompleting(true);
    setError(null);
    try {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/api/v1/appointments/${appointmentId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to complete consultation');
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
      
      // Also invalidate smart-context, medications, and labs
      queryClient.invalidateQueries({ queryKey: ['smartContext'] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['labs'] });
      queryClient.invalidateQueries({ queryKey: ['patientProfile'] });
      
      return await response.json();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'An error occurred');
      throw error;
    } finally {
      setIsCompleting(false);
    }
  };

  return { completeConsultation, isCompleting, error };
}
