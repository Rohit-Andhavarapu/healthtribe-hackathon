"use client";

import * as React from "react";

export function Greeting({ name = "Sarah" }: { name?: string }) {
  return (
    <div className="pt-2">
      <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Good Morning, {name}</h1>
    </div>
  );
}
