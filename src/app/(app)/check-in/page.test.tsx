import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CheckInPage from './page';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

const useFirebaseMock = vi.fn();
const useUserProfileMock = vi.fn();
const persistMentalCheckInMock = vi.fn();

vi.mock('@/firebase', () => ({
  useFirebase: () => useFirebaseMock(),
}));

vi.mock('@/hooks/use-user-profile', () => ({
  useUserProfile: () => useUserProfileMock(),
}));

vi.mock('@/lib/check-in-records', () => ({
  persistMentalCheckIn: (...args: unknown[]) => persistMentalCheckInMock(...args),
}));

vi.mock('@/components/patient-report-actions', () => ({
  PatientReportActions: () => <div>Patient report actions</div>,
}));

vi.mock('@/lib/patient-report', () => ({
  buildPatientReportText: () => 'Check-in report',
}));

vi.mock('@/context/language-provider', () => ({
  useTranslation: () => ({
    locale: 'en-US',
    tm: (key: string) => {
      if (key === 'checkIn.questions') {
        return Array.from({ length: 10 }, (_, index) => ({
          id: index + 1,
          text: `Question ${index + 1}`,
        }));
      }

      if (key === 'checkIn.options') {
        return [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
          { value: 2, label: 'Sometimes' },
          { value: 3, label: 'Frequently' },
          { value: 4, label: 'Almost always' },
        ];
      }

      if (key === 'checkIn.clinicalGuardrailsItems') {
        return [
          'This check-in does not provide a diagnosis.',
          'This check-in does not prescribe medication or dosing.',
          'This check-in does not replace professional care.',
        ];
      }

      return [];
    },
    t: (key: string, values?: Record<string, string | number>) => {
      if (key === 'checkIn.title') return 'Mental Check-In';
      if (key === 'checkIn.subtitle') return 'Track your status';
      if (key === 'checkIn.importantTitle') return 'Important';
      if (key === 'checkIn.importantText') return 'No diagnosis tool';
      if (key === 'checkIn.disclaimerText') return 'No replacement for professional care';
      if (key === 'checkIn.clinicalGuardrailsTitle') return 'Clinical guardrails';
      if (key === 'checkIn.notesLabel') return 'Notes';
      if (key === 'checkIn.notesPlaceholder') return 'Notes placeholder';
      if (key === 'checkIn.previewTitle') return 'Preview';
      if (key === 'checkIn.pendingAnswers') return 'Pending';
      if (key === 'checkIn.completeAllQuestions') return 'Complete all';
      if (key === 'checkIn.totalScore') return 'Total score';
      if (key === 'checkIn.saveButton') return 'Save Check-In';
      if (key === 'checkIn.saving') return 'Saving...';
      if (key === 'checkIn.savedMessage') return 'Check-In saved successfully.';
      if (key === 'checkIn.defaultProfessionalNote') return 'Default note';
      if (key === 'checkIn.validationError') return 'Please answer all questions before submitting.';
      if (key === 'checkIn.resultTitle') return 'Your Result';
      if (key === 'checkIn.category') return 'Result';
      if (key === 'checkIn.assignedMission') return 'Assigned Mission';
      if (key === 'checkIn.dailyMission') return 'Daily mission';
      if (key === 'checkIn.reportTitle') return 'Mental check-in report';
      if (key === 'checkIn.reportPatientLabel') return 'Patient';
      if (key === 'checkIn.reportGeneratedAtLabel') return 'Issued at';
      if (key === 'checkIn.reportHeaderTitle') return 'Report header';
      if (key === 'checkIn.reportClinicalSummaryTitle') return 'Clinical summary';
      if (key === 'checkIn.reportClinicalSummary') return `Summary ${values?.score}/${values?.maxScore}`;
      if (key === 'checkIn.reportTasksTitle') return 'Suggested tasks';
      if (key === 'checkIn.reportNotesTitle') return 'Recorded note';
      if (key === 'checkIn.reportGuardrailsTitle') return 'Clinical guardrails';
      if (key === 'checkIn.reportPatientSignature') return 'Patient signature';
      if (key === 'checkIn.reportTherapistSignature') return 'Therapist signature';
      if (key === 'checkIn.alertTitle') return 'Important Alert';
      if (key === 'checkIn.alertText') return 'Seek urgent support';
      if (key === 'checkIn.openCrisisSupport') return 'Open crisis support';
      if (key === 'checkIn.prioritySupportTitle') return 'Priority support';
      if (key === 'checkIn.prioritySupportText') return 'Professional support';
      if (key === 'therapist.openMedicalSupport') return 'Open medical support';
      if (key === 'sidebar.guestUser') return 'Guest user';
      if (key === 'checkIn.results.severe.category') return 'Severe level';
      if (key === 'checkIn.results.severe.mission') return 'Intervention + professional support';
      if (key === 'checkIn.results.severe.description') return 'Close monitoring';
      if (key === 'checkIn.results.severe.tasks.0') return 'Task 1';
      if (key === 'checkIn.results.severe.tasks.1') return 'Task 2';
      if (key === 'checkIn.results.severe.tasks.2') return 'Task 3';
      if (key === 'checkIn.results.severe.tasks.3') return 'Task 4';
      return key;
    },
  }),
}));

describe('CheckInPage', () => {
  beforeEach(() => {
    useFirebaseMock.mockReset();
    useUserProfileMock.mockReset();
    persistMentalCheckInMock.mockReset();
    persistMentalCheckInMock.mockResolvedValue(undefined);

    useFirebaseMock.mockReturnValue({
      user: { uid: 'user-1', displayName: 'Pat Doe', email: 'pat@example.com' },
      firestore: {},
    });

    useUserProfileMock.mockReturnValue({
      userProfile: { displayName: 'Pat Doe' },
    });
  });

  it('shows explicit clinical guardrails in the check-in UI', () => {
    render(<CheckInPage />);

    expect(screen.getByText('Clinical guardrails')).toBeInTheDocument();
    expect(screen.getByText('This check-in does not provide a diagnosis.')).toBeInTheDocument();
    expect(screen.getByText('This check-in does not prescribe medication or dosing.')).toBeInTheDocument();
  });

  it('escalates severe check-ins to crisis support and persists score/level', async () => {
    render(<CheckInPage />);

    const frequentButtons = screen.getAllByRole('button', { name: 'Frequently' });
    for (let index = 0; index < 9; index += 1) {
      fireEvent.click(frequentButtons[index] as HTMLElement);
    }

    const rarelyButtons = screen.getAllByRole('button', { name: 'Rarely' });
    fireEvent.click(rarelyButtons[9] as HTMLElement);

    const notesInputs = screen.getAllByPlaceholderText('Notes placeholder');
    fireEvent.change(notesInputs[0] as HTMLElement, { target: { value: 'Clinical follow-up note' } });

    const saveButtons = screen.getAllByRole('button', { name: 'Save Check-In' });
    fireEvent.click(saveButtons[0] as HTMLElement);

    await waitFor(() => {
      expect(persistMentalCheckInMock).toHaveBeenCalledTimes(1);
    });

    const payload = persistMentalCheckInMock.mock.calls[0]?.[0] as { score: number; level: string };
    expect(payload.score).toBe(28);
    expect(payload.level).toBe('severe');

    expect(screen.getByText('Important Alert')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open crisis support' })).toHaveAttribute('href', '/crisis');
    expect(screen.queryByText('Priority support')).not.toBeInTheDocument();
  });
});
