import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TherapistPatientDetailPage from './page';

const pushMock = vi.fn();
const useCollectionMock = vi.fn();
const useDocMock = vi.fn();
const useFirebaseMock = vi.fn();
const useTherapistAccessMock = vi.fn();

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'patient-1' }),
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('firebase/firestore', () => ({
  collection: (_firestore: unknown, ...segments: string[]) => ({ path: segments.join('/') }),
  doc: (_firestore: unknown, ...segments: string[]) => ({ path: segments.join('/') }),
}));

vi.mock('@/hooks/use-therapist-access', () => ({
  useTherapistAccess: () => useTherapistAccessMock(),
}));

vi.mock('@/firebase', () => ({
  useFirebase: () => useFirebaseMock(),
  useDoc: (...args: unknown[]) => useDocMock(...args),
  useCollection: (...args: unknown[]) => useCollectionMock(...args),
  useMemoFirebase: (factory: () => unknown) => factory(),
}));

vi.mock('@/context/language-provider', () => ({
  useTranslation: () => ({
    locale: 'en-US',
    t: (key: string, values?: Record<string, string | number>) => {
      if (key === 'loading') return 'Loading';
      if (key === 'therapist.patientDetail') return 'Patient detail';
      if (key === 'therapist.latestCheckIn') return 'Latest check-in';
      if (key === 'therapist.lastMentalRecord') return 'Last mental record';
      if (key === 'therapist.latestMissionSummary') return 'Latest mission summary';
      if (key === 'therapist.riskLevel') return 'Risk level';
      if (key === 'therapist.checkInHistory') return 'Check-in history';
      if (key === 'therapist.checkInHistoryDesc') return 'Check-in history desc';
      if (key === 'therapist.reportTitle') return 'Patient clinical report';
      if (key === 'therapist.reportDescription') return 'Clinical summary ready for printing';
      if (key === 'therapist.reportHeaderTitle') return 'Report header';
      if (key === 'therapist.reportPatientLabel') return 'Patient';
      if (key === 'therapist.reportGeneratedAtLabel') return 'Issued at';
      if (key === 'therapist.reportClinicalSummaryTitle') return 'Clinical summary';
      if (key === 'therapist.reportClinicalSummary') return `Latest check-in: ${values?.level} with score ${values?.score}. Current risk: ${values?.risk}. Latest recorded activity: ${values?.activity}.`;
      if (key === 'therapist.reportCheckInHistoryTitle') return 'Recent check-ins';
      if (key === 'therapist.reportThoughtsTitle') return 'Recent thoughts report';
      if (key === 'therapist.reportMissionsTitle') return 'Recent missions report';
      if (key === 'therapist.reportPatientSignature') return 'Patient signature';
      if (key === 'therapist.reportTherapistSignature') return 'Therapist signature';
      if (key === 'therapist.observerTracking') return 'Observer tracking';
      if (key === 'therapist.observerTrackingDesc') return 'Observer tracking desc';
      if (key === 'therapist.recentMissions') return 'Recent missions';
      if (key === 'therapist.recentMissionsDesc') return 'Recent missions desc';
      if (key === 'therapist.recentThoughts') return 'Recent thoughts';
      if (key === 'therapist.recentThoughtsDesc') return 'Recent thoughts desc';
      if (key === 'therapist.latestThoughtPreview') return 'Latest thought preview';
      if (key === 'therapist.lastActivity') return 'Last activity';
      if (key === 'therapist.status') return 'Status';
      if (key === 'therapist.activeMissions') return 'Active missions';
      if (key === 'therapist.completed') return 'Completed';
      if (key === 'therapist.scoreLabel') return 'Score';
      if (key === 'therapist.latestNote') return 'Latest note';
      if (key === 'therapist.riskLevelDesc') return 'Risk level desc';
      if (key === 'therapist.backToPatients') return 'Back to patients';
      if (key === 'therapist.backToSite') return 'Back to site';
      if (key === 'therapist.statuses.needs_attention') return 'Needs attention';
      if (key === 'therapist.statuses.active') return 'Active';
      if (key === 'therapist.noThoughtsYet') return 'No thoughts yet';
      if (key === 'therapist.noMissionsYet') return 'No missions yet';
      if (key === 'therapist.noRecentActivity') return 'No recent activity';
      if (key === 'therapist.noCheckInYet') return 'No check-in yet';
      if (key === 'observer.emotion') return 'Emotion';
      if (key === 'observer.intensity') return 'Intensity';
      if (key === 'observer.compulsionUrge') return 'Compulsion urge';
      if (key === 'observer.trigger') return 'Trigger';
      if (key === 'observer.situation') return 'Situation';
      if (key === 'observer.analysis') return 'Analysis';
      if (key === 'observer.reframing') return 'Reframing';
      if (key === 'observer.noData') return 'No data';
      if (key === 'observer.riskLevels.high') return 'High';
      if (key === 'observer.riskLevels.medium') return 'Medium';
      if (key === 'observer.riskLevels.low') return 'Low';
      if (key === 'reports.printPdf') return 'Print / PDF';
      if (key === 'reports.sendWhatsApp') return 'Send by WhatsApp';
      if (key === 'reports.sendEmail') return 'Send by email';
      if (key === 'reports.emailSubjectPrefix') return 'NeuroQuest report';
      if (key.startsWith('observer.emotions.')) return key.split('.').at(-1) ?? key;
      if (key.startsWith('progress.')) return key;
      if (key.startsWith('checkIn.results.')) return key.split('.').slice(-2, -1)[0] ?? key;
      if (key === 'observer.timelinePoint') return `${values?.count ?? 0}/${values?.intensity ?? 0}`;
      return key;
    },
  }),
}));

