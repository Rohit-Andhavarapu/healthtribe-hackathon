import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

export function usePatientMedications(patientId: string) {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['medications', patientId],
    queryFn: async () => {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/api/v1/clinical/patients/${patientId}/medications`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch medications');
      }
      
      return response.json();
    },
    enabled: !!patientId,
  });
}
