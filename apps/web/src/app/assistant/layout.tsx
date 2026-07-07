import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { SidebarNavigation } from "@/components/navigation/SidebarNavigation";

export default function AssistantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <SidebarNavigation />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <main className="flex-1 overflow-hidden flex flex-col relative pb-16 md:pb-0">
          {children}
        </main>
        <BottomNavigation />
      </div>
    </div>
  );
}
