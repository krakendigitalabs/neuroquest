import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './page';

const pushMock = vi.fn();
const useFirebaseMock = vi.fn();
const searchParamsGetMock = vi.fn();
const signInWithPopupMock = vi.fn();

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({
    get: searchParamsGetMock,
  }),
}));

vi.mock('@/firebase', () => ({
  useFirebase: () => useFirebaseMock(),
}));

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: class {},
  signInWithPopup: (...args: unknown[]) => signInWithPopupMock(...args),
  signInAnonymously: vi.fn(),
}));

vi.mock('@/context/language-provider', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        loading: 'Loading',
        'login.title': 'Welcome to NeuroQuest',
        'login.description': 'Sign in to begin your journey to mental wellness.',
        'login.roleSectionTitle': 'Select the access type you need',
        'login.roleSectionDescription': 'This personalizes the initial onboarding and records your account intent.',
        'login.roles.patient.title': 'Patient',
        'login.roles.patient.description': 'Patient description',
        'login.roles.patient.helper': 'Patient helper',
        'login.roles.professional.title': 'Professional',
        'login.roles.professional.description': 'Professional description',
        'login.roles.professional.helper': 'Professional helper',
        'login.roles.clinic.title': 'Clinic',
        'login.roles.clinic.description': 'Clinic description',
        'login.roles.clinic.helper': 'Clinic helper',
        'login.accessNotes.patient.title': 'Immediate personal flow',
        'login.accessNotes.patient.description': 'Patient note',
        'login.accessNotes.professional.title': 'Professional intent recorded',
        'login.accessNotes.professional.description': 'Professional note',
        'login.accessNotes.clinic.title': 'Clinic intent recorded',
        'login.accessNotes.clinic.description': 'Clinic note',
        'login.signInWithGoogle': 'Sign in with Google',
        'login.continueAsGuest': 'Continue as Guest',
        'login.guestOnlyPatient': 'Guest access is only available for the patient flow.',
        'login.homeButton': 'Home',
        'login.signInErrorTitle': 'Sign-In Failed',
        'login.signInErrorDescription': 'Could not sign in.',
        'login.guestSignInErrorTitle': 'Guest Sign-In Failed',
        'login.guestSignInErrorDescription': 'Could not sign in as guest.',
      };

      return translations[key] ?? key;
    },
  }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/components/logo', () => ({
  Logo: () => <div>Logo</div>,
}));

describe('LoginPage role onboarding', () => {
  beforeEach(() => {
    pushMock.mockReset();
    signInWithPopupMock.mockReset();
    searchParamsGetMock.mockReset();
    localStorage.clear();
    useFirebaseMock.mockReturnValue({
      auth: {},
      user: null,
      isUserLoading: false,
    });
  });

  it('preselects the requested professional flow and disables guest access', async () => {
    searchParamsGetMock.mockImplementation((key: string) => (key === 'role' ? 'professional' : null));

    render(<LoginPage />);

    await waitFor(() => {
      expect(screen.getByText('Professional intent recorded')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Continue as Guest' })).toBeDisabled();
    expect(localStorage.getItem('neuroquest-requested-role')).toBe('professional');
  });

  it('stores the selected role before Google sign-in', async () => {
    searchParamsGetMock.mockImplementation(() => null);

    render(<LoginPage />);

    fireEvent.click(screen.getAllByText('Professional')[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Sign in with Google' })[0]);

    await waitFor(() => {
      expect(signInWithPopupMock).toHaveBeenCalledTimes(1);
    });

    expect(localStorage.getItem('neuroquest-requested-role')).toBe('professional');
  });
});
