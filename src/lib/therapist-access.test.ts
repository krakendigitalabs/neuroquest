import { describe, expect, it } from 'vitest';
import { isAssignedTherapist } from '@/lib/therapist-access';

describe('therapist access', () => {
  it('allows assigned therapists only', () => {
    expect(isAssignedTherapist({ therapistIds: ['therapist-1', 'therapist-2'] }, 'therapist-1')).toBe(true);
    expect(isAssignedTherapist({ therapistIds: ['therapist-1', 'therapist-2'] }, 'therapist-3')).toBe(false);
    expect(isAssignedTherapist({ therapistIds: [] }, 'therapist-1')).toBe(false);
  });
});
