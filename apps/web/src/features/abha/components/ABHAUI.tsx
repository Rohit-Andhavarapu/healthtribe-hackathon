"use client";

import { useState } from "react";

export function ABHAUI({ patientId }: { patientId: string }) {
  const [step, setStep] = useState<"link" | "otp" | "linked" | "import">("link");
  const [abhaNumber, setAbhaNumber] = useState("14-5678-9012-3456");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  
  const [importState, setImportState] = useState<"idle" | "connecting" | "authenticating" | "consent" | "fhir" | "converting" | "timeline" | "ai" | "complete">("idle");
  const [selectedHospital, setSelectedHospital] = useState("");

  const handleGenerateOtp = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    if (otp === generatedOtp) {
      // Mock API Call
      await fetch(`/api/v1/abha/link/${patientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abha_number: abhaNumber, abha_address: "rohit@abdm" })
      });
      setStep("linked");
    } else {
      alert("Invalid OTP");
    }
  };

  const startImport = async (hospitalId: string, hospitalName: string) => {
    setSelectedHospital(hospitalName);
    setImportState("connecting");
    await new Promise(r => setTimeout(r, 800));
    setImportState("authenticating");
    await new Promise(r => setTimeout(r, 800));
    setImportState("consent");
    await new Promise(r => setTimeout(r, 800));
    setImportState("fhir");
    
    // API call
    try {
      await fetch(`/api/v1/abha/import/${patientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hospital_id: hospitalId })
      });
    } catch(e) { console.error(e) }
    
    setImportState("converting");
    await new Promise(r => setTimeout(r, 800));
    setImportState("timeline");
    await new Promise(r => setTimeout(r, 800));
    setImportState("ai");
    await new Promise(r => setTimeout(r, 800));
    setImportState("complete");
  };

  return (
    <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-6">Ayushman Bharat Health Account (ABHA)</h2>
      
      {step === "link" && (
        <div className="space-y-4">
          <p className="text-gray-600">Link your ABHA to automatically import and sync your medical history.</p>
          <input 
            type="text" 
            className="w-full border rounded-lg p-3" 
            value={abhaNumber} 
            onChange={(e) => setAbhaNumber(e.target.value)} 
            placeholder="ABHA Number" 
          />
          <button 
            onClick={handleGenerateOtp}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Generate OTP
          </button>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-4">
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
            <strong>Mock OTP Generated:</strong> {generatedOtp}
          </div>
          <input 
            type="text" 
            className="w-full border rounded-lg p-3" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
            placeholder="Enter OTP" 
          />
          <button 
            onClick={handleVerifyOtp}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Verify & Link
          </button>
        </div>
      )}

      {step === "linked" && importState === "idle" && (
        <div className="space-y-6">
          <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-center space-x-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            <span><strong>ABHA Linked Successfully!</strong> Your records are ready to be imported.</span>
          </div>
          
          <h3 className="text-lg font-semibold border-b pb-2">Available Health Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["Apollo Hospitals", "Yashoda Hospitals", "CARE Hospitals"].map((h) => (
              <div key={h} className="border p-4 rounded-lg flex justify-between items-center hover:border-blue-300 transition">
                <div>
                  <div className="font-medium text-gray-800">{h}</div>
                  <div className="text-sm text-gray-500">Multiple Records Found</div>
                </div>
                <button 
                  onClick={() => startImport(crypto.randomUUID(), h)}
                  className="text-blue-600 font-medium hover:underline text-sm"
                >
                  Import
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {importState !== "idle" && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Importing from {selectedHospital}...</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className={importState === "connecting" ? "text-blue-600 font-medium" : "text-green-600"}>
               {importState === "connecting" ? "⏳" : "✅"} Connecting to Hospital...
            </li>
            {(["authenticating", "consent", "fhir", "converting", "timeline", "ai", "complete"].includes(importState)) && (
              <li className={importState === "authenticating" ? "text-blue-600 font-medium" : "text-green-600"}>
                 {importState === "authenticating" ? "⏳" : "✅"} Authenticating...
              </li>
            )}
            {(["consent", "fhir", "converting", "timeline", "ai", "complete"].includes(importState)) && (
              <li className={importState === "consent" ? "text-blue-600 font-medium" : "text-green-600"}>
                 {importState === "consent" ? "⏳" : "✅"} Consent Verified...
              </li>
            )}
            {(["fhir", "converting", "timeline", "ai", "complete"].includes(importState)) && (
              <li className={importState === "fhir" ? "text-blue-600 font-medium" : "text-green-600"}>
                 {importState === "fhir" ? "⏳" : "✅"} Processing FHIR Bundle...
              </li>
            )}
            {(["converting", "timeline", "ai", "complete"].includes(importState)) && (
              <li className={importState === "converting" ? "text-blue-600 font-medium" : "text-green-600"}>
                 {importState === "converting" ? "⏳" : "✅"} Converting Records...
              </li>
            )}
            {(["timeline", "ai", "complete"].includes(importState)) && (
              <li className={importState === "timeline" ? "text-blue-600 font-medium" : "text-green-600"}>
                 {importState === "timeline" ? "⏳" : "✅"} Creating Timeline Events...
              </li>
            )}
            {(["ai", "complete"].includes(importState)) && (
              <li className={importState === "ai" ? "text-blue-600 font-medium" : "text-green-600"}>
                 {importState === "ai" ? "⏳" : "✅"} Generating AI Summary & Updating Context...
              </li>
            )}
            {importState === "complete" && (
              <li className="text-green-700 font-bold mt-4 pt-4 border-t">
                 🎉 Import Complete! View your Timeline.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
