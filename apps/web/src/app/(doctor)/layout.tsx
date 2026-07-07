import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { SidebarNavigation } from "@/components/navigation/SidebarNavigation";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['DOCTOR', 'ADMIN']}>
      <div className="flex h-screen bg-slate-50">
        <SidebarNavigation isDoctor={true} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
