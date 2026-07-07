"use client";

import { useEffect } from "react";
import { EmptyState } from "@/components/shared/states";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Patient route error:", error);
  }, [error]);

  return (
    <div className="flex h-full items-center justify-center p-4">
      <EmptyState
        title="Something went wrong"
        description="We couldn't load this page. Please try again."
        icon={AlertCircle}
        actionLabel="Try again"
        onAction={() => reset()}
      />
    </div>
  );
}
