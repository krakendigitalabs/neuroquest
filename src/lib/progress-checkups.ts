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

export type ProgressMetrics = {
  latestAverage: number | null;
  previousAverage: number | null;
  latestLevel: MentalCheckInLevel | null;
  trendDirection: 'up' | 'down' | 'stable' | null;
  trendDelta: number | null;
  latestFive: ProgressCheckup[];
  trendData: ProgressCheckup[];
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

function average(numbers: number[]) {
  if (!numbers.length) return null;
  return Math.round((numbers.reduce((sum, value) => sum + value, 0) / numbers.length) * 10) / 10;
}

function getTrendDirection(latestAverage: number, previousAverage: number) {
  if (previousAverage === 0 && latestAverage === 0) return 'stable';
  const delta = latestAverage - previousAverage;
  if (delta >= 1) return 'up';
  if (delta <= -1) return 'down';
  return 'stable';
}

export function getProgressMetrics(checkups: ProgressCheckup[]): ProgressMetrics {
  const latestFive = checkups.slice(0, 5);
  const previousFive = checkups.slice(5, 10);
  const latestAverage = average(latestFive.map((checkup) => checkup.score));
  const previousAverage = average(previousFive.map((checkup) => checkup.score));
  const latestLevel = checkups[0]?.level ?? null;

  if (latestAverage === null) {
    return {
      latestAverage: null,
      previousAverage: null,
      latestLevel,
      trendDirection: null,
      trendDelta: null,
      latestFive,
      trendData: checkups.slice(0, 7),
    };
  }

  if (previousAverage === null) {
    return {
      latestAverage,
      previousAverage: null,
      latestLevel,
      trendDirection: null,
      trendDelta: null,
      latestFive,
      trendData: checkups.slice(0, 7),
    };
  }

  return {
    latestAverage,
    previousAverage,
    latestLevel,
    trendDirection: getTrendDirection(latestAverage, previousAverage),
    trendDelta: Math.round((latestAverage - previousAverage) * 10) / 10,
    latestFive,
    trendData: checkups.slice(0, 7),
  };
}
