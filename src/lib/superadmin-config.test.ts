/* @vitest-environment node */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

const ORIGINAL_SECRET = process.env.SUPERADMIN_UNLOCK_SECRET;
const ORIGINAL_TTL = process.env.SUPERADMIN_UNLOCK_TTL_SECONDS;

let superadminConfig: typeof import('@/lib/superadmin-config');

describe('superadmin unlock tokens', () => {
  beforeEach(async () => {
    vi.resetModules();
    process.env.SUPERADMIN_UNLOCK_SECRET = 'test-superadmin-secret';
    process.env.SUPERADMIN_UNLOCK_TTL_SECONDS = '5';
    superadminConfig = await import('@/lib/superadmin-config');
  });

  afterEach(() => {
    if (ORIGINAL_SECRET === undefined) {
      delete process.env.SUPERADMIN_UNLOCK_SECRET;
    } else {
      process.env.SUPERADMIN_UNLOCK_SECRET = ORIGINAL_SECRET;
    }

    if (ORIGINAL_TTL === undefined) {
      delete process.env.SUPERADMIN_UNLOCK_TTL_SECONDS;
    } else {
      process.env.SUPERADMIN_UNLOCK_TTL_SECONDS = ORIGINAL_TTL;
    }

    vi.useRealTimers();
  });

  it('denies route access without any unlock payload', () => {
    expect(superadminConfig.isValidSuperadminUnlockToken(undefined)).toBe(false);
  });

  it('allows route access while the unlock token remains valid', () => {
    const token = superadminConfig.createSuperadminUnlockToken();
    expect(superadminConfig.isValidSuperadminUnlockToken(token)).toBe(true);
  });

  it('rejects expired or tampered unlock tokens', () => {
    const token = superadminConfig.createSuperadminUnlockToken();
    vi.useFakeTimers();
    vi.setSystemTime(
      Date.now() + 1000 * (Number(process.env.SUPERADMIN_UNLOCK_TTL_SECONDS ?? '0') + 10)
    );
    expect(superadminConfig.isValidSuperadminUnlockToken(token)).toBe(false);
    vi.useRealTimers();
    expect(superadminConfig.isValidSuperadminUnlockToken(`${token}bad`)).toBe(false);
  });
});