vi.mock('@/components/logo', () => ({
  Logo: () => <div>Logo</div>,
}));

describe('TherapistPatientDetailPage', () => {
  beforeEach(() => {
    pushMock.mockReset();
    useTherapistAccessMock.mockReturnValue({
      hasTherapistAccess: true,
      isAdmin: false,
      isLoading: false,
      isTherapist: true,
    });
    useFirebaseMock.mockReturnValue({ firestore: {}, user: { uid: 'therapist-1' } });
    useDocMock.mockImplementation((ref: { path: string }) => {
      if (ref.path === 'users/patient-1') {
        return {
          data: {
            id: 'patient-1',
            displayName: 'Pat Doe',
            email: 'pat@example.com',
            therapistIds: ['therapist-1'],
            latestCheckInAt: '2026-03-25T12:00:00.000Z',
            latestCheckInScore: 18,
            latestCheckInLevel: 'severe',
            latestCheckInNote: 'Needs ERP follow-up',
            latestThoughtAt: '2026-03-26T10:00:00.000Z',
            latestThoughtEmotion: 'anxiety',
            latestThoughtIntensity: 9,
            latestThoughtPreview: 'I will contaminate everyone',
          },
          isLoading: false,
        };
      }

      return { data: null, isLoading: false };
    });
    useCollectionMock.mockImplementation((ref: { path: string }) => {
      if (ref.path === 'users/patient-1/mental_checkups') {
        return {
          data: [
            {
              id: 'check-1',
              createdAt: '2026-03-25T12:00:00.000Z',
              resultTitle: 'Severe OCD signal',
              level: 'severe',
              score: 18,
              maxScore: 40,
              summary: 'Escalating contamination obsessions',
              professionalNote: 'Needs ERP follow-up',
            },
          ],
          isLoading: false,
        };
      }

      if (ref.path === 'users/patient-1/thoughtRecords') {
        return {
          data: [
            {
              id: 'thought-1',
              thoughtText: 'I will contaminate everyone',
              recordedAt: '2026-03-26T10:00:00.000Z',
              associatedEmotion: 'anxiety',
              intensity: 9,
              compulsionUrge: 8,
              trigger: 'Crowded places',
              situation: 'On the bus',
              analysis: 'High contamination obsession',
              reframingSuggestion: 'Notice the obsession without neutralizing it',
              isIntrusive: true,
              isFactNotThought: true,
            },
          ],
          isLoading: false,
        };
      }

      if (ref.path === 'users/patient-1/exposureMissions') {
        return {
          data: [
            {
              id: 'mission-1',
              title: 'Touch the doorknob once',
              description: 'Touch and delay washing for five minutes',
              status: 'active',
              createdAt: '2026-03-24T10:00:00.000Z',
            },
          ],
          isLoading: false,
        };
      }

      return { data: [], isLoading: false };
    });
  });

  it('renders patient detail with real clinical data', () => {
    render(<TherapistPatientDetailPage />);

    expect(screen.getAllByText('Pat Doe').length).toBeGreaterThan(0);
    expect(screen.getByText('pat@example.com')).toBeInTheDocument();
    expect(screen.getByText('18/40')).toBeInTheDocument();
    expect(screen.getAllByText('I will contaminate everyone')).toHaveLength(2);
    expect(screen.getByText('Touch the doorknob once')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getAllByText('Needs attention')).toHaveLength(2);
    expect(screen.getAllByText('Patient clinical report').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Print / PDF' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Send by WhatsApp' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Send by email' }).length).toBeGreaterThan(0);
  });

  it('allows therapist access without requiring admin role', () => {
    useTherapistAccessMock.mockReturnValue({
      hasTherapistAccess: true,
      isAdmin: false,
      isLoading: false,
      isTherapist: true,
    });

    render(<TherapistPatientDetailPage />);

    expect(pushMock).not.toHaveBeenCalledWith('/dashboard');
    expect(screen.getAllByText('Pat Doe').length).toBeGreaterThan(0);
  });
});
