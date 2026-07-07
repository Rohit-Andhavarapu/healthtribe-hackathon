"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Stethoscope, Clock, ShieldCheck, TestTube, Users, AlertCircle } from "lucide-react";

export function QuickActions() {
  const actions = [
    { title: "Doctors", icon: Stethoscope, href: "/doctors", color: "bg-indigo-50 text-indigo-600" },
    { title: "Timeline", icon: Clock, href: "/timeline", color: "bg-sky-50 text-sky-600" },
    { title: "Labs", icon: TestTube, href: "/labs", color: "bg-emerald-50 text-emerald-600" },
    { title: "Benefits", icon: ShieldCheck, href: "/benefits", color: "bg-primary-light text-primary" },
    { title: "Family", icon: Users, href: "/family", color: "bg-purple-50 text-purple-600" },
    { title: "Emergency", icon: AlertCircle, href: "/emergency", color: "bg-rose-50 text-rose-600" },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Quick Actions</h3>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x">
        {actions.map((action, i) => (
          <Link href={action.href} key={i} className="snap-start shrink-0">
            <motion.div 
              whileTap={{ scale: 0.95 }}
              className="w-24 h-24 bg-white rounded-3xl p-4 shadow-float flex flex-col items-center justify-center gap-2 border border-slate-100"
            >
              <div className={`p-3 rounded-2xl ${action.color}`}>
                <action.icon className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <span className="text-[12px] font-bold text-slate-700">{action.title}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
