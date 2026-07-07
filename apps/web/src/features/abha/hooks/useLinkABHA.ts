import { useMutation, useQueryClient } from '@tanstack/react-query';
import { linkAbhaApiV1AbhaLinkPatientIdPost } from '@healthtribe/api-client';

export function useLinkABHA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ patientId, abhaNumber, abhaAddress }: { patientId: string; abhaNumber: string; abhaAddress: string }) => {
      const response = await linkAbhaApiV1AbhaLinkPatientIdPost({
        path: { patient_id: patientId },
        body: { abha_number: abhaNumber, abha_address: abhaAddress }
      });
      if (response.error) throw new Error(String(response.error));
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['abha-identity', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['timeline', variables.patientId] });
    }
  });
}
