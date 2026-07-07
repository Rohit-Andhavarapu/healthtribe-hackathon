"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DEMO_USERS = [
  { id: "12345678-1234-5678-1234-567812345678", name: "Rahul (Patient)", role: "PATIENT" },
  { id: "87654321-4321-8765-4321-876543210987", name: "Riya (Patient)", role: "PATIENT" },
  { id: "abcdef01-2345-6789-abcd-ef0123456789", name: "Dr. Sharma", role: "DOCTOR" },
  { id: "admin-id-123", name: "Admin", role: "ADMIN" }
];

export function DemoSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    // Get current from cookies if possible (client-side workaround)
    const match = document.cookie.match(/(^| )demo_user_id=([^;]+)/);
    if (match) setCurrentUser(match[2]);
  }, []);

  const switchUser = async (user: any) => {
    await fetch("/api/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, role: user.role })
    });
    
    if (user.role === "DOCTOR") {
      window.location.href = "/doctor-dashboard";
    } else if (user.role === "ADMIN") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/timeline";
    }
  };

  const clearDemo = async () => {
    await fetch("/api/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: null, role: null })
    });
    window.location.href = "/sign-in";
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg z-50 hover:bg-purple-700 transition"
      >
        🧬 Demo Mode
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border shadow-2xl rounded-xl p-4 w-64 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">Identity Switcher</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-red-500">&times;</button>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {DEMO_USERS.map(u => (
          <button 
            key={u.id}
            onClick={() => switchUser(u)}
            className={`w-full text-left px-3 py-2 rounded text-sm ${currentUser === u.id ? 'bg-purple-100 font-semibold text-purple-700' : 'hover:bg-gray-100'}`}
          >
            {u.name}
          </button>
        ))}
      </div>
      
      <button 
        onClick={clearDemo}
        className="w-full mt-4 text-xs text-red-600 hover:underline text-center"
      >
        Exit Demo Mode
      </button>
    </div>
  );
}
