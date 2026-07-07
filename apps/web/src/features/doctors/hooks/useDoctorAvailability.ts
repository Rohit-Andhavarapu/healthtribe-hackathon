import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { getDoctorAvailability } from '@healthtribe/api-client';

export function useDoctorAvailability(doctorId?: string) {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['doctorAvailability', doctorId],
    queryFn: async () => {
      if (!doctorId) return null;
      const token = await getToken();
      if (!token) throw new Error("Unauthorized");
      
      const response = await getDoctorAvailability({
        path: {
          doctor_id: doctorId
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.error) {
        throw new Error("Failed to fetch doctor availability");
      }
      
      return response.data;
    },
    enabled: !!doctorId
  });
}
