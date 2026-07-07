"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface NotificationPreferences {
  id: string;
  patient_id: string;
  appointment_reminders: boolean;
  medication_reminders: boolean;
  lab_report_notifications: boolean;
  order_updates: boolean;
  emergency_alerts: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
}

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  
  const [appointmentReminders, setAppointmentReminders] = React.useState(true);
  const [medicationReminders, setMedicationReminders] = React.useState(true);
  const [labReportNotifications, setLabReportNotifications] = React.useState(true);
  const [orderUpdates, setOrderUpdates] = React.useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [smsNotifications, setSmsNotifications] = React.useState(false);
  
  // Fetch preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/profile/notification-preferences`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error("Failed to fetch notification preferences");
      return resp.json() as Promise<NotificationPreferences>;
    },
    enabled: isOpen
  });
  
  React.useEffect(() => {
    if (preferences) {
      setAppointmentReminders(preferences.appointment_reminders);
      setMedicationReminders(preferences.medication_reminders);
      setLabReportNotifications(preferences.lab_report_notifications);
      setOrderUpdates(preferences.order_updates);
      setEmergencyAlerts(preferences.emergency_alerts);
      setEmailNotifications(preferences.email_notifications);
      setPushNotifications(preferences.push_notifications);
      setSmsNotifications(preferences.sms_notifications);
    }
  }, [preferences]);
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      const token = await getToken();
      const resp = await fetch(`${API_URL}/api/v1/profile/notification-preferences`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!resp.ok) throw new Error("Failed to update notification preferences");
      return resp.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("✓ Notification preferences updated");
    },
    onError: () => {
      toast.error("Failed to update preferences");
    }
  });
  
  const handleSave = () => {
    updateMutation.mutate({
      appointment_reminders: appointmentReminders,
      medication_reminders: medicationReminders,
      lab_report_notifications: labReportNotifications,
      order_updates: orderUpdates,
      emergency_alerts: emergencyAlerts,
      email_notifications: emailNotifications,
      push_notifications: pushNotifications,
      sms_notifications: smsNotifications
    });
  };
  
  if (!isOpen) return null;
  
  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-indigo-600' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[600px] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Notification Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <p className="text-center text-slate-500 py-8">Loading preferences...</p>
          ) : (
            <div className="space-y-6">
              {/* Content Preferences */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Content Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Appointment Reminders</p>
                      <p className="text-xs text-slate-500">Get reminded about upcoming appointments</p>
                    </div>
                    <ToggleSwitch checked={appointmentReminders} onChange={setAppointmentReminders} />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Medication Reminders</p>
                      <p className="text-xs text-slate-500">Reminders to take your medications</p>
                    </div>
                    <ToggleSwitch checked={medicationReminders} onChange={setMedicationReminders} />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Lab Report Notifications</p>
                      <p className="text-xs text-slate-500">When lab results are available</p>
                    </div>
                    <ToggleSwitch checked={labReportNotifications} onChange={setLabReportNotifications} />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Order Updates</p>
                      <p className="text-xs text-slate-500">Updates on medication orders</p>
                    </div>
                    <ToggleSwitch checked={orderUpdates} onChange={setOrderUpdates} />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Emergency Alerts</p>
                      <p className="text-xs text-slate-500">Critical health alerts</p>
                    </div>
                    <ToggleSwitch checked={emergencyAlerts} onChange={setEmergencyAlerts} />
                  </div>
                </div>
              </div>
              
              <div className="border-t border-slate-200"></div>
              
              {/* Channel Preferences */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Notification Channels</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Email Notifications</p>
                      <p className="text-xs text-slate-500">Receive notifications via email</p>
                    </div>
                    <ToggleSwitch checked={emailNotifications} onChange={setEmailNotifications} />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Push Notifications</p>
                      <p className="text-xs text-slate-500">Browser and app push notifications</p>
                    </div>
                    <ToggleSwitch checked={pushNotifications} onChange={setPushNotifications} />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900">SMS Notifications</p>
                      <p className="text-xs text-slate-500">Receive notifications via text message</p>
                    </div>
                    <ToggleSwitch checked={smsNotifications} onChange={setSmsNotifications} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
