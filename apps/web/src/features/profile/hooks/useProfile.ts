import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PatientProfile {
  id: string;
  user_id: string;
  demographics?: Record<string, unknown>;
  allergies: string[];
  chronic_conditions: string[];
}

async function getPatientId(token: string): Promise<string | null> {
  const resp = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  return data.id as string;
}

export function usePatientId() {
  const { getToken, isLoaded } = useAuth();
  return useQuery({
    queryKey: ['patient-id'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) return null;
      return getPatientId(token);
    },
    enabled: isLoaded,
    staleTime: 1000 * 60 * 10 // 10 minutes
  });
}

export function useProfile() {
  const { getToken, isLoaded } = useAuth();
  const { data: patientId } = usePatientId();

  return useQuery({
    queryKey: ['profile', patientId],
    queryFn: async () => {
      if (!patientId) return null;
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/profile/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Failed to fetch profile');
      return resp.json() as Promise<PatientProfile>;
    },
    enabled: isLoaded && !!patientId
  });
}

export function useUpdateProfile() {
  const { getToken } = useAuth();
  const { data: patientId } = usePatientId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: Partial<Pick<PatientProfile, 'demographics' | 'allergies' | 'chronic_conditions'>>) => {
      if (!patientId) throw new Error('No patient ID');
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/profile/${patientId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      if (!resp.ok) throw new Error('Failed to update profile');
      return resp.json() as Promise<PatientProfile>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}
