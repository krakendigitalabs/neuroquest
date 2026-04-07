import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const verifyIdTokenMock = vi.fn();
const adminSetMock = vi.fn();
const userSetMock = vi.fn();
const userGetMock = vi.fn();

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: () => 'SERVER_TIMESTAMP',
  },
}));

vi.mock('@/lib/firebase-admin', () => ({
  getAdminAuth: () => ({
    verifyIdToken: verifyIdTokenMock,
  }),
  getAdminDb: () => ({
    collection: (name: string) => ({
      doc: (_id: string) => {
        if (name === 'roles_admin') {
          return {
            set: adminSetMock,
          };
        }

        return {
          get: userGetMock,
          set: userSetMock,
        };
      },
    }),
  }),
}));

vi.mock('@/lib/superadmin-config', () => ({
  isAllowedSuperadminEmail: (email: string) => email === 'krakendigitalabs@gmail.com',
  SUPERADMIN_COOKIE_NAME: 'nq-superadmin-unlocked',
}));

describe('superadmin bootstrap route', () => {
  beforeEach(() => {
    verifyIdTokenMock.mockReset();
    adminSetMock.mockReset();
    userSetMock.mockReset();
    userGetMock.mockReset();
    userGetMock.mockResolvedValue({ exists: false, data: () => null });
  });

  it('rejects bootstrap when gate cookie is missing', async () => {
    const { POST } = await import('./route');

    const request = new NextRequest('http://localhost:9002/api/superadmin/bootstrap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'valid-token' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('rejects bootstrap when token is missing', async () => {
    const { POST } = await import('./route');

    const request = new NextRequest('http://localhost:9002/api/superadmin/bootstrap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'nq-superadmin-unlocked=1',
      },
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('bootstraps superadmin profile when gate cookie and token are valid', async () => {
    const { POST } = await import('./route');
    verifyIdTokenMock.mockResolvedValue({
      uid: 'superadmin-1',
      email: 'krakendigitalabs@gmail.com',
      name: 'Super Admin',
      picture: 'https://example.com/avatar.png',
    });

    const request = new NextRequest('http://localhost:9002/api/superadmin/bootstrap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'nq-superadmin-unlocked=1',
      },
      body: JSON.stringify({ token: 'valid-token' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(adminSetMock).toHaveBeenCalledOnce();
    expect(userSetMock).toHaveBeenCalledOnce();
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
});
