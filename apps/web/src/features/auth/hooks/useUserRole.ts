import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

export function useUserRole() {
  const { getToken } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) return null;

      const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user role');
      }
      
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
