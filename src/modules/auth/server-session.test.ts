import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookiesMock = vi.fn();
const headersMock = vi.fn();
const verifyIdTokenMock = vi.fn();

vi.mock('server-only', () => ({}));

vi.mock('next/headers', () => ({
  cookies: cookiesMock,
  headers: headersMock,
}));

vi.mock('@/lib/firebase-admin', () => ({
  getAdminAuth: () => ({
    verifyIdToken: verifyIdTokenMock,
  }),
}));

describe('server-session token resolution', () => {
  beforeEach(() => {
    cookiesMock.mockReset();
    headersMock.mockReset();
    verifyIdTokenMock.mockReset();
  });

  it('prioritizes cookie token when present', async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) => (name === 'nq_id_token' ? { value: 'cookie-token' } : undefined),
    });
    headersMock.mockResolvedValue({
      get: () => null,
    });

    const { readServerIdTokenCookie } = await import('./server-session');
    const token = await readServerIdTokenCookie();

    expect(token).toBe('cookie-token');
  });

  it('uses bearer token when cookie is missing', async () => {
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });
    headersMock.mockResolvedValue({
      get: (name: string) => (name.toLowerCase() === 'authorization' ? 'Bearer bearer-token' : null),
    });

    const { readServerIdTokenCookie } = await import('./server-session');
    const token = await readServerIdTokenCookie();

    expect(token).toBe('bearer-token');
  });

  it('uses x-nq-id-token when no cookie or bearer token exist', async () => {
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });
    headersMock.mockResolvedValue({
      get: (name: string) => (name.toLowerCase() === 'x-nq-id-token' ? 'header-token' : null),
    });

    const { readServerIdTokenCookie } = await import('./server-session');
    const token = await readServerIdTokenCookie();

    expect(token).toBe('header-token');
  });
});

describe('requireServerUser', () => {
  beforeEach(() => {
    cookiesMock.mockReset();
    headersMock.mockReset();
    verifyIdTokenMock.mockReset();
  });

  it('verifies decoded token when auth token exists', async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) => (name === 'nq_id_token' ? { value: 'cookie-token' } : undefined),
    });
    headersMock.mockResolvedValue({
      get: () => null,
    });
    verifyIdTokenMock.mockResolvedValue({
      uid: 'user-1',
      email: 'user@example.com',
    });

    const { requireServerUser } = await import('./server-session');
    const decoded = await requireServerUser();

    expect(decoded.uid).toBe('user-1');
    expect(verifyIdTokenMock).toHaveBeenCalledWith('cookie-token', true);
  });

  it('throws unauthenticated when no token is available', async () => {
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });
    headersMock.mockResolvedValue({
      get: () => null,
    });

    const { requireServerUser } = await import('./server-session');

    await expect(requireServerUser()).rejects.toThrow('unauthenticated');
    expect(verifyIdTokenMock).not.toHaveBeenCalled();
  });
});
