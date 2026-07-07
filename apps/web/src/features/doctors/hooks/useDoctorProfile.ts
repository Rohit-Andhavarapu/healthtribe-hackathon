import { useQuery } from '@tanstack/react-query';
import { getMyProfileApiV1DoctorsMeGet } from '@healthtribe/api-client';
import { useAuth } from '@clerk/nextjs';
import { useUserRole } from '@/features/auth/hooks/useUserRole';

export const DOCTOR_PROFILE_QUERY_KEY = ['doctorProfile'];

export function useDoctorProfile() {
  const { getToken } = useAuth();
  const { data: user } = useUserRole();

  return useQuery({
    queryKey: DOCTOR_PROFILE_QUERY_KEY,
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('No authentication token');

      const { data, error } = await getMyProfileApiV1DoctorsMeGet({
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (error) {
        throw error;
      }
      return data;
    },
    enabled: user?.role === 'DOCTOR', // Only fetch if user is a doctor
  });
}
