import { useQuery } from '@tanstack/react-query';
import { getAllApiV1AppointmentsGet } from '@healthtribe/api-client';
import { queryKeys } from '../../api/queryKeys';

export function useAppointments() {
  return useQuery({
    queryKey: queryKeys.appointments.all,
    queryFn: async () => {
      const response = await getAllApiV1AppointmentsGet();
      
      if (response.error) {
        throw new Error(String(response.error));
      }
      
      return response.data || [];
    }
  });
}
