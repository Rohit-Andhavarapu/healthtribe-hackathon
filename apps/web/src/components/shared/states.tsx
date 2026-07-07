import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function EmptyState({ title, description, icon: Icon, actionLabel, onAction }: { title: string; description: string; icon?: React.ElementType; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="relative mb-6"
        >
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <div className="w-24 h-24 bg-white rounded-[32px] border border-slate-100 flex items-center justify-center shadow-card relative z-10">
            <Icon className="w-10 h-10 text-slate-400" strokeWidth={1.5} />
          </div>
        </motion.div>
      )}
      <h3 className="text-[22px] font-black text-slate-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-slate-500 font-medium text-[15px] max-w-[280px] mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className="bg-slate-900 text-white px-8 py-3.5 rounded-[20px] font-bold shadow-float hover:bg-slate-800 transition-colors text-sm tracking-wide"
        >
          {actionLabel}
        </motion.button>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-slate-100 rounded-2xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-slate-100 rounded-[28px] p-5 bg-white shadow-sm space-y-5">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-[20px]" />
        <div className="space-y-2.5 flex-1">
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-3 w-[40%]" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
  );
}

