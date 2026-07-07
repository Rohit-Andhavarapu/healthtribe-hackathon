import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { SidebarNavigation } from "@/components/navigation/SidebarNavigation";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['PATIENT']}>
      <div className="flex h-screen bg-slate-50">
        <SidebarNavigation />
        <div className="flex-1 flex flex-col min-w-0 h-screen">
          <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 w-full">
              {children}
            </div>
          </main>
          <BottomNavigation />
        </div>
      </div>
    </AuthGuard>
  );
}
