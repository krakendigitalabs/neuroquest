import type { UserProfile } from '@/models/user';

export function isAssignedTherapist(
  patient: Pick<UserProfile, 'therapistIds'> | null | undefined,
  therapistId: string | null | undefined,
) {
  return !!therapistId && Array.isArray(patient?.therapistIds) && patient.therapistIds.includes(therapistId);
}
