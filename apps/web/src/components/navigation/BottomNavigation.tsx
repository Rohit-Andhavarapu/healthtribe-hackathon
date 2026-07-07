"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Stethoscope, Clock, ShieldCheck, User, Sparkles } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Bottom nav shows 6 most important routes on mobile
const navItems = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Assistant", href: "/assistant", icon: Sparkles },
  { name: "Doctors", href: "/doctors", icon: Stethoscope },
  { name: "Timeline", href: "/timeline", icon: Clock },
  { name: "Benefits", href: "/benefits", icon: ShieldCheck },
  { name: "Profile", href: "/profile", icon: User },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-4 bg-gradient-to-t from-slate-50/80 to-transparent pointer-events-none md:hidden">
      <nav className="mx-auto max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[28px] pointer-events-auto">
        <div className="flex justify-around items-center h-[72px] px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className="relative flex flex-col items-center justify-center w-full h-full"
                aria-label={item.name}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <motion.div 
                    layoutId="bottom-nav-active"
                    className="absolute inset-0 bg-primary/10 rounded-[20px] m-1.5"
                    transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
                  />
                )}
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "relative z-10 flex flex-col items-center justify-center space-y-1 mt-1",
                    isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Icon 
                    className="w-[22px] h-[22px]" 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={cn(
                    "text-[10px]",
                    isActive ? "font-bold" : "font-medium"
                  )}>
                    {item.name}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
