import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

export interface ABHAIdentity {
  id: string;
  patient_id: string;
  abha_number: string;
  abha_address: string;
  verification_status: string;
  verification_method?: string;
  linked_at?: string;
  is_primary: boolean;
}

export function useABHAIdentity(patientId?: string) {
  const { getToken, isLoaded } = useAuth();

  return useQuery({
    queryKey: ['abha-identity', patientId ?? 'me'],
    queryFn: async () => {
      const token = await getToken();
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/abha/identity/me`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (resp.status === 404) return null;
      if (!resp.ok) throw new Error('Failed to fetch ABHA identity');
      const data = await resp.json();
      return data as ABHAIdentity | null;
    },
    enabled: isLoaded
  });
}
