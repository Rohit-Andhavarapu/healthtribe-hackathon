import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useImportRecords() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ hospitalId, consentRecordId }: { hospitalId: string; consentRecordId?: string }) => {
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/abha/import/me`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hospital_id: hospitalId, consent_record_id: consentRecordId ?? null })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ detail: 'Import failed' }));
        throw new Error(err.detail || 'Failed to import records');
      }
      return resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      queryClient.invalidateQueries({ queryKey: ['abha-import-sessions'] });
    }
  });
}
