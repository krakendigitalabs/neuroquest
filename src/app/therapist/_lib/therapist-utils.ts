import type { UserProfile } from '@/models/user';

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

export function getPatientStatus(level?: string) {
  return level === 'severe' ? 'needs_attention' : 'active';
}

export function getLatestPatientActivityDate(patient: Pick<UserProfile, 'latestCheckInAt' | 'latestThoughtAt'>) {
  const latestCheckIn = toDate(patient.latestCheckInAt);
  const latestThought = toDate(patient.latestThoughtAt);

  if (!latestCheckIn) return latestThought;
  if (!latestThought) return latestCheckIn;

  return latestCheckIn > latestThought ? latestCheckIn : latestThought;
}
