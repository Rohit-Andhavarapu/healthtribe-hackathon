"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { X, ChevronDown, ChevronUp, MessageSquare, Bug, Lightbulb } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface HelpCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const faqs = [
  {
    question: "How do I book an appointment?",
    answer: "Go to the 'Doctors' page, select a doctor, and click 'Book Appointment'. Choose your preferred date and time, then confirm your booking."
  },
  {
    question: "How does the Timeline work?",
    answer: "The Timeline is your complete health journey in chronological order. It automatically aggregates appointments, lab reports, prescriptions, and medical records. You can filter by category, search for specific events, and share your timeline with doctors."
  },
  {
    question: "How do I import records via ABHA?",
    answer: "Go to Profile → ABHA Identity → Link your ABHA number. Once linked, visit the ABHA page and import records from hospitals. The system will automatically parse and add them to your Timeline."
  },
  {
    question: "Can I share my Timeline with a doctor?",
    answer: "Yes! In any consultation or appointment, doctors have access to your Timeline with your consent. You can also grant specific access via the Consent Management section."
  },
  {
    question: "How does the AI Assistant work?",
    answer: "The AI Assistant has access to your Timeline, appointments, lab reports, and medical history. Ask questions naturally, and it will provide personalized health insights based on your data."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use end-to-end encryption, comply with healthcare data regulations, and never share your data without explicit consent. See Privacy & Security for more details."
  }
];

export function HelpCenterModal({ isOpen, onClose }: HelpCenterModalProps) {
  const { getToken } = useAuth();
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);
  const [feedbackType, setFeedbackType] = React.useState<"FEEDBACK" | "BUG" | "FEATURE_REQUEST" | null>(null);
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  
  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: { type: string; subject: string; description: string }) => {
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/profile/feedback`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!resp.ok) throw new Error("Failed to submit feedback");
      return resp.json();
    },
    onSuccess: () => {
      toast.success("✓ Feedback submitted successfully!");
      setFeedbackType(null);
      setSubject("");
      setDescription("");
    },
    onError: () => {
      toast.error("Failed to submit feedback");
    }
  });
  
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackType && subject && description) {
      submitFeedbackMutation.mutate({
        type: feedbackType,
        subject,
        description
      });
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[700px] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Help Center</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {!feedbackType ? (
            <>
              {/* FAQs */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Frequently Asked Questions</h3>
                <div className="space-y-2">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-sm font-medium text-slate-900">{faq.question}</span>
                        {expandedFaq === index ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                      </button>
                      {expandedFaq === index && (
                        <div className="px-4 pb-4 pt-0">
                          <p className="text-sm text-slate-600">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Need More Help?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setFeedbackType("FEEDBACK")}
                    className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <MessageSquare className="w-6 h-6 text-indigo-600" />
                    <span className="text-sm font-medium text-slate-900">Send Feedback</span>
                  </button>
                  
                  <button
                    onClick={() => setFeedbackType("BUG")}
                    className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-lg hover:border-rose-300 hover:bg-rose-50 transition-colors"
                  >
                    <Bug className="w-6 h-6 text-rose-600" />
                    <span className="text-sm font-medium text-slate-900">Report Bug</span>
                  </button>
                  
                  <button
                    onClick={() => setFeedbackType("FEATURE_REQUEST")}
                    className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors"
                  >
                    <Lightbulb className="w-6 h-6 text-amber-600" />
                    <span className="text-sm font-medium text-slate-900">Suggest Feature</span>
                  </button>
                </div>
              </div>
              
              {/* Contact Support */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Contact Support</h4>
                <p className="text-sm text-slate-600">
                  Email us at <a href="mailto:support@healthtribe.com" className="text-indigo-600 hover:underline">support@healthtribe.com</a>
                </p>
                <p className="text-xs text-slate-500 mt-1">We typically respond within 24 hours</p>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  {feedbackType === "FEEDBACK" && "Send Feedback"}
                  {feedbackType === "BUG" && "Report a Bug"}
                  {feedbackType === "FEATURE_REQUEST" && "Suggest a Feature"}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {feedbackType === "FEEDBACK" && "We'd love to hear your thoughts about HealthTribe."}
                  {feedbackType === "BUG" && "Help us improve by reporting any issues you encounter."}
                  {feedbackType === "FEATURE_REQUEST" && "Share your ideas to make HealthTribe better."}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Brief summary..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={6}
                  placeholder="Provide as much detail as possible..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackType(null);
                    setSubject("");
                    setDescription("");
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitFeedbackMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {submitFeedbackMutation.isPending ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
