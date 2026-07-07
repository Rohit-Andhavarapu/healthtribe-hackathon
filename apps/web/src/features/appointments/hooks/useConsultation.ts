import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

export function useConsultation(appointmentId: string) {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['consultation', appointmentId],
    queryFn: async () => {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/api/v1/appointments/${appointmentId}/consultation`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (response.status === 404) {
        return null; // No consultation yet
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch consultation');
      }
      
      return response.json();
    },
    enabled: !!appointmentId,
  });
}
