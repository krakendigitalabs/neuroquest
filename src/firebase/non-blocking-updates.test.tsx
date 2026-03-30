import { describe, expect, it, vi, beforeEach } from 'vitest';

const addDocMock = vi.fn();
const setDocMock = vi.fn();
const updateDocMock = vi.fn();
const deleteDocMock = vi.fn();

vi.mock('firebase/firestore', () => ({
  addDoc: addDocMock,
  setDoc: setDocMock,
  updateDoc: updateDocMock,
  deleteDoc: deleteDocMock,
}));

describe('non-blocking Firestore updates', () => {
  beforeEach(() => {
    addDocMock.mockReset();
    setDocMock.mockReset();
    updateDocMock.mockReset();
    deleteDocMock.mockReset();
    vi.restoreAllMocks();
  });

  it('logs write failures instead of throwing when a non-blocking create fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    addDocMock.mockRejectedValueOnce(new Error('permission-denied'));

    const { addDocumentNonBlocking } = await import('./non-blocking-updates');

    await expect(
      addDocumentNonBlocking({ path: 'users/user-1/progressEvents' } as never, { foo: 'bar' })
    ).resolves.toBeUndefined();

    expect(warnSpy).toHaveBeenCalledWith(
      '[firebase] non-blocking create failed for users/user-1/progressEvents',
      expect.any(Error)
    );
  });
});
