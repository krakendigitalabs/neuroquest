import type { ThoughtRecord } from '@/models/thought-record';

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

function isWithinLastDays(value: unknown, days: number, now: Date) {
  const date = toDate(value);
  if (!date) return false;
  const threshold = new Date(now);
  threshold.setDate(threshold.getDate() - days);
  return date >= threshold;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getThoughtRiskLevel(thought: ThoughtRecord) {
  const intensity = thought.intensity ?? 0;
  const compulsionUrge = thought.compulsionUrge ?? 0;

  if (intensity >= 8 || compulsionUrge >= 8) return 'high';
  if (intensity >= 5 || compulsionUrge >= 5 || thought.isIntrusive) return 'medium';
  return 'low';
}

export function getTopEmotion(thoughts: ThoughtRecord[]) {
  const counts = new Map<string, number>();

  for (const thought of thoughts) {
    if (!thought.associatedEmotion) continue;
    counts.set(thought.associatedEmotion, (counts.get(thought.associatedEmotion) ?? 0) + 1);
  }

  let topEmotion: string | null = null;
  let maxCount = 0;

  for (const [emotion, count] of counts.entries()) {
    if (count > maxCount) {
      topEmotion = emotion;
      maxCount = count;
    }
  }

  return topEmotion;
}

export function buildThoughtInsights(thoughts: ThoughtRecord[], now = new Date()) {
  const recentThoughts = thoughts.filter((thought) => isWithinLastDays(thought.recordedAt, 7, now));
  const intrusiveThoughts = thoughts.filter((thought) => thought.isIntrusive);
  const highRiskThoughts = recentThoughts.filter((thought) => getThoughtRiskLevel(thought) === 'high');
  const intensityValues = thoughts.map((thought) => thought.intensity).filter((value): value is number => typeof value === 'number');
  const urgeValues = thoughts
    .map((thought) => thought.compulsionUrge)
    .filter((value): value is number => typeof value === 'number');

  return {
    totalCount: thoughts.length,
    recentCount: recentThoughts.length,
    intrusiveCount: intrusiveThoughts.length,
    intrusiveRate: thoughts.length ? Math.round((intrusiveThoughts.length / thoughts.length) * 100) : 0,
    averageIntensity: Math.round(average(intensityValues) * 10) / 10,
    averageCompulsionUrge: Math.round(average(urgeValues) * 10) / 10,
    topEmotion: getTopEmotion(recentThoughts.length ? recentThoughts : thoughts),
    highRiskCount: highRiskThoughts.length,
  };
}

export function buildThoughtTimeline(thoughts: ThoughtRecord[], days = 7, now = new Date()) {
  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (days - index - 1));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count: 0,
      averageIntensity: 0,
      totalIntensity: 0,
    };
  });

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  for (const thought of thoughts) {
    const date = toDate(thought.recordedAt);
    if (!date) continue;
    const key = date.toISOString().slice(0, 10);
    const bucket = bucketMap.get(key);
    if (!bucket) continue;
    bucket.count += 1;
    bucket.totalIntensity += thought.intensity ?? 0;
  }

  return buckets.map((bucket) => ({
    day: bucket.label,
    count: bucket.count,
    averageIntensity: bucket.count ? Math.round((bucket.totalIntensity / bucket.count) * 10) / 10 : 0,
  }));
}
