import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import DashboardPage from './page';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

const useFirebaseMock = vi.fn();
const useUserProfileMock = vi.fn();
const useCollectionMock = vi.fn();

vi.mock('@/firebase', () => ({
  useFirebase: () => useFirebaseMock(),
  useCollection: (...args: unknown[]) => useCollectionMock(...args),
  useMemoFirebase: (factory: () => unknown) => factory(),
}));

vi.mock('@/hooks/use-user-profile', () => ({
  useUserProfile: () => useUserProfileMock(),
}));

vi.mock('./_components/personalized-mission-generator', () => ({
  PersonalizedMissionGenerator: () => <div>Mission generator</div>,
}));

vi.mock('@/context/language-provider', () => ({
  useTranslation: () => ({
    locale: 'en-US',
    t: (key: string, values?: Record<string, string | number>) => {
      if (key === 'dashboard.welcome') return 'Welcome';
      if (key === 'dashboard.xpEarned') return 'XP';
      if (key === 'dashboard.levelTitle') return 'Level';
      if (key === 'dashboard.latestCheckIn') return 'Latest check-in';
      if (key === 'dashboard.activeMissionTitle') return 'Active mission';
      if (key === 'dashboard.noCheckInYet') return 'No check-in yet';
      if (key === 'dashboard.noActiveMission') return 'No active mission';
      if (key === 'dashboard.overviewTitle') return 'Overview';
      if (key === 'dashboard.overviewDescription') return 'Overview description';
      if (key === 'dashboard.summaryTitle') return 'Summary';
      if (key === 'dashboard.summaryBySeverity.severe') return 'Severe summary';
      if (key === 'dashboard.latestCheckInDate') return `Updated: ${values?.date ?? ''}`;
      if (key === 'dashboard.crisisBannerTitle') return 'You need an immediate support path';
      if (key === 'dashboard.crisisBannerDescription') return 'Open support routes now.';
      if (key === 'dashboard.nextMissionTitle') return 'Next mission';
      if (key === 'dashboard.nextMissionDescription') return 'Next mission description';
      if (key === 'therapist.openMedicalSupport') return 'Open Medical Support';
      if (key === 'sidebar.crisisSupport') return 'Crisis Support';
      if (key === 'userProgress.level') return `Level ${values?.level ?? 1}`;
      if (key === 'checkIn.results.severe.category') return 'Severe Level';
      if (key === 'progress.active') return 'Active';
      return key;
    },
  }),
}));

vi.mock('firebase/firestore', () => ({
  collection: (_firestore: unknown, ...segments: string[]) => ({ path: segments.join('/') }),
  orderBy: (field: string, direction: string) => ({ field, direction }),
  limit: (value: number) => ({ value }),
  query: (target: unknown) => target,
}));

describe('DashboardPage severe flow', () => {
  it('shows both Medical Support and Crisis Support actions when the last real check-in is severe', () => {
    useFirebaseMock.mockReturnValue({
      firestore: {},
      user: { uid: 'user-1' },
    });
    useUserProfileMock.mockReturnValue({
      isLoading: false,
      userProfile: {
        currentXp: 30,
        level: 2,
        latestCheckInAt: '2026-03-27T10:00:00.000Z',
        latestCheckInScore: 31,
        latestCheckInLevel: 'severe',
        latestCheckInNote: '',
      },
    });
    useCollectionMock.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<DashboardPage />);

    expect(screen.getByText('You need an immediate support path')).toBeInTheDocument();
    expect(screen.getByText('Open Medical Support')).toBeInTheDocument();
    expect(screen.getByText('Crisis Support')).toBeInTheDocument();
    expect(screen.getByText('31/40')).toBeInTheDocument();
  });
});
