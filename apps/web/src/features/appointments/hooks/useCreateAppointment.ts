import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { queryKeys } from '../../api/queryKeys';

export interface CreateAppointmentPayload {
  doctor_id: string;
  date: string;
  time?: string;
  type?: string;
  notes?: string;
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  return useMutation({
    mutationFn: async (payload: CreateAppointmentPayload) => {
      let token: string | null = null;
      try {
        token = await getToken();
      } catch (e) {
        console.error("Clerk getToken() failed", e);
      }
      
      const headers = new Headers({ 'Content-Type': 'application/json' });
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const response = await fetch(`${apiUrl}/api/v1/appointments/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }
      return response.json();
    },
    onSuccess: () => {
      // Instantly update the entire application state using centralized keys
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.timeline.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
      queryClient.invalidateQueries({ queryKey: ['smartContext'] });
    },
  });
}
