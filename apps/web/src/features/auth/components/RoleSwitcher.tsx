'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { switchRoleApiV1AuthSwitchRolePost } from '@healthtribe/api-client';
import { Stethoscope, User } from 'lucide-react';
import { useUserRole } from '../hooks/useUserRole';

export function RoleSwitcher() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useUserRole();
  const [isSwitching, setIsSwitching] = useState(false);

  if (isLoading) return null;

  // Temporarily disabled for production readiness
  return null;
  
  const role = data?.role;
  const isDoctor = role === 'DOCTOR';

  const handleSwitchRole = async () => {
    setIsSwitching(true);
    try {
      await switchRoleApiV1AuthSwitchRolePost({
        body: {
          role: isDoctor ? 'PATIENT' : 'DOCTOR',
        },
      });
      
      // Invalidate everything to force refetches with new role
      await queryClient.invalidateQueries();
      
      // Redirect to root, AuthGuard will handle routing to /queue or /home
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to switch role', error);
      setIsSwitching(false);
    }
  };

  return (
    <button
      onClick={handleSwitchRole}
      disabled={isSwitching}
      className={`
        flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md w-full
        transition-colors duration-150 ease-in-out
        ${isDoctor 
          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' 
          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}
        ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title="DEV TOOL: Switch Role"
    >
      {isDoctor ? <User className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
      <span>{isSwitching ? 'Switching...' : `Switch to ${isDoctor ? 'Patient' : 'Doctor'} View`}</span>
    </button>
  );
}
