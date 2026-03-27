import type { CheckupAnswer } from '@/models/mental-checkup';
import { CLINICAL_MENTAL_CHECK_IN_MAX_SCORE, CLINICAL_MENTAL_CHECK_IN_THRESHOLDS } from '@/config/clinical';

export type MentalCheckInLevel = 'healthy' | 'mild' | 'moderate' | 'severe';
export type MentalCheckInThreshold = {
  level: MentalCheckInLevel;
  maxScore: number;
};

export const CHECK_IN_MAX_SCORE = CLINICAL_MENTAL_CHECK_IN_MAX_SCORE;
export const MENTAL_CHECK_IN_THRESHOLDS: MentalCheckInThreshold[] = CLINICAL_MENTAL_CHECK_IN_THRESHOLDS;

export function calculateMentalCheckInScore(answers: CheckupAnswer[]) {
  return answers.reduce((sum, answer) => sum + answer.value, 0);
}

export function getMentalCheckInLevel(
  score: number,
  thresholds: MentalCheckInThreshold[] = MENTAL_CHECK_IN_THRESHOLDS,
): MentalCheckInLevel {
  const match = thresholds.find((threshold) => score <= threshold.maxScore);
  return match?.level ?? 'severe';
}

export function getCheckInTrendLabel(latestAverage: number, previousAverage: number) {
  if (previousAverage === 0 && latestAverage === 0) return 'stable';
  const delta = latestAverage - previousAverage;
  if (delta >= 1) return 'up';
  if (delta <= -1) return 'down';
  return 'stable';
}
