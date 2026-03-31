/* @vitest-environment node */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

const ORIGINAL_SECRET = process.env.SUPERADMIN_UNLOCK_SECRET;
const ORIGINAL_TTL = process.env.SUPERADMIN_UNLOCK_TTL_SECONDS;

const verifyIdTokenMock = vi.fn();
const userGetMock = vi.fn();
const userSetMock = vi.fn();
const adminSetMock = vi.fn();

vi.mock('@/lib/firebase-admin', () => ({
  getAdminAuth: () => ({
    verifyIdToken: verifyIdTokenMock,
  }),
  getAdminDb: () => ({
    collection: (name: string) => ({
      doc: () => {
        if (name === 'users') {
          return { get: userGetMock, set: userSetMock };
        }

        return { set: adminSetMock };
      },
    }),
  }),
}));

let bootstrapRoute: typeof import('@/app/api/superadmin/bootstrap/route');
let superadminConfig: typeof import('@/lib/superadmin-config');

describe('superadmin bootstrap API', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.resetAllMocks();
    verifyIdTokenMock.mockResolvedValue({
      uid: 'bootstrap-user',
      email: 'krakendigitalabs@gmail.com',
      name: 'Super Admin',
      picture: 'photo',
    });

    userGetMock.mockResolvedValue({ exists: false });

    process.env.SUPERADMIN_UNLOCK_SECRET = 'test-boot-secret';
    process.env.SUPERADMIN_UNLOCK_TTL_SECONDS = '5';

    superadminConfig = await import('@/lib/superadmin-config');
    bootstrapRoute = await import('@/app/api/superadmin/bootstrap/route');
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
  });

  it('requires unlock to bootstrap the profile', async () => {
    const request = new NextRequest('https://test.local/api/superadmin/bootstrap', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ token: 'id-token' }),
    });

    const response = await bootstrapRoute.POST(request);
    expect(response.status).toBe(401);
    const payload = await response.json();
    expect(payload.error).toBe('unlock-required');
    expect(userSetMock).not.toHaveBeenCalled();
    expect(adminSetMock).not.toHaveBeenCalled();
  });

  it('allows bootstrap once unlock token is valid', async () => {
    const token = superadminConfig.createSuperadminUnlockToken();
    const request = new NextRequest('https://test.local/api/superadmin/bootstrap', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `${superadminConfig.SUPERADMIN_COOKIE_NAME}=${token}`,
      },
      body: JSON.stringify({ token: 'id-token' }),
    });

    const response = await bootstrapRoute.POST(request);
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({ ok: true });
    expect(userSetMock).toHaveBeenCalled();
    expect(adminSetMock).toHaveBeenCalled();
  });
});
