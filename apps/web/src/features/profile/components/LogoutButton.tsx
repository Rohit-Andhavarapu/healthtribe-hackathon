"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";

export function LogoutButton() {
  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center justify-center gap-2 py-4 text-rose-600 font-bold bg-white border border-rose-100 shadow-sm hover:bg-rose-50 rounded-[20px] transition-colors mb-6 text-[15px]"
    >
      <LogOut className="w-5 h-5" />
      Sign Out
    </motion.button>
  );
}
