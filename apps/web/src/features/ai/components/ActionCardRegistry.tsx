import React from 'react';
import { DoctorCard, AppointmentCard, MedicationCard, LabCard, NavigationCard } from './ActionCards';

export type ActionPayload = Record<string, unknown>;

export interface ActionCardProps {
  payload: ActionPayload;
  onAction?: (actionType: string, data: unknown) => void;
}

type ActionCardComponent = React.ComponentType<ActionCardProps>;

const registry = new Map<string, ActionCardComponent>();

export function registerActionCard(type: string, component: ActionCardComponent) {
  registry.set(type, component);
}

// Register default cards
registerActionCard('find_doctor', ({ payload, onAction }) => {
  const result = payload?.result || [];
  return (
    <div className="flex flex-col gap-2 mt-2">
      {Array.isArray(result) && result.map((doc: Record<string, unknown>) => (
        <DoctorCard 
          key={String(doc.id)} 
          doctor={doc as never} 
          onBook={() => onAction?.('send_message', `Book an appointment with doctor ${doc.id} for tomorrow`)}
        />
      ))}
    </div>
  );
});

registerActionCard('book_appointment', ({ payload }) => {
  const result = payload?.result || {};
  if (!(result as Record<string, unknown>).success) return null;
  return <AppointmentCard appointment={result as never} />;
});

registerActionCard('fetch_medications', ({ payload }) => {
  const result = payload?.result || [];
  return (
    <div className="flex flex-col gap-2 mt-2">
      {Array.isArray(result) && result.map((med: Record<string, unknown>, i: number) => (
        <MedicationCard key={i} medication={med as never} />
      ))}
    </div>
  );
});

registerActionCard('fetch_lab_reports', ({ payload }) => {
  const result = payload?.result || [];
  return (
    <div className="flex flex-col gap-2 mt-2">
      {Array.isArray(result) && result.map((lab: Record<string, unknown>, i: number) => (
        <LabCard key={i} lab={lab as never} />
      ))}
    </div>
  );
});

registerActionCard('navigate', ({ payload }) => {
  const result = payload?.result || {};
  if (!(result as Record<string, unknown>).target) return null;
  const target = String((result as Record<string, unknown>).target);
  return <NavigationCard target={target} label={`Go to ${target.replace('/', '')}`} />;
});

export function ActionCardRenderer({ action, onAction }: { action: { type: string; payload: Record<string, unknown> }, onAction?: (actionType: string, data: unknown) => void }) {
  const cardComponent = registry.get(action.type);
  if (!cardComponent) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 mt-2 text-xs text-slate-500 font-mono">
        Executed action: {action.type}
      </div>
    );
  }
  return React.createElement(cardComponent, { payload: action.payload, onAction });
}
