import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function SectionHeader({ title, actionHref, actionLabel = "View all", className }: SectionHeaderProps) {
  return (
    <div className={cn("flex justify-between items-end mb-4", className)}>
      <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">{title}</h2>
      {actionHref && (
        <Link href={actionHref} className="text-[15px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center">
          {actionLabel} <ChevronRight className="w-4 h-4 ml-0.5" />
        </Link>
      )}
    </div>
  );
}

export function PageContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full space-y-8", className)}>
      {children}
    </div>
  );
}
