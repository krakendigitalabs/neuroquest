import type { MentalCheckInLevel, MentalCheckInThreshold } from '@/lib/mental-check-in';

export const CLINICAL_MENTAL_CHECK_IN_THRESHOLDS: MentalCheckInThreshold[] = [
  { level: 'healthy', maxScore: 7 },
  { level: 'mild', maxScore: 15 },
  { level: 'moderate', maxScore: 27 },
  { level: 'severe', maxScore: 40 },
];

export const CLINICAL_LEVEL_ORDER: MentalCheckInLevel[] = ['healthy', 'mild', 'moderate', 'severe'];
