import React from "react";
import Link from "next/link";

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 z-50 w-full border-t bg-background/95 pb-safe">
      <div className="flex h-16 items-center justify-around">
        <Link href="/home" className="flex flex-col items-center justify-center space-y-1">
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/timeline" className="flex flex-col items-center justify-center space-y-1">
          <span className="text-xs">Timeline</span>
        </Link>
      </div>
    </nav>
  );
}
