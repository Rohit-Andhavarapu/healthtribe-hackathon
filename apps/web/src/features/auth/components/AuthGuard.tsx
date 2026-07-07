'use client';

import { useUserRole } from '../hooks/useUserRole';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('PATIENT' | 'DOCTOR' | 'ADMIN')[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { data: user, isLoading } = useUserRole();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && user) {
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on their actual role
        if (user.role === 'DOCTOR') {
          router.replace('/queue');
        } else if (user.role === 'PATIENT') {
          router.replace('/home');
        } else {
          router.replace('/');
        }
      }
    }
  }, [user, isLoading, allowedRoles, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
