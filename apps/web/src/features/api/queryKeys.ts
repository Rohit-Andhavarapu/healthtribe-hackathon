export const queryKeys = {
  appointments: {
    all: ['appointments'] as const,
    patient: (id: string) => ['appointments', 'patient', id] as const,
    doctor: (id: string) => ['appointments', 'doctor', id] as const,
  },
  timeline: {
    all: ['timeline'] as const,
    patient: (id: string) => ['timeline', 'patient', id] as const,
  },
  profile: {
    all: ['profile'] as const,
    detail: (id: string) => ['profile', id] as const,
  },
  doctors: {
    all: ['doctors'] as const,
    detail: (id: string) => ['doctors', id] as const,
  },
  labs: {
    all: ['labs'] as const,
    patient: (id: string) => ['labs', 'patient', id] as const,
  }
};
