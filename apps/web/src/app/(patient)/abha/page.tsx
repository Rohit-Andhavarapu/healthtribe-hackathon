import { ABHAUI } from "@/features/abha/components/ABHAUI";
import { getAuthSession } from "@/auth";

export default async function ABHAPage() {
  const { userId } = await getAuthSession();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">ABHA Integration</h1>
      <p className="text-gray-500 mb-8">Link your Ayushman Bharat Health Account and import your medical history.</p>
      
      <ABHAUI patientId={userId || "demo-patient"} />
    </div>
  );
}
