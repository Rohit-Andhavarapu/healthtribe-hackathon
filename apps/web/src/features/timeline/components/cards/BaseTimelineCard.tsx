import * as React from "react";
import { TimelineEvent } from "@healthtribe/schemas";
import { format } from "date-fns";
import { ChevronDown, Paperclip, User, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BaseTimelineCardProps {
  event: TimelineEvent;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  colorClass?: string;
  doctorName?: string;
  hospitalName?: string;
}

export function BaseTimelineCard({ event, icon, title, children, colorClass = "bg-slate-50 text-slate-700 border-slate-100", doctorName, hospitalName }: BaseTimelineCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const attachmentsCount = event.attachments?.length || 0;

  return (
    <motion.div 
      layout
      className={cn(
        "border border-slate-100/60 rounded-3xl p-5 bg-white shadow-card mb-4 transition-all hover:shadow-float cursor-pointer hover:border-primary/20",
        isExpanded && "shadow-float border-primary/20"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-4 items-start">
          <motion.div layout="position" className={cn("p-4 rounded-2xl shadow-sm mt-1", colorClass)}>
            {icon}
          </motion.div>
          <motion.div layout="position">
            <h3 className="font-bold text-slate-900 text-[18px] tracking-tight mb-1">{title}</h3>
            <p className="text-[13px] text-slate-500 font-medium mb-3">
              {format(new Date(event.occurred_at), "MMM d, yyyy")} • <span className="capitalize">{event.source.replace("_", " ")}</span>
            </p>
            
            {(doctorName || hospitalName) && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                {doctorName && (
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {doctorName}
                  </div>
                )}
                {hospitalName && (
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {hospitalName}
                  </div>
                )}
                {attachmentsCount > 0 && (
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    {attachmentsCount} Attachment{attachmentsCount > 1 ? "s" : ""}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
        
        <motion.div layout="position" className="flex flex-col items-end gap-3">
          <span className={cn(
            "text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider",
            event.status === "needs_review" ? "bg-amber-100 text-amber-800" : "bg-emerald-100/80 text-emerald-800"
          )}>
            {event.status.replace("_", " ")}
          </span>
          <motion.div 
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100"
          >
            <ChevronDown className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-5 pt-5 border-t border-slate-100/80" onClick={(e) => e.stopPropagation()}>
              {children}
              
              {event.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {event.tags.map(tag => (
                    <span key={tag} className="text-[11px] bg-slate-100/80 text-slate-600 px-3 py-1.5 rounded-lg font-semibold tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
