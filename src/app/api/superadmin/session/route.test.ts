import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const verifyIdTokenMock = vi.fn();

vi.mock('@/lib/firebase-admin', () => ({
  getAdminAuth: () => ({
    verifyIdToken: verifyIdTokenMock,
  }),
}));

vi.mock('@/lib/superadmin-config', () => ({
  isAllowedSuperadminEmail: (email: string) => email === 'krakendigitalabs@gmail.com',
  SUPERADMIN_COOKIE_NAME: 'nq-superadmin-unlocked',
  SUPERADMIN_SESSION_COOKIE_NAME: 'nq-superadmin-session',
}));

describe('superadmin session route', () => {
  beforeEach(() => {
    verifyIdTokenMock.mockReset();
  });

  it('rejects session creation when superadmin gate cookie is missing', async () => {
    const { POST } = await import('./route');

    const request = new NextRequest('http://localhost:9002/api/superadmin/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'test-token' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
  });

  it('creates a superadmin session when token and gate cookie are valid', async () => {
    const { POST } = await import('./route');
    verifyIdTokenMock.mockResolvedValue({
      uid: 'superadmin-1',
      email: 'krakendigitalabs@gmail.com',
    });

    const request = new NextRequest('http://localhost:9002/api/superadmin/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'nq-superadmin-unlocked=1',
      },
      body: JSON.stringify({ token: 'valid-token' }),
    });

    const response = await POST(request);
    const setCookie = response.headers.get('set-cookie') ?? '';

    expect(response.status).toBe(200);
    expect(setCookie).toContain('nq-superadmin-session=');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('clears both superadmin cookies on logout', async () => {
    const { DELETE } = await import('./route');

    const request = new NextRequest('http://localhost:9002/api/superadmin/session', {
      method: 'DELETE',
    });

    const response = await DELETE(request);
    expect(response.status).toBe(200);
    expect(response.cookies.get('nq-superadmin-session')?.value).toBe('');
    expect(response.cookies.get('nq-superadmin-unlocked')?.value).toBe('');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
});
