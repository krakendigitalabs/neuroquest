import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MedicalSupportPage from './page';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

const useFirebaseMock = vi.fn();
const useUserProfileMock = vi.fn();

vi.mock('@/firebase', () => ({
  useFirebase: () => useFirebaseMock(),
}));

vi.mock('@/hooks/use-user-profile', () => ({
  useUserProfile: () => useUserProfileMock(),
}));

vi.mock('@/context/language-provider', () => ({
  useTranslation: () => ({
    locale: 'en-US',
    t: (key: string, values?: Record<string, string | number>) => {
      if (key === 'medical.title') return 'Medical Support';
      if (key === 'medical.description') return 'Medical description';
      if (key === 'reports.printPdf') return 'Print / PDF';
      if (key === 'reports.sendWhatsApp') return 'Send by WhatsApp';
      if (key === 'reports.sendEmail') return 'Send by email';
      if (key === 'reports.emailSubjectPrefix') return 'NeuroQuest report';
      if (key === 'medical.disclaimerTitle') return 'Disclaimer';
      if (key === 'medical.disclaimerDescription') return 'Disclaimer text';
      if (key === 'medical.latestCheckInTitle') return 'Latest available check-in';
      if (key === 'medical.latestCheckInDescription') return 'Latest check-in description';
      if (key === 'medical.latestCheckInScore') return `Recorded score: ${values?.score ?? 0}`;
      if (key === 'medical.latestCheckInDate') return `Updated: ${values?.date ?? ''}`;
      if (key === 'medical.noCheckInYet') return 'There is no saved check-in yet to generate guidance.';
      if (key === 'medical.guidanceTitle') return 'Suggested guidance';
      if (key === 'medical.guidanceDescription') return 'Guidance description';
      if (key === 'medical.completeCheckInFirst') return 'Complete your Mental Check-In first to unlock this clinical view.';
      if (key === 'medical.reportTitle') return 'Printable clinical report';
      if (key === 'medical.reportDescription') return 'Report description';
      if (key === 'medical.reportHeaderTitle') return 'Report header';
      if (key === 'medical.reportPatientLabel') return 'Patient';
      if (key === 'medical.reportGeneratedAtLabel') return 'Issued at';
      if (key === 'medical.reportRecommendationsTitle') return 'Active recommendations';
      if (key === 'medical.reportPatientSignature') return 'Patient signature';
      if (key === 'medical.reportTherapistSignature') return 'Therapist signature';
      if (key === 'progress.unknownDate') return 'Unknown date';
      if (key === 'sidebar.guestUser') return 'Guest user';
      if (key === 'loading') return 'Loading';
      return key;
    },
  }),
}));

describe('MedicalSupportPage', () => {
  beforeEach(() => {
    useFirebaseMock.mockReset();
    useUserProfileMock.mockReset();
  });

  it('does not generate fake guidance when denormalized level exists but no real check-in date exists', () => {
    useFirebaseMock.mockReturnValue({
      user: { displayName: 'Pat Doe', email: 'pat@example.com' },
    });
    useUserProfileMock.mockReturnValue({
      isLoading: false,
      userProfile: {
        displayName: 'Pat Doe',
        latestCheckInLevel: 'healthy',
        latestCheckInScore: 0,
        latestCheckInAt: null,
      },
    });

    render(<MedicalSupportPage />);

    expect(screen.getAllByText('There is no saved check-in yet to generate guidance.').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Complete your Mental Check-In first to unlock this clinical view.').length).toBeGreaterThan(0);
    expect(screen.queryByText('Recorded score: 0')).not.toBeInTheDocument();
  });

  it('shows severe guidance, visible disclaimer, printable summary, and crisis support when the latest real check-in is severe', () => {
    useFirebaseMock.mockReturnValue({
      user: { displayName: 'Pat Doe', email: 'pat@example.com' },
    });
    useUserProfileMock.mockReturnValue({
      isLoading: false,
      userProfile: {
        displayName: 'Pat Doe',
        latestCheckInLevel: 'severe',
        latestCheckInScore: 31,
        latestCheckInAt: '2026-03-27T10:00:00.000Z',
      },
    });

    render(<MedicalSupportPage />);

    expect(screen.getAllByText('Medical Support').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Disclaimer').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Disclaimer text').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Printable clinical report').length).toBeGreaterThan(0);
    expect(screen.getAllByText('checkIn.results.severe.category').length).toBeGreaterThan(0);
    expect(screen.getAllByText('medical.dynamic.severe.title').length).toBeGreaterThan(0);
    expect(screen.getAllByText('medical.dynamic.severe.description').length).toBeGreaterThan(0);
    expect(screen.getAllByText('sidebar.crisisSupport').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Recorded score: 31').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Print / PDF' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Send by WhatsApp' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Send by email' }).length).toBeGreaterThan(0);
  });
});
