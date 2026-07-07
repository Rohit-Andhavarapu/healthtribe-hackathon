import { useQuery } from '@tanstack/react-query';
import { getByUserIdApiV1ProfileUserIdGet } from '@healthtribe/api-client';

export function usePatientProfileById(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const response = await getByUserIdApiV1ProfileUserIdGet({
        path: {
          user_id: userId
        }
      });
      
      if (response.error) {
        throw new Error(String(response.error));
      }
      
      return response.data;
    },
    enabled: !!userId,
  });
}
