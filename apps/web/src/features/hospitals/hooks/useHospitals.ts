import { useQuery } from '@tanstack/react-query';
import { getAllApiV1HospitalsGet } from '@healthtribe/api-client';

export interface Hospital {
  id: string;
  name: string;
  location?: string;
  type?: string;
}

export function useHospitals() {
  return useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const response = await getAllApiV1HospitalsGet();
      if (response.error) throw new Error(String(response.error));
      let hospitals = Array.isArray(response) ? response : (response?.data || []);
      return hospitals as unknown as Hospital[];
    }
  });
}
