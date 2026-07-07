"use client";

import * as React from "react";
import { PageContainer } from "@/components/shared/layout";
import { ActiveInsuranceCard, AbhaCard, EligibilityChecker } from "@/features/benefits/components";

export default function BenefitsPage() {
  return (
    <PageContainer className="pb-10">
      <div className="pt-2 mb-8">
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">My Benefits</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your health insurance and schemes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-full">
          <ActiveInsuranceCard />
        </div>
        <div className="lg:col-span-1 h-full">
          <AbhaCard />
        </div>
        <div className="lg:col-span-3">
          <EligibilityChecker />
        </div>
      </div>
    </PageContainer>
  );
}

