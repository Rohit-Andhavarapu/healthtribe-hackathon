"use client";

import * as React from "react";
import { PageContainer } from "@/components/shared/layout";
import { 
  Greeting, 
  HeroHealthScore, 
  DailySummary, 
  NextAppointment, 
  MedicationReminder, 
  AiHeroCard, 
  QuickActions, 
  RecentTimeline, 
  HealthInsights 
} from "@/features/home/components";

export default function PatientHome() {
  return (
    <PageContainer className="pb-10">
      <Greeting name="Sarah" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 mt-8">
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-6 xl:space-y-8">
          <HeroHealthScore />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
            <NextAppointment />
            <MedicationReminder />
          </div>
          <AiHeroCard />
          <QuickActions />
          <RecentTimeline />
        </div>
        
        {/* Right Sidebar Column */}
        <div className="space-y-6 xl:space-y-8">
          <DailySummary />
          <HealthInsights />
        </div>
      </div>
    </PageContainer>
  );
}

