import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ConsentRecord {
  id: string;
  patient_id: string;
  hospital_id: string;
  status: string;
  granted_at?: string | null;
  expires_at?: string | null;
}

export function useConsents(patientId?: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['consents', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/consent/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed to fetch consents');
      return resp.json() as Promise<ConsentRecord[]>;
    },
    enabled: !!patientId
  });
}

export function useGrantConsent() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ patientId, hospitalId }: { patientId: string; hospitalId: string }) => {
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/consent/request`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, hospital_id: hospitalId })
      });
      if (!resp.ok) throw new Error('Failed to grant consent');
      return resp.json() as Promise<ConsentRecord>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
    }
  });
}

export function useRevokeConsent() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (consentId: string) => {
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/consent/${consentId}/revoke`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed to revoke consent');
      return resp.json() as Promise<ConsentRecord>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
    }
  });
}
