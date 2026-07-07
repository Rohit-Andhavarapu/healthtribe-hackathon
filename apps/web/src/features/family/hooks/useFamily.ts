import { useQuery } from '@tanstack/react-query';
import { getAllApiV1FamilyGet } from '@healthtribe/api-client';

export function useFamily() {
  return useQuery({
    queryKey: ['family'],
    queryFn: async () => {
      const response = await getAllApiV1FamilyGet();
      if (response.error) {
        throw new Error(String(response.error));
      }
      return response.data || [];
    }
  });
}
