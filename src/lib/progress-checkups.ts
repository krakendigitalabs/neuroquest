import type { MentalCheckInLevel } from '@/lib/mental-check-in';
import type { MentalCheckup } from '@/models/mental-checkup';
import { toDate } from '@/lib/thought-insights';

export type ProgressCheckup = {
  id: string;
  createdAt: Date | null;
  score: number;
  maxScore: number;
  level: MentalCheckInLevel;
  resultTitle: string;
};

function isMentalCheckInLevel(value: unknown): value is MentalCheckInLevel {
  return value === 'healthy' || value === 'mild' || value === 'moderate' || value === 'severe';
}

export function normalizeProgressCheckup(checkup: Partial<MentalCheckup> & { id?: string }, index: number): ProgressCheckup | null {
  const score = typeof checkup.score === 'number' && Number.isFinite(checkup.score) ? checkup.score : null;
  if (score === null) return null;

  return {
    id: checkup.id ?? `checkup-${index}`,
    createdAt: toDate(checkup.createdAt),
    score,
    maxScore:
      typeof checkup.maxScore === 'number' && Number.isFinite(checkup.maxScore) && checkup.maxScore > 0
        ? checkup.maxScore
        : 0,
    level: isMentalCheckInLevel(checkup.level) ? checkup.level : 'moderate',
    resultTitle:
      typeof checkup.resultTitle === 'string' && checkup.resultTitle.trim().length > 0
        ? checkup.resultTitle
        : `Check-in ${index + 1}`,
  };
}

export function normalizeProgressCheckups(checkups: Array<Partial<MentalCheckup> & { id?: string }> | null | undefined) {
  return (checkups ?? [])
    .map((checkup, index) => normalizeProgressCheckup(checkup, index))
    .filter((checkup): checkup is ProgressCheckup => checkup !== null)
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
}
