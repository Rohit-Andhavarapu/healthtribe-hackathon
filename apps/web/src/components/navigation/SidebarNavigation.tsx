"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Clock, ShieldCheck, User, LogOut, Stethoscope, TestTube, Calendar, AlertTriangle, Sparkles, ShoppingBag } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import { SignOutButton } from "@clerk/nextjs";
import { RoleSwitcher } from "@/features/auth/components/RoleSwitcher";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const patientNavItems = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Assistant", href: "/assistant", icon: Sparkles },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Doctors", href: "/doctors", icon: Stethoscope },
  { name: "Timeline", href: "/timeline", icon: Clock },
  { name: "Labs", href: "/labs", icon: TestTube },
  { name: "Orders", href: "/orders", icon: ShoppingBag },
  { name: "Benefits", href: "/benefits", icon: ShieldCheck },
  { name: "Family", href: "/family", icon: Users },
  { name: "Emergency", href: "/emergency", icon: AlertTriangle },
  { name: "Profile", href: "/profile", icon: User },
];

const doctorNavItems = [
  { name: "Dashboard", href: "/queue", icon: Home },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "AI Assistant", href: "/doctor/assistant", icon: Sparkles },
  { name: "Profile", href: "/doctor/profile", icon: User },
];

interface SidebarNavigationProps {
  isDoctor?: boolean;
}

export function SidebarNavigation({ isDoctor = false }: SidebarNavigationProps) {
  const pathname = usePathname();
  const currentNavItems = isDoctor ? doctorNavItems : patientNavItems;

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/60 h-screen sticky top-0 left-0 pt-8 pb-6 px-4 z-50">
      <div className="flex items-center gap-3 px-4 mb-10">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900">HealthTribe {isDoctor && <span className="text-xs text-indigo-500 ml-1 block">MD</span>}</span>
      </div>
      
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {currentNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          const isEmergency = item.href === "/emergency";
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="relative flex items-center gap-3 px-4 py-3 w-full group"
              aria-label={item.name}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-nav-active"
                  className="absolute inset-0 bg-primary/10 rounded-2xl"
                  transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
                />
              )}
              <div 
                className={cn(
                  "relative z-10 flex items-center gap-3 w-full transition-colors",
                  isEmergency && !isActive ? "text-rose-500 group-hover:text-rose-700" :
                  isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-700"
                )}
              >
                <Icon 
                  className="w-[20px] h-[20px]" 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={cn(
                  "text-[15px]",
                  isActive ? "font-bold" : "font-medium"
                )}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 pt-4 border-t border-slate-100">
        <div className="mb-4">
          <RoleSwitcher />
        </div>
        <SignOutButton>
          <button className="flex items-center gap-3 w-full py-3 text-slate-500 hover:text-slate-700 transition-colors">
            <LogOut className="w-[20px] h-[20px]" strokeWidth={2} />
            <span className="text-[15px] font-medium">Log out</span>
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
