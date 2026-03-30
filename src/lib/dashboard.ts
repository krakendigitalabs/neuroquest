import type { ExposureMission } from '@/models/exposure-mission';
import { toDate } from '@/lib/thought-insights';

export function getLatestActiveMission(missions: ExposureMission[] | null | undefined) {
  return [...(missions ?? [])]
    .filter((mission) => mission.status === 'active' || mission.status === 'pending')
    .sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0))[0] ?? null;
}
