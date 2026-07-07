import { useQuery } from '@tanstack/react-query';
import { getAllApiV1DoctorsGet, DoctorResponse } from '@healthtribe/api-client';

export function useDoctors(specialty?: string) {
  return useQuery({
    queryKey: ['doctors', specialty],
    queryFn: async () => {
      const response = await getAllApiV1DoctorsGet();
      
      if (response.error) {
        throw new Error(String(response.error));
      }
      
      let doctors = response.data || [];
      
      if (specialty && specialty !== "General") {
        doctors = doctors.filter((d: DoctorResponse) => d.specialty === specialty);
      }
      
      return doctors;
    }
  });
}
