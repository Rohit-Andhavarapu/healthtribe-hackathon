import { useQuery } from '@tanstack/react-query';
import { getAllApiV1LabsGet } from '@healthtribe/api-client';

export function useLabs() {
  return useQuery({
    queryKey: ['labs'],
    queryFn: async () => {
      const response = await getAllApiV1LabsGet();
      if (response.error) {
        throw new Error(String(response.error));
      }
      return response.data || [];
    }
  });
}
