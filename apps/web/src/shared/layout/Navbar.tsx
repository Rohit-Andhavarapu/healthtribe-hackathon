import React from "react";
import Link from "next/link";

export function Navbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold sm:inline-block">{title}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
