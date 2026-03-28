import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import ProgressPage from './page';

vi.mock('firebase/firestore', () => ({
  collection: (_firestore: unknown, ...segments: string[]) => ({ path: segments.join('/') }),
}));

const useFirebaseMock = vi.fn();
const useCollectionMock = vi.fn();
const useUserProfileMock = vi.fn();

vi.mock('@/firebase', () => ({
  useFirebase: () => useFirebaseMock(),
  useCollection: (...args: unknown[]) => useCollectionMock(...args),
  useMemoFirebase: (factory: () => unknown) => factory(),
}));

vi.mock('@/hooks/use-user-profile', () => ({
  useUserProfile: () => useUserProfileMock(),
}));

vi.mock('@/context/language-provider', () => ({
  useTranslation: () => ({
    locale: 'en-US',
    t: (key: string, values?: Record<string, string | number>) => {
      if (key === 'progress.title') return 'Your Progress';
      if (key === 'progress.description') return 'Progress description';
      if (key === 'reports.printPdf') return 'Print / PDF';
      if (key === 'reports.sendWhatsApp') return 'Send by WhatsApp';
      if (key === 'reports.sendEmail') return 'Send by email';
      if (key === 'reports.emailSubjectPrefix') return 'NeuroQuest report';
      if (key === 'progress.averageScoreTitle') return 'Recent average';
      if (key === 'progress.averageScoreDescription') return 'Average description';
      if (key === 'progress.trendTitle') return 'Trend';
      if (key === 'progress.trendDescription') return `Change versus the previous block: ${values?.value ?? 0} points.`;
      if (key === 'progress.trendUnavailableTitle') return 'Not enough history';
      if (key === 'progress.trendUnavailableDescription') return 'At least two blocks of check-ins are required to calculate a real trend.';
      if (key === 'progress.latestLevelTitle') return 'Latest level';
      if (key === 'progress.latestLevelDescription') return 'Latest level description';
      if (key === 'progress.checkInTrendTitle') return 'Check-In Trend';
      if (key === 'progress.checkInTrendDescription') return 'Trend description';
      if (key === 'progress.latestCheckInsTitle') return 'Latest check-ins';
      if (key === 'progress.latestCheckInsDescription') return 'Latest check-ins description';
      if (key === 'progress.reportTitle') return 'Printable report';
      if (key === 'progress.reportDescription') return 'Report description';
      if (key === 'progress.reportHeaderTitle') return 'Report header';
      if (key === 'progress.reportPatientLabel') return 'Patient';
      if (key === 'progress.reportGeneratedAtLabel') return 'Issued at';
      if (key === 'progress.reportCheckInCount') return 'Total check-ins';
      if (key === 'progress.reportRecentHistoryTitle') return 'Recent history';
      if (key === 'progress.reportPatientSignature') return 'Patient signature';
      if (key === 'progress.reportTherapistSignature') return 'Therapist signature';
      if (key === 'progress.noCheckInsYet') return 'No saved check-ins yet.';
      if (key === 'progress.unknownDate') return 'Date unavailable';
      if (key === 'progress.checkInScore') return 'Check-In Score';
      if (key === 'progress.entryLabel') return 'Entry';
      if (key === 'checkIn.results.mild.category') return 'Mild Level';
      if (key === 'checkIn.results.moderate.category') return 'Moderate Level';
      if (key.startsWith('progress.trendStates.')) return key.split('.').at(-1) ?? key;
      if (key === 'sidebar.guestUser') return 'Guest user';
      return key;
    },
  }),
}));

vi.mock('@/components/ui/chart', () => ({
  ChartContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ChartTooltip: ({ content }: { content: React.ReactNode }) => <>{content}</>,
}));

describe('ProgressPage', () => {
  it('does not invent a trend when there is not enough history to compare blocks', () => {
    useFirebaseMock.mockReturnValue({
      firestore: {},
      user: { uid: 'user-1', displayName: 'Pat Doe', email: 'pat@example.com' },
    });
    useUserProfileMock.mockReturnValue({
      userProfile: { displayName: 'Pat Doe' },
    });
    useCollectionMock.mockReturnValue({
      data: [
        {
          id: 'check-1',
          createdAt: '2026-03-26T10:00:00.000Z',
          score: 18,
          maxScore: 40,
          level: 'moderate',
          resultTitle: 'Moderate',
        },
        {
          id: 'check-2',
          createdAt: '2026-03-20T10:00:00.000Z',
          score: 8,
          maxScore: 40,
          level: 'mild',
          resultTitle: 'Mild',
        },
      ],
    });

    render(<ProgressPage />);

    expect(screen.getByText('Recent average')).toBeInTheDocument();
    expect(screen.getAllByText('13').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Not enough history').length).toBeGreaterThan(0);
    expect(screen.getAllByText('At least two blocks of check-ins are required to calculate a real trend.').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Moderate Level').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Print / PDF' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send by WhatsApp' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send by email' })).toBeInTheDocument();
  });
});
