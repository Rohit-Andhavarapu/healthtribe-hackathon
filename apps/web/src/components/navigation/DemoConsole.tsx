"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DEMO_PROFILES = {
  PATIENT: [
    { id: "12345678-1234-5678-1234-567812345678", name: "Rahul" },
    { id: "87654321-4321-8765-4321-876543210987", name: "Riya" },
    { id: "arjun-demo-id-001", name: "Arjun" },
    { id: "sneha-demo-id-002", name: "Sneha" },
    { id: "priya-demo-id-003", name: "Priya" }
  ],
  DOCTOR: [
    { id: "abcdef01-2345-6789-abcd-ef0123456789", name: "Dr Sharma" },
    { id: "dr-rao-demo-id-001", name: "Dr Rao" },
    { id: "dr-mehta-demo-id-002", name: "Dr Mehta" },
    { id: "dr-gupta-demo-id-003", name: "Dr Gupta" }
  ],
  ADMIN: [
    { id: "admin-id-123", name: "Admin" }
  ]
};

export function DemoConsole() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const match = document.cookie.match(/(^| )demo_user_id=([^;]+)/);
    if (match) setCurrentUser(match[2]);
  }, []);

  const switchUser = async (userId: string, role: string) => {
    await fetch("/api/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role })
    });
    
    // Hard refresh to reload all contexts, auth, and state instantly
    if (role === "DOCTOR") window.location.href = "/doctor/queue";
    else if (role === "ADMIN") window.location.href = "/dashboard"; // Admin dashboard
    else window.location.href = "/timeline";
  };

  const clearDemo = async () => {
    await fetch("/api/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: null, role: null })
    });
    window.location.href = "/sign-in";
  };

  return (
    <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 w-full flex justify-between items-center z-50">
      <div className="flex items-center space-x-4">
        <div className="font-bold text-white tracking-widest uppercase">Demo Console</div>
        <div className="flex items-center space-x-2 border-l border-slate-700 pl-4">
          <span className="text-slate-500">Patients:</span>
          {DEMO_PROFILES.PATIENT.map(p => (
            <button 
              key={p.id}
              onClick={() => switchUser(p.id, "PATIENT")}
              className={`hover:text-white px-2 py-0.5 rounded ${currentUser === p.id ? 'bg-indigo-600 text-white font-bold' : ''}`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2 border-l border-slate-700 pl-4">
          <span className="text-slate-500">Doctors:</span>
          {DEMO_PROFILES.DOCTOR.map(d => (
            <button 
              key={d.id}
              onClick={() => switchUser(d.id, "DOCTOR")}
              className={`hover:text-white px-2 py-0.5 rounded ${currentUser === d.id ? 'bg-emerald-600 text-white font-bold' : ''}`}
            >
              {d.name}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2 border-l border-slate-700 pl-4">
          <span className="text-slate-500">Admin:</span>
          <button 
            onClick={() => switchUser(DEMO_PROFILES.ADMIN[0].id, "ADMIN")}
            className={`hover:text-white px-2 py-0.5 rounded ${currentUser === DEMO_PROFILES.ADMIN[0].id ? 'bg-rose-600 text-white font-bold' : ''}`}
          >
            Admin Mode
          </button>
        </div>
      </div>
      <div>
        <button onClick={clearDemo} className="text-rose-400 hover:text-rose-300 ml-4">
          Exit Demo
        </button>
      </div>
    </div>
  );
}
