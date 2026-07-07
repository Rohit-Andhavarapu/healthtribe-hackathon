import React from "react";
import Link from "next/link";

export function SideNav({ links }: { links: Array<{ href: string; label: string }> }) {
  return (
    <aside className="w-64 flex-col hidden md:flex border-r h-full bg-background">
      <div className="p-6">
        <h2 className="text-lg font-bold">HealthTribe</h2>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="block p-2 rounded hover:bg-muted">
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
