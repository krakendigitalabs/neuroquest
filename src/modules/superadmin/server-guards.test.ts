import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireSuperadminServerUserMock = vi.fn();
const redirectMock = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock('@/modules/superadmin/server-session', () => ({
  requireSuperadminServerUser: requireSuperadminServerUserMock,
}));

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}));

describe('requireSuperadminAccess', () => {
  beforeEach(() => {
    requireSuperadminServerUserMock.mockReset();
    redirectMock.mockClear();
  });

  it('returns decoded superadmin user when session is valid', async () => {
    const decoded = {
      uid: 'superadmin-1',
      email: 'krakendigitalabs@gmail.com',
    };
    requireSuperadminServerUserMock.mockResolvedValue(decoded);

    const { requireSuperadminAccess } = await import('./server-guards');
    const result = await requireSuperadminAccess();

    expect(result).toEqual(decoded);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('redirects to /superadmin when session is invalid', async () => {
    requireSuperadminServerUserMock.mockRejectedValue(new Error('unauthorized'));

    const { requireSuperadminAccess } = await import('./server-guards');

    await expect(requireSuperadminAccess()).rejects.toThrow('NEXT_REDIRECT:/superadmin');
    expect(redirectMock).toHaveBeenCalledWith('/superadmin');
  });
});
