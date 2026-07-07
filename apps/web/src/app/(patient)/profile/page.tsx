"use client";

import * as React from "react";
import { PageContainer } from "@/components/shared/layout";
import { ProfileHeader, SettingsSection, SupportSection, LogoutButton, ABHAIdentitySection, ConsentManagementSection, HealthSummarySection } from "@/features/profile/components";

export default function ProfilePage() {
  return (
    <PageContainer className="pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ProfileHeader />
        </div>
        
        <div className="lg:col-span-2 space-y-8">
          <HealthSummarySection />
          <ABHAIdentitySection />
          <ConsentManagementSection />
          <SettingsSection />
          <SupportSection />
          <LogoutButton />
        </div>
      </div>
    </PageContainer>
  );
}

