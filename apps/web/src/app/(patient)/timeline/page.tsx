import { TimelineContainer } from "@/features/timeline/components/TimelineContainer";

export const metadata = {
  title: "Timeline | HealthTribe",
  description: "Your unified medical timeline.",
};

export default function TimelinePage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <TimelineContainer />
    </div>
  );
}
