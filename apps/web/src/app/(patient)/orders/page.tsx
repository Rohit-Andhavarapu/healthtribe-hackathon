'use client';

import React from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@healthtribe/ui';
import { Loader2, Package, Truck, CheckCircle, Clock, XCircle, ShoppingBag } from 'lucide-react';
import { usePatientMedicationOrders } from '@/features/clinical/hooks/usePatientMedicationOrders';
import { usePatientMedications } from '@/features/clinical/hooks/usePatientMedications';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { format } from 'date-fns';

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PLACED: <Clock className="w-5 h-5 text-slate-500" />,
  CONFIRMED: <CheckCircle className="w-5 h-5 text-indigo-500" />,
  PACKED: <Package className="w-5 h-5 text-amber-500" />,
  DISPATCHED: <Truck className="w-5 h-5 text-blue-500" />,
  OUT_FOR_DELIVERY: <Truck className="w-5 h-5 text-indigo-600" />,
  DELIVERED: <CheckCircle className="w-5 h-5 text-emerald-600" />,
  CANCELLED: <XCircle className="w-5 h-5 text-red-500" />,
};

const STATUS_COLORS: Record<string, string> = {
  PLACED: 'bg-slate-100 text-slate-700',
  CONFIRMED: 'bg-indigo-50 text-indigo-700',
  PACKED: 'bg-amber-50 text-amber-700',
  DISPATCHED: 'bg-blue-50 text-blue-700',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-red-50 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  PLACED: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  DISPATCHED: 'Dispatched',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function PatientOrdersPage() {
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const patientId = profile?.user_id;

  const { data: orders, isLoading: isLoadingOrders } = usePatientMedicationOrders(patientId || undefined);
  const { data: medications, isLoading: isLoadingMeds } = usePatientMedications(patientId || '');

  if (isLoadingOrders || isLoadingMeds || isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Sort orders by most recent first, assuming ID or basic ordering if no created_at available.
  // Actually, let's just reverse them so newest are first.
  const sortedOrders = orders ? [...orders].reverse() : [];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-100 p-3 rounded-xl text-indigo-700">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pharmacy Orders</h1>
          <p className="text-slate-500 mt-1">Track your medication deliveries and order history.</p>
        </div>
      </div>

      {sortedOrders.length === 0 ? (
        <Card className="border-dashed bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-slate-500">
            <Package className="w-12 h-12 mb-4 text-slate-300" />
            <p className="font-medium text-lg text-slate-700">No Orders Found</p>
            <p className="text-sm mt-1">You do not have any pharmacy orders yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {sortedOrders.map((order) => {
            const orderMeds = medications?.filter((m: any) => order.medication_ids.includes(m.id)) || [];
            
            return (
              <Card key={order.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="bg-slate-50 border-b border-slate-100 p-4 md:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Order ID</p>
                    <p className="font-mono text-sm text-slate-900">{order.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-700'}`}>
                      {STATUS_ICONS[order.status] || <Clock className="w-4 h-4" />}
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                </div>
                
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {orderMeds.length === 0 ? (
                      <div className="p-6 text-sm text-slate-500 italic">No medication details available for this order.</div>
                    ) : (
                      orderMeds.map((med: any) => (
                        <div key={med.id} className="p-4 md:p-6 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-emerald-600 mt-1">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                              {med.name}
                              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                {med.dosage}
                              </span>
                            </h4>
                            <div className="mt-2 space-y-1 text-sm text-slate-600">
                              <p><span className="font-medium text-slate-700">Frequency:</span> {med.frequency}</p>
                              <p><span className="font-medium text-slate-700">Duration:</span> {med.duration}</p>
                              {med.instructions && (
                                <p className="text-slate-500 bg-slate-50 p-2 rounded-md border border-slate-100 mt-2">
                                  <span className="font-medium">Instructions:</span> {med.instructions}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
