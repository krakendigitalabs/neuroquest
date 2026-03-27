import { describe, expect, it } from 'vitest';
import { normalizeProgressCheckups } from '@/lib/progress-checkups';

describe('progress checkup normalization', () => {
  it('filters invalid records and sorts the remaining history', () => {
    const result = normalizeProgressCheckups([
      {
        id: 'older',
        createdAt: '2026-03-20T10:00:00.000Z',
        score: 8,
        maxScore: 40,
        level: 'mild',
        resultTitle: 'Mild check-in',
      },
      {
        id: 'invalid',
        createdAt: '2026-03-27T10:00:00.000Z',
        maxScore: 40,
        level: 'severe',
      },
      {
        id: 'latest',
        createdAt: '2026-03-26T10:00:00.000Z',
        score: 18,
        maxScore: 40,
        level: 'moderate',
        resultTitle: 'Moderate check-in',
      },
    ]);

    expect(result.map((checkup) => checkup.id)).toEqual(['latest', 'older']);
  });
});
