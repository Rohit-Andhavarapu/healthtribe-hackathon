'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useUserRole } from '@/features/auth/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const { data: user, isLoading: isRoleLoading, isError } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (!userId) {
        router.replace('/sign-in');
      } else if (!isRoleLoading && user) {
        if (user.role === 'DOCTOR') {
          router.replace('/queue');
        } else if (user.role === 'PATIENT') {
          router.replace('/home');
        } else {
          // Fallback if role is unknown
          router.replace('/home');
        }
      } else if (!isRoleLoading && isError) {
        // Fallback to home if auth fails or backend is unreachable
        router.replace('/home');
      }
    }
  }, [isLoaded, userId, isRoleLoading, user, isError, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );
}
