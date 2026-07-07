"use client";

import * as React from "react";
import { X, Heart, Sparkles, Shield, Zap, Users, Code } from "lucide-react";

interface AboutHealthTribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutHealthTribeModal({ isOpen, onClose }: AboutHealthTribeModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[700px] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold">About HealthTribe</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Heart className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">HealthTribe</h3>
            <p className="text-sm text-slate-600">Version 1.0.0 (Hackathon Demo)</p>
          </div>
          
          {/* Mission */}
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-slate-700 text-center italic">
              "Empowering patients with a complete, timeline-first view of their health journey, 
              integrated with AI assistance and seamless ABHA connectivity."
            </p>
          </div>
          
          {/* Key Features */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Platform Overview</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex gap-3 p-3 border border-slate-200 rounded-lg">
                <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Timeline-First Architecture</p>
                  <p className="text-xs text-slate-600 mt-1">Your complete health journey in one view</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 border border-slate-200 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">AI Assistant</p>
                  <p className="text-xs text-slate-600 mt-1">Context-aware health insights</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 border border-slate-200 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">ABHA Integration</p>
                  <p className="text-xs text-slate-600 mt-1">Import records from any hospital</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 border border-slate-200 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Family Management</p>
                  <p className="text-xs text-slate-600 mt-1">Manage care for your loved ones</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Technology Stack */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Technology Stack</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">Frontend:</span>
                <span className="text-slate-600"> Next.js 15, React, TypeScript</span>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">Styling:</span>
                <span className="text-slate-600"> Tailwind CSS, Framer Motion</span>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">Backend:</span>
                <span className="text-slate-600"> FastAPI, Python</span>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">Database:</span>
                <span className="text-slate-600"> PostgreSQL, SQLAlchemy</span>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">AI:</span>
                <span className="text-slate-600"> Google Gemini 1.5 Flash</span>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <span className="font-medium text-slate-700">Auth:</span>
                <span className="text-slate-600"> Clerk</span>
              </div>
            </div>
          </div>
          
          {/* Hackathon Team */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Hackathon Team</h4>
            <div className="p-4 border border-slate-200 rounded-lg">
              <p className="text-sm text-slate-700 mb-2">
                Built for the Healthcare Innovation Hackathon 2024
              </p>
              <p className="text-xs text-slate-600">
                A demonstration project showcasing timeline-first healthcare architecture, 
                AI-powered insights, and seamless ABHA integration for modern patient care.
              </p>
            </div>
          </div>
          
          {/* Open Source */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Open Source Licenses</h4>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">MIT License</span>
              </div>
              <p className="text-xs text-slate-600">
                This project uses various open-source libraries and frameworks. 
                Full license information available in the repository.
              </p>
            </div>
          </div>
          
          {/* Contact */}
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Contact Information</h4>
            <div className="space-y-1 text-sm text-slate-700">
              <p>📧 Email: <a href="mailto:hello@healthtribe.com" className="text-indigo-600 hover:underline">hello@healthtribe.com</a></p>
              <p>🌐 Website: <a href="#" className="text-indigo-600 hover:underline">www.healthtribe.com</a></p>
              <p>💬 Support: <a href="mailto:support@healthtribe.com" className="text-indigo-600 hover:underline">support@healthtribe.com</a></p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              © 2024 HealthTribe. Made with ❤️ for better healthcare.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
