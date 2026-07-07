import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { queryKeys } from '../../api/queryKeys';

export function useClinicalAnalytics() {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['clinical', 'analytics'],
    queryFn: async () => {
      const token = await getToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${apiUrl}/api/v1/clinical/analytics`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch clinical analytics');
      }
      
      return response.json();
    }
  });
}
