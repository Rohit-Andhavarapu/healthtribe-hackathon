import { getAuthSession } from "@/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const demoRole = cookieStore.get("demo_role")?.value;
  
  if (demoRole !== "ADMIN") {
    // Basic protection
    redirect("/home");
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
      <p className="text-gray-500">Monitor platform activity, ABHA links, and Timeline events.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        {[ 
          { label: "Active Patients", value: "1,245" },
          { label: "ABHA Linked", value: "892" },
          { label: "Timeline Events", value: "15.4K" },
          { label: "Consent Requests", value: "342" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="text-gray-500 text-sm font-medium mb-1">{stat.label}</div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Recent ABHA Imports</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-sm text-gray-500">
              <th className="pb-3">Patient ID</th>
              <th className="pb-3">Hospital</th>
              <th className="pb-3">Records Imported</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {[1, 2, 3].map(i => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-4">usr_abc{i}</td>
                <td className="py-4">Apollo Hospitals</td>
                <td className="py-4">4</td>
                <td className="py-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Completed</span></td>
                <td className="py-4">Just now</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
