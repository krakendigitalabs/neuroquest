import { beforeEach, describe, expect, it, vi } from 'vitest';

const batch = {
  set: vi.fn(),
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

describe('mental check-in persistence', () => {
  beforeEach(() => {
    batch.set.mockReset();
    batch.commit.mockReset();
    batch.commit.mockResolvedValue(undefined);
    collectionMock.mockReset();
    docMock.mockReset();
    serverTimestampMock.mockClear();
    writeBatchMock.mockClear();

    collectionMock.mockReturnValue({ path: 'users/user-1/mental_checkups' });
    docMock
      .mockReturnValueOnce({ path: 'users/user-1/mental_checkups/generated-id' })
      .mockReturnValueOnce({ path: 'users/user-1' });
  });

  it('persists the check-in log and denormalized user summary atomically', async () => {
    const { persistMentalCheckIn } = await import('@/lib/check-in-records');

    await persistMentalCheckIn({
      firestore: {} as never,
      userId: 'user-1',
      patientName: 'Pat Doe',
      score: 18,
      maxScore: 40,
      level: 'moderate',
      resultTitle: 'Moderate impact',
      mission: 'Observe the thought and delay reassurance',
      summary: 'Moderate symptoms detected',
      answers: [
        { questionId: 1, question: 'Q1', value: 2 },
        { questionId: 2, question: 'Q2', value: 3 },
      ],
      recommendations: {
        daily: ['Task 1'],
        family: [],
        partner: [],
        work: [],
        study: [],
        exercise: [],
        readings: [],
      },
      riskFlags: {
        selfHarmRisk: false,
        needsProfessionalSupport: false,
      },
      professionalNote: 'Monitor symptoms',
    });

    expect(batch.set).toHaveBeenCalledTimes(2);
    expect(batch.set.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({
        userId: 'user-1',
        score: 18,
        maxScore: 40,
        level: 'moderate',
        professionalNote: 'Monitor symptoms',
      }),
    );
    expect(batch.set.mock.calls[1]?.[1]).toEqual(
      expect.objectContaining({
        latestCheckInScore: 18,
        latestCheckInLevel: 'moderate',
        latestCheckInNote: 'Monitor symptoms',
      }),
    );
    expect(batch.set.mock.calls[1]?.[2]).toEqual({ merge: true });
    expect(batch.commit).toHaveBeenCalledOnce();
  });
});
