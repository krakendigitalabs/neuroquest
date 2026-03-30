import { describe, expect, it } from 'vitest';
import { getLatestActiveMission } from '@/lib/dashboard';

describe('dashboard helpers', () => {
  it('selects the latest active or pending mission', () => {
    const mission = getLatestActiveMission([
      {
        id: 'old-active',
        userId: 'user-1',
        title: 'Old active',
        description: 'Older',
        difficultyLevel: 3,
        status: 'active',
        xpReward: 50,
        assignedBy: 'AI',
        targetBehavior: 'Delay compulsion',
        resistanceTarget: 'Five minutes',
        isAiGenerated: true,
        createdAt: '2026-03-20T10:00:00.000Z' as never,
      },
      {
        id: 'latest-pending',
        userId: 'user-1',
        title: 'Latest pending',
        description: 'Newest',
        difficultyLevel: 3,
        status: 'pending',
        xpReward: 50,
        assignedBy: 'AI',
        targetBehavior: 'Observe thought',
        resistanceTarget: 'Three minutes',
        isAiGenerated: true,
        createdAt: '2026-03-25T10:00:00.000Z' as never,
      },
      {
        id: 'completed',
        userId: 'user-1',
        title: 'Completed',
        description: 'Ignore',
        difficultyLevel: 3,
        status: 'completed',
        xpReward: 50,
        assignedBy: 'AI',
        targetBehavior: 'Complete ERP',
        resistanceTarget: 'One repetition',
        isAiGenerated: true,
        createdAt: '2026-03-26T10:00:00.000Z' as never,
      },
    ]);

    expect(mission?.id).toBe('latest-pending');
  });
});
