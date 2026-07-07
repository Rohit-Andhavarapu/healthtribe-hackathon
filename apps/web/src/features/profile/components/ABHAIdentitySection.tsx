"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@healthtribe/ui";
import { UserPlus, CheckCircle, Shield, Loader2, Copy, Check, RefreshCw } from "lucide-react";
import { useABHAIdentity } from "../../abha/hooks/useABHAIdentity";
import { useGenerateOTP, useVerifyOTPAndLink } from "../../abha/hooks/useABHAOTP";
import { toast } from "sonner";

type Step = "idle" | "form" | "otp_generated" | "linked";

export function ABHAIdentitySection() {
  const { data: abhaIdentity, isLoading } = useABHAIdentity();
  const { mutate: generateOTP, isPending: isGenerating } = useGenerateOTP();
  const { mutate: verifyOTP, isPending: isVerifying } = useVerifyOTPAndLink();

  const [step, setStep] = useState<Step>("idle");
  const [abhaNumber, setAbhaNumber] = useState("98-7654-3210-9876");
  const [abhaAddress, setAbhaAddress] = useState("patient@abdm");
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);
  const [enteredOTP, setEnteredOTP] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerateOTP = () => {
    generateOTP(undefined, {
      onSuccess: (data) => {
        setGeneratedOTP(data.otp);
        setEnteredOTP(data.otp); // Pre-fill for convenience
        setStep("otp_generated");
        toast.success("OTP Generated! It has been pre-filled for you.");
      },
      onError: (err) => {
        toast.error(`Failed to generate OTP: ${err.message}`);
      }
    });
  };

  const handleCopyOTP = () => {
    if (generatedOTP) {
      navigator.clipboard.writeText(generatedOTP);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.info("OTP copied to clipboard");
    }
  };

  const handleVerify = () => {
    if (!enteredOTP) {
      toast.error("Please enter the OTP");
      return;
    }
    verifyOTP(
      { otp: enteredOTP, abhaNumber, abhaAddress },
      {
        onSuccess: () => {
          setStep("linked");
          toast.success("✓ ABHA identity linked successfully!");
        },
        onError: (err) => {
          toast.error(`Verification failed: ${err.message}`);
        }
      }
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          ABHA Identity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : abhaIdentity ? (
          /* ── Already Linked ── */
          <div className="space-y-3">
            <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <CheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-emerald-900">ABHA Linked Successfully</p>
                <p className="text-sm text-emerald-700 truncate">ABHA Number: {abhaIdentity.abha_number}</p>
                <p className="text-sm text-emerald-700 truncate">ABHA Address: {abhaIdentity.abha_address}</p>
                <p className="text-xs text-emerald-600 mt-1">Status: {abhaIdentity.verification_status}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep("form");
              }}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Re-link with different ABHA
            </button>
          </div>
        ) : step === "idle" || step === "form" ? (
          /* ── Form Step ── */
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Link your Ayushman Bharat Health Account (ABHA) to securely fetch your medical records from any hospital across India.
            </p>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">ABHA Number</label>
                <input
                  type="text"
                  value={abhaNumber}
                  onChange={e => setAbhaNumber(e.target.value)}
                  placeholder="e.g. 98-7654-3210-9876"
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">ABHA Address</label>
                <input
                  type="text"
                  value={abhaAddress}
                  onChange={e => setAbhaAddress(e.target.value)}
                  placeholder="e.g. patient@abdm"
                  className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button
              onClick={handleGenerateOTP}
              disabled={isGenerating || !abhaNumber || !abhaAddress}
              className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {isGenerating ? "Generating OTP..." : "Generate OTP to Link"}
            </button>
          </div>
        ) : step === "otp_generated" ? (
          /* ── OTP Step ── */
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              An OTP has been generated for your ABHA verification. It has been pre-filled below.
            </p>

            {/* OTP Display Box */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Your OTP</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-indigo-900 tracking-[0.3em]">{generatedOTP}</span>
                <button
                  onClick={handleCopyOTP}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-indigo-500 mt-2">This OTP is pre-filled in the field below. Click Verify to proceed.</p>
            </div>

            {/* OTP Input */}
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Enter OTP</label>
              <input
                type="text"
                value={enteredOTP}
                onChange={e => setEnteredOTP(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full text-center text-xl font-bold tracking-widest border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep("form")}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
              >
                Back
              </button>
              <button
                onClick={handleVerify}
                disabled={isVerifying || !enteredOTP}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {isVerifying ? "Verifying..." : "Verify & Link"}
              </button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
