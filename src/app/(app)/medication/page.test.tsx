import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import MedicationPage from './page';

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

vi.mock('@/hooks/use-track-module-activity', () => ({
  useTrackModuleActivity: () => undefined,
}));

vi.mock('firebase/firestore', () => ({
  collection: (_firestore: unknown, ...segments: string[]) => ({ path: segments.join('/') }),
  orderBy: (field: string, direction: string) => ({ field, direction }),
  limit: (value: number) => ({ value }),
  query: (target: unknown) => target,
}));

vi.mock('@/context/language-provider', () => ({
  useTranslation: () => ({
    locale: 'en-US',
    t: (key: string, _values?: Record<string, string | number>) => {
      if (key === 'medicationModule.title') return 'Prescribed Medication';
      if (key === 'medicationModule.description') return 'Structured medication documentation.';
      if (key === 'medicationModule.disclaimerTitle') return 'Documentation and education only';
      if (key === 'medicationModule.disclaimerDescription') return 'No automatic prescribing.';
      if (key === 'medicationModule.formTitle') return 'Record prescribed medication';
      if (key === 'medicationModule.formDescription') return 'Form description';
      if (key === 'medicationModule.educationTitle') return 'Educational catalog by clinical group';
      if (key === 'medicationModule.educationDescription') return 'Educational only';
      if (key === 'medicationModule.historyTitle') return 'Recorded prescriptions';
      if (key === 'medicationModule.historyDescription') return 'History description';
      if (key === 'medicationModule.emptyDescription') return 'There is no documented prescribed medication yet.';
      if (key === 'medicationModule.reportTitle') return 'Prescribed medication report';
      if (key === 'medicationModule.reportPatientLabel') return 'Patient';
      if (key === 'medicationModule.reportGeneratedAtLabel') return 'Issued at';
      if (key === 'medicationModule.reportSummaryTitle') return 'Summary';
      if (key === 'medicationModule.reportSummaryEmpty') return 'No prescriptions have been recorded yet.';
      if (key === 'medicationModule.reportPatientSignature') return 'Patient signature';
      if (key === 'medicationModule.reportProfessionalSignature') return 'Professional signature';
      if (key === 'medicationModule.form.disorderGroup') return 'Clinical group';
      if (key === 'medicationModule.form.medicationName') return 'Prescribed medication';
      if (key === 'medicationModule.form.medicationClass') return 'Medication family or class';
      if (key === 'medicationModule.form.prescribedDose') return 'Prescribed dose';
      if (key === 'medicationModule.form.frequency') return 'Frequency';
      if (key === 'medicationModule.form.durationDays') return 'Duration';
      if (key === 'medicationModule.form.route') return 'Route';
      if (key === 'medicationModule.form.startDate') return 'Start date';
      if (key === 'medicationModule.form.endDate') return 'End date';
      if (key === 'medicationModule.form.prescribedFor') return 'Clinical indication';
      if (key === 'medicationModule.form.expectedEffects') return 'Expected effects';
      if (key === 'medicationModule.form.commonSideEffects') return 'Common side effects';
      if (key === 'medicationModule.form.keyAlerts') return 'Key alerts';
      if (key === 'medicationModule.form.notes') return 'Notes';
      if (key === 'medicationModule.form.professionalName') return 'Professional name';
      if (key === 'medicationModule.form.professionalLicense') return 'Professional license';
      if (key === 'medicationModule.form.doctorSignature') return 'Professional signature';
      if (key === 'medicationModule.form.patientSignature') return 'Patient signature';
      if (key === 'medicationModule.save') return 'Save prescription';
      if (key === 'medicationModule.education.examples') return 'Examples';
      if (key === 'medicationModule.education.intendedUse') return 'Typical use';
      if (key === 'medicationModule.education.expectedEffects') return 'Expected effects';
      if (key === 'medicationModule.education.commonSideEffects') return 'Common side effects';
      if (key === 'medicationModule.education.majorAlerts') return 'Key alerts';
      if (key === 'sidebar.guestUser') return 'Guest user';
      return key;
    },
  }),
}));

describe('MedicationPage', () => {
  it('renders the prescribed medication form and educational catalog', () => {
    useFirebaseMock.mockReturnValue({
      firestore: {},
      user: { uid: 'user-1', displayName: 'Pat Doe', email: 'pat@example.com' },
    });
    useUserProfileMock.mockReturnValue({
      userProfile: { displayName: 'Pat Doe', accountRole: 'viewer', userRole: 'patient' },
    });
    useCollectionMock.mockReturnValue({ data: [] });

    render(<MedicationPage />);

    expect(screen.getByText('Prescribed Medication')).toBeInTheDocument();
    expect(screen.getByText('Documentation and education only')).toBeInTheDocument();
    expect(screen.getByText('Record prescribed medication')).toBeInTheDocument();
    expect(screen.getByText('Educational catalog by clinical group')).toBeInTheDocument();
    expect(screen.getByText('Recorded prescriptions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save prescription' })).toBeInTheDocument();
  });
});
