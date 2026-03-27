import { describe, expect, it } from 'vitest';
import { getProgressMetrics, normalizeProgressCheckups } from '@/lib/progress-checkups';

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

  it('does not fabricate a trend when there is no previous comparison block', () => {
    const history = normalizeProgressCheckups([
      {
        id: 'one',
        createdAt: '2026-03-20T10:00:00.000Z',
        score: 8,
        maxScore: 40,
        level: 'mild',
        resultTitle: 'Mild check-in',
      },
      {
        id: 'two',
        createdAt: '2026-03-26T10:00:00.000Z',
        score: 18,
        maxScore: 40,
        level: 'moderate',
        resultTitle: 'Moderate check-in',
      },
    ]);

    const metrics = getProgressMetrics(history);

    expect(metrics.latestAverage).toBe(13);
    expect(metrics.previousAverage).toBeNull();
    expect(metrics.trendDirection).toBeNull();
    expect(metrics.trendDelta).toBeNull();
  });
});
