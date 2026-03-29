import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearPendingRequestedRole,
  parseRequestedRole,
  persistPendingRequestedRole,
  readPendingRequestedRole,
} from './onboarding-role';

describe('onboarding-role helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('accepts only supported roles', () => {
    expect(parseRequestedRole('patient')).toBe('patient');
    expect(parseRequestedRole('professional')).toBe('professional');
    expect(parseRequestedRole('clinic')).toBe('clinic');
    expect(parseRequestedRole('admin')).toBeNull();
    expect(parseRequestedRole(null)).toBeNull();
  });

  it('persists and clears the pending requested role', () => {
    persistPendingRequestedRole('professional');

    expect(readPendingRequestedRole()).toBe('professional');

    clearPendingRequestedRole();

    expect(readPendingRequestedRole()).toBeNull();
  });
});
