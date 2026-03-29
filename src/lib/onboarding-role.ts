import { UserRole } from '@/models/user';

export const PENDING_REQUESTED_ROLE_KEY = 'neuroquest-requested-role';

export function parseRequestedRole(value: string | null | undefined): UserRole | null {
  if (value === 'patient' || value === 'professional' || value === 'clinic') {
    return value;
  }

  return null;
}

export function readPendingRequestedRole(): UserRole | null {
  if (typeof window === 'undefined') return null;

  return parseRequestedRole(window.localStorage.getItem(PENDING_REQUESTED_ROLE_KEY));
}

export function persistPendingRequestedRole(role: UserRole) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(PENDING_REQUESTED_ROLE_KEY, role);
}

export function clearPendingRequestedRole() {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(PENDING_REQUESTED_ROLE_KEY);
}
