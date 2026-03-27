import { describe, expect, it } from 'vitest';
import { calculateMentalCheckInScore, getMentalCheckInLevel } from '@/lib/mental-check-in';

describe('mental check-in clinical logic', () => {
  it('calculates the total score from 10 real answers with values from 0 to 4', () => {
    const answers = Array.from({ length: 10 }, (_, index) => ({
      questionId: index + 1,
      question: `Question ${index + 1}`,
      value: 4,
    }));

    expect(calculateMentalCheckInScore(answers)).toBe(40);
  });

  it('classifies clinical levels using the configured thresholds', () => {
    expect(getMentalCheckInLevel(0)).toBe('healthy');
    expect(getMentalCheckInLevel(7)).toBe('healthy');
    expect(getMentalCheckInLevel(8)).toBe('mild');
    expect(getMentalCheckInLevel(15)).toBe('mild');
    expect(getMentalCheckInLevel(16)).toBe('moderate');
    expect(getMentalCheckInLevel(27)).toBe('moderate');
    expect(getMentalCheckInLevel(28)).toBe('severe');
    expect(getMentalCheckInLevel(40)).toBe('severe');
  });
});
