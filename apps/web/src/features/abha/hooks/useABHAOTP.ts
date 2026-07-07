import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

export function useGenerateOTP() {
  const { getToken } = useAuth();
  
  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/abha/generate-otp`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      if (!resp.ok) throw new Error('Failed to generate OTP');
      return resp.json() as Promise<{ otp: string; message: string }>;
    }
  });
}

export function useVerifyOTPAndLink() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ otp, abhaNumber, abhaAddress }: { otp: string; abhaNumber: string; abhaAddress: string }) => {
      const token = await getToken();
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/abha/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ otp, abha_number: abhaNumber, abha_address: abhaAddress })
        }
      );
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || 'OTP verification failed');
      }
      return resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abha-identity'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    }
  });
}
