import type { MentalCheckInLevel, MentalCheckInThreshold } from '@/lib/mental-check-in';

// TODO(clinical-approval): Confirm these threshold ranges with licensed clinical leadership.
// Current values are an implementation assumption to support MVP triage behavior.
export const CLINICAL_MENTAL_CHECK_IN_THRESHOLDS: MentalCheckInThreshold[] = [
  { level: 'healthy', maxScore: 7 },
  { level: 'mild', maxScore: 15 },
  { level: 'moderate', maxScore: 27 },
  { level: 'severe', maxScore: 40 },
];

export const CLINICAL_LEVEL_ORDER: MentalCheckInLevel[] = ['healthy', 'mild', 'moderate', 'severe'];
export const CLINICAL_MENTAL_CHECK_IN_MAX_SCORE =
  CLINICAL_MENTAL_CHECK_IN_THRESHOLDS[CLINICAL_MENTAL_CHECK_IN_THRESHOLDS.length - 1]?.maxScore ?? 40;

export const CLINICAL_MENTAL_CHECK_IN_QUESTION_COUNT = 10;
export const CLINICAL_MENTAL_CHECK_IN_ANSWER_RANGE = {
  min: 0,
  max: 4,
};
