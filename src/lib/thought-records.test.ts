import { beforeEach, describe, expect, it, vi } from 'vitest';

const batch = {
  set: vi.fn(),
  update: vi.fn(),
  commit: vi.fn(),
};

const collectionMock = vi.fn();
const docMock = vi.fn();
const serverTimestampMock = vi.fn(() => 'SERVER_TIMESTAMP');
const writeBatchMock = vi.fn(() => batch);

vi.mock('firebase/firestore', () => ({
  collection: collectionMock,
  doc: docMock,
  serverTimestamp: serverTimestampMock,
  writeBatch: writeBatchMock,
}));

describe('thought record persistence', () => {
  beforeEach(() => {
    batch.set.mockReset();
    batch.update.mockReset();
    batch.commit.mockReset();
    batch.commit.mockResolvedValue(undefined);
    collectionMock.mockReset();
    docMock.mockReset();
    serverTimestampMock.mockClear();
    writeBatchMock.mockClear();

    collectionMock.mockReturnValue({ path: 'users/user-1/thoughtRecords' });
    docMock
      .mockReturnValueOnce({ path: 'users/user-1/thoughtRecords/generated-id' })
      .mockReturnValueOnce({ path: 'users/user-1' });
  });

  it('persists the thought and profile summary in a single batch', async () => {
    const { persistThoughtRecord } = await import('@/lib/thought-records');

    await persistThoughtRecord({
      firestore: {} as never,
      userId: 'user-1',
      thought: 'I may have contaminated my hands',
      situation: 'After touching a door handle',
      trigger: 'Public surfaces',
      emotion: 'anxiety',
      intensity: 8,
      compulsionUrge: 7,
      result: {
        isTOCRelated: true,
        analysis: 'The thought follows an OCD contamination loop.',
        reframingSuggestion: 'Notice the thought and delay the compulsion.',
      },
    });

    expect(batch.set).toHaveBeenCalledOnce();
    expect(batch.update).toHaveBeenCalledWith(
      { path: 'users/user-1' },
      expect.objectContaining({
        latestThoughtEmotion: 'anxiety',
        latestThoughtIntensity: 8,
        latestThoughtLabel: 'toc_thought',
        latestThoughtIsIntrusive: true,
      }),
    );
    expect(batch.commit).toHaveBeenCalledOnce();

    const payload = batch.set.mock.calls[0]?.[1];
    expect(payload).toEqual(
      expect.objectContaining({
        userId: 'user-1',
        thoughtText: 'I may have contaminated my hands',
        isFactNotThought: true,
        isThoughtNotFact: true,
        compulsionUrge: 7,
        source: 'observer',
      }),
    );
  });

  it('propagates batch commit failures to the caller', async () => {
    const { persistThoughtRecord } = await import('@/lib/thought-records');
    batch.commit.mockRejectedValueOnce(new Error('permission-denied'));

    await expect(
      persistThoughtRecord({
        firestore: {} as never,
        userId: 'user-1',
        thought: 'A valid thought',
        situation: '',
        trigger: '',
        emotion: 'fear',
        intensity: 5,
        compulsionUrge: 2,
        result: {
          isTOCRelated: false,
          analysis: 'General anxious thought.',
          reframingSuggestion: 'Pause before reacting.',
        },
      }),
    ).rejects.toThrow('permission-denied');
  });

  it('normalizes legacy thought records safely', async () => {
    const { normalizeThoughtRecord } = await import('@/lib/thought-records');

    expect(
      normalizeThoughtRecord({
        id: 'legacy-1',
        thoughtText: '  Intrusive thought  ',
        intensity: 15,
        compulsionUrge: -3,
        associatedEmotion: ' fear ',
        isFactNotThought: true,
        recordedAt: 'invalid date',
      }),
    ).toEqual(
      expect.objectContaining({
        id: 'legacy-1',
        thoughtText: 'Intrusive thought',
        intensity: 10,
        compulsionUrge: 0,
        associatedEmotion: 'fear',
        isThoughtNotFact: true,
        isFactNotThought: true,
      }),
    );
  });
});
