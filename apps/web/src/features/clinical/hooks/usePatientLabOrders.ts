import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

export function usePatientLabOrders(patientId: string) {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['labOrders', patientId],
    queryFn: async () => {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/api/v1/clinical/patients/${patientId}/lab-orders`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch lab orders');
      }
      
      return response.json();
    },
    enabled: !!patientId,
  });
}
