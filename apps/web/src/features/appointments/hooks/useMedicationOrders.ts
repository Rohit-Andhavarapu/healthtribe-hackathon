import { useQuery } from '@tanstack/react-query';
import { useAuth, useUser } from '@clerk/nextjs';

export function useMedicationOrders() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const patientId = user?.id;
  
  return useQuery({
    queryKey: ['medication-orders', patientId],
    queryFn: async () => {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/api/v1/clinical/patients/${patientId}/medication-orders`, {
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
    enabled: !!patientId,
  });
}
