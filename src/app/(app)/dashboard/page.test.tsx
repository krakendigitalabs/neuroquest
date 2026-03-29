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
      if (key === 'dashboard.recentActivityTitle') return 'Recent meaningful activity';
      if (key === 'dashboard.noRecentActivity') return 'No recent activity yet';
      if (key === 'dashboard.recentActivityHint') return 'Complete actions in modules to see the latest useful movement here.';
      if (key === 'dashboard.activeModulesCount') return `${values?.count ?? 0} modules with meaningful activity`;
      if (key === 'dashboard.weeklySummaryTitle') return 'Weekly summary';
      if (key === 'dashboard.weeklySummaryBody') return `${values?.events ?? 0} useful events across ${values?.modules ?? 0} modules this week.`;
      if (key === 'dashboard.weeklySummarySource') return 'Source: registered progressEvents from the last 7 days.';
      if (key === 'dashboard.nextStepCardTitle') return 'Suggested next step';
      if (key === 'dashboard.nextStepTitles.urgentSupport') return 'Seek urgent support now';
      if (key === 'dashboard.nextStepDescriptions.urgentSupport') return 'Your recent signals require prioritizing crisis support and immediate clinical review.';
      if (key === 'dashboard.nextStepTitles.severe') return 'Stabilize and ask for support now';
      if (key === 'dashboard.nextStepDescriptions.severe') return 'Use crisis support first and then review medical guidance.';
      if (key === 'dashboard.nextStepTitles.noCheckIn') return 'Start with a real check-in';
      if (key === 'dashboard.nextStepDescriptions.noCheckIn') return 'Complete your first check-in to unlock more precise guidance.';
      if (key === 'dashboard.nextStepTitles.observer') return 'Convert what you noticed into a new perspective';
      if (key === 'dashboard.nextStepDescriptions.observer') return 'Use reprogramming to work on the last thought you registered.';
      if (key === 'dashboard.nextStepTitles.exposure') return 'Review what changed after exposure';
      if (key === 'dashboard.nextStepDescriptions.exposure') return 'Open progress to see how your recent exposure work is accumulating.';
      if (key === 'dashboard.nextStepTitles.regulation') return 'Turn regulation into follow-up';
      if (key === 'dashboard.nextStepDescriptions.regulation') return 'Check progress or capture what changed after the practice.';
      if (key === 'dashboard.nextStepTitles.medicalSupport') return 'Document prescribed treatment';
      if (key === 'dashboard.nextStepDescriptions.medicalSupport') return 'Open the prescribed medication module if a clinician already documented a treatment plan.';
      if (key === 'dashboard.nextStepTitles.medication') return 'Follow medication with recorded progress';
      if (key === 'dashboard.nextStepDescriptions.medication') return 'Review progress and then return to medical support if the documented plan changes.';
      if (key === 'dashboard.nextStepTitles.default') return 'Keep the process moving';
      if (key === 'dashboard.nextStepDescriptions.default') return 'Open progress or observer to record the next useful step.';
      if (key === 'nav.medication') return 'Prescribed Medication';
      if (key === 'therapist.openMedicalSupport') return 'Open Medical Support';
      if (key === 'sidebar.crisisSupport') return 'Crisis Support';
      if (key === 'userProgress.level') return `Level ${values?.level ?? 1}`;
      if (key === 'checkIn.results.severe.category') return 'Severe Level';
      if (key === 'progress.active') return 'Active';
      if (key === 'progress.activityTypes.saved') return 'Saved entry';
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
        accountRole: 'viewer',
        userRole: 'patient',
        currentXp: 30,
        level: 2,
        latestCheckInAt: '2026-03-27T10:00:00.000Z',
        latestCheckInScore: 31,
        latestCheckInLevel: 'severe',
        latestCheckInUrgentSupport: true,
        latestCheckInNote: '',
      },
    });
    useCollectionMock
      .mockReturnValueOnce({
        data: [],
        isLoading: false,
      })
      .mockReturnValueOnce({
        data: [
          {
            id: 'event-1',
            userId: 'user-1',
            module: 'medical-support',
            type: 'saved',
            detail: 'Basic recommendations',
            createdAt: '2026-03-27T12:00:00.000Z',
          },
        ],
        isLoading: false,
      });

    render(<DashboardPage />);

    expect(screen.getByText('You need an immediate support path')).toBeInTheDocument();
    expect(screen.getAllByText('Open Medical Support').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Crisis Support').length).toBeGreaterThan(0);
    expect(screen.getByText('31/40')).toBeInTheDocument();
    expect(screen.getByText('Suggested next step')).toBeInTheDocument();
    expect(screen.getByText('Seek urgent support now')).toBeInTheDocument();
    expect(screen.getByText('Weekly summary')).toBeInTheDocument();
  });

  it('suggests the prescribed medication module after recent medical-support activity', () => {
    useFirebaseMock.mockReturnValue({
      firestore: {},
      user: { uid: 'user-1' },
    });
    useUserProfileMock.mockReturnValue({
      isLoading: false,
      userProfile: {
        accountRole: 'viewer',
        userRole: 'patient',
        currentXp: 30,
        level: 2,
        latestCheckInAt: '2026-03-27T10:00:00.000Z',
        latestCheckInScore: 18,
        latestCheckInLevel: 'moderate',
        latestCheckInNote: '',
      },
    });
    useCollectionMock
      .mockReturnValueOnce({
        data: [],
        isLoading: false,
      })
      .mockReturnValueOnce({
        data: [
          {
            id: 'event-1',
            userId: 'user-1',
            module: 'medical-support',
            type: 'saved',
            detail: 'Suggested intervention',
            createdAt: '2026-03-27T12:00:00.000Z',
          },
        ],
        isLoading: false,
      });

    render(<DashboardPage />);

    expect(screen.getByText('Document prescribed treatment')).toBeInTheDocument();
    expect(screen.getAllByText('Prescribed Medication').length).toBeGreaterThan(0);
  });
});
