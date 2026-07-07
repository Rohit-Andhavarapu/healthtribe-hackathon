import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function HeroCard({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <motion.div 
      whileHover={onClick ? { scale: 0.98, y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.96 } : undefined}
      onClick={onClick}
      className={cn(
        "bg-white rounded-3xl p-6 shadow-float border border-slate-100 relative overflow-hidden transition-colors",
        onClick && "cursor-pointer hover:border-primary/20",
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export function StatsCard({ title, value, icon: Icon, colorClass = "text-primary bg-primary-light" }: { title: string; value: React.ReactNode; icon: React.ElementType; colorClass?: string }) {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-card border border-slate-100/50 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className={cn("p-2.5 rounded-2xl", colorClass)}>
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
      </div>
      <div className="text-2xl font-semibold text-slate-900 tracking-tight">{value}</div>
    </div>
  );
}

export function QuickActionCard({ title, icon: Icon, onClick, colorClass = "bg-primary-light text-primary" }: { title: string; icon: React.ElementType; onClick?: () => void; colorClass?: string }) {
  return (
    <motion.button 
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 p-4 bg-white rounded-3xl shadow-card border border-slate-100/50 min-w-[90px] transition-colors hover:border-primary/20"
    >
      <div className={cn("p-3.5 rounded-full", colorClass)}>
        <Icon className="w-6 h-6" strokeWidth={1.5} />
      </div>
      <span className="text-[13px] font-medium text-slate-700 text-center leading-tight">{title}</span>
    </motion.button>
  );
}

export function InfoCard({ children, className, hover = false }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <motion.div 
      whileHover={hover ? { y: -2 } : undefined}
      className={cn(
        "bg-white rounded-3xl p-5 shadow-soft border border-slate-100/50",
        hover && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
