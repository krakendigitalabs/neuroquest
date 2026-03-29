import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import WorkspaceUsersPage from './page';

const pushMock = vi.fn();
const useFirebaseMock = vi.fn();
const useCollectionMock = vi.fn();
const useDocMock = vi.fn();
const useAccountAccessMock = vi.fn();
const setDocumentNonBlockingMock = vi.fn();
const updateDocumentNonBlockingMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('firebase/firestore', () => ({
  collection: (_firestore: unknown, ...segments: string[]) => ({ path: segments.join('/') }),
  doc: (_firestore: unknown, ...segments: string[]) => ({ path: segments.join('/') }),
  orderBy: (field: string, direction: string) => ({ field, direction }),
  serverTimestamp: () => 'server-timestamp',
  query: (target: unknown) => target,
}));

vi.mock('@/firebase', () => ({
  useFirebase: () => useFirebaseMock(),
  useCollection: (...args: unknown[]) => useCollectionMock(...args),
  useDoc: (...args: unknown[]) => useDocMock(...args),
  useMemoFirebase: (factory: () => unknown) => factory(),
}));

vi.mock('@/hooks/use-account-access', () => ({
  useAccountAccess: () => useAccountAccessMock(),
}));

vi.mock('@/firebase/non-blocking-updates', () => ({
  setDocumentNonBlocking: (...args: unknown[]) => setDocumentNonBlockingMock(...args),
  updateDocumentNonBlocking: (...args: unknown[]) => updateDocumentNonBlockingMock(...args),
}));

vi.mock('@/context/language-provider', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string | number>) => {
      if (key === 'loading') return 'Loading';
      if (key === 'workspaceUsers.title') return 'Users and access control';
      if (key === 'workspaceUsers.description') return 'Manage operational and clinical roles from a single view.';
      if (key === 'workspaceUsers.consoleBadge') return 'Superadmin console';
      if (key === 'workspaceUsers.serverControlled') return 'Server controlled';
      if (key === 'workspaceUsers.guardrailsTitle') return 'Hierarchical permission control';
      if (key === 'workspaceUsers.guardrailsDescription') return 'Guardrails';
      if (key === 'workspaceUsers.settingsTitle') return 'Workspace baseline configuration';
      if (key === 'workspaceUsers.settingsDescription') return 'Settings description';
      if (key === 'workspaceUsers.settingsSummaryTitle') return 'Recommended baseline settings';
      if (key === 'workspaceUsers.settingsSummaryDescription') return 'Summary description';
      if (key === 'workspaceUsers.settingsSaved') return 'Configuration saved.';
      if (key === 'workspaceUsers.saveSettings') return 'Save configuration';
      if (key === 'workspaceUsers.settings.themePreset') return 'Visual theme';
      if (key === 'workspaceUsers.settings.workspaceLanguage') return 'Workspace language';
      if (key === 'workspaceUsers.settings.defaultUserRole') return 'Default clinical role';
      if (key === 'workspaceUsers.settings.defaultAccountRole') return 'Default account role';
      if (key === 'workspaceUsers.settings.crisisRouting') return 'Baseline crisis route';
      if (key === 'workspaceUsers.settings.dashboardDensity') return 'Dashboard density';
      if (key === 'workspaceUsers.settings.followUpMode') return 'Follow-up mode';
      if (key === 'workspaceUsers.themeOptions.dark-blue') return 'Dark blue';
      if (key === 'workspaceUsers.themeOptions.clinical-white') return 'Clinical white';
      if (key === 'workspaceUsers.themeOptions.soft-gold') return 'Soft gold';
      if (key === 'workspaceUsers.themeOptions.graphite') return 'Graphite';
      if (key === 'workspaceUsers.themeOptions.ivory') return 'Ivory';
      if (key === 'workspaceUsers.languageOptions.es') return 'Global Spanish';
      if (key === 'workspaceUsers.languageOptions.en') return 'English';
      if (key === 'workspaceUsers.languageOptions.bilingual') return 'Bilingual';
      if (key === 'workspaceUsers.languageOptions.es-co') return 'Spanish Colombia';
      if (key === 'workspaceUsers.languageOptions.es-mx') return 'Spanish Mexico';
      if (key === 'workspaceUsers.crisisOptions.strict') return 'Strict escalation';
      if (key === 'workspaceUsers.crisisOptions.guided') return 'Guided route';
      if (key === 'workspaceUsers.crisisOptions.professional-first') return 'Professional first';
      if (key === 'workspaceUsers.crisisOptions.clinic-review') return 'Clinic review';
      if (key === 'workspaceUsers.crisisOptions.emergency-direct') return 'Direct to emergency';
      if (key === 'workspaceUsers.dashboardDensityOptions.compact') return 'Compact';
      if (key === 'workspaceUsers.dashboardDensityOptions.comfortable') return 'Comfortable';
      if (key === 'workspaceUsers.dashboardDensityOptions.focused') return 'Focused';
      if (key === 'workspaceUsers.dashboardDensityOptions.clinical') return 'Clinical';
      if (key === 'workspaceUsers.dashboardDensityOptions.expanded') return 'Expanded';
      if (key === 'workspaceUsers.followUpOptions.daily') return 'Daily';
      if (key === 'workspaceUsers.followUpOptions.business-days') return 'Business days';
      if (key === 'workspaceUsers.followUpOptions.weekly') return 'Weekly';
      if (key === 'workspaceUsers.followUpOptions.manual') return 'Manual';
      if (key === 'workspaceUsers.followUpOptions.critical-only') return 'Critical only';
      if (key === 'workspaceUsers.stats.totalUsers') return 'Users';
      if (key === 'workspaceUsers.stats.clinics') return 'Clinics';
      if (key === 'workspaceUsers.stats.professionals') return 'Professionals';
      if (key === 'workspaceUsers.stats.operators') return 'Operators';
      if (key === 'workspaceUsers.listTitle') return 'Workspace users';
      if (key === 'workspaceUsers.listDescription') return 'List description';
      if (key === 'workspaceUsers.currentSummary') return `Current account role: ${values?.accountRole} · Current clinical role: ${values?.userRole}`;
      if (key === 'workspaceUsers.accountRoleLabel') return 'Account role';
      if (key === 'workspaceUsers.userRoleLabel') return 'Clinical role';
      if (key === 'workspaceUsers.save') return 'Save access';
      if (key === 'accountRoles.owner') return 'Owner';
      if (key === 'accountRoles.manager') return 'Manager';
      if (key === 'accountRoles.administrator') return 'Administrator';
      if (key === 'accountRoles.editor') return 'Editor';
      if (key === 'accountRoles.commentator') return 'Commentator';
      if (key === 'accountRoles.viewer') return 'View only';
      if (key === 'userRoles.patient') return 'Patient user';
      if (key === 'userRoles.professional') return 'Professional user';
      if (key === 'userRoles.clinic') return 'Clinic user';
      return key;
    },
  }),
}));

describe('WorkspaceUsersPage', () => {
  it('renders the management panel for privileged workspace roles', () => {
    useFirebaseMock.mockReturnValue({ firestore: {}, user: { uid: 'owner-1' } });
    useAccountAccessMock.mockReturnValue({
      accountRole: 'owner',
      canManageWorkspaceUsers: true,
      isLoading: false,
    });
    useCollectionMock.mockReturnValue({
      data: [
        {
          id: 'user-1',
          displayName: 'Pat Doe',
          email: 'pat@example.com',
          accountRole: 'viewer',
          userRole: 'patient',
        },
      ],
      isLoading: false,
    });
    useDocMock.mockReturnValue({
      data: {
        themePreset: 'dark-blue',
        defaultUserRole: 'patient',
        defaultAccountRole: 'viewer',
        crisisRouting: 'professional-first',
        workspaceLanguage: 'es',
        dashboardDensity: 'comfortable',
        followUpMode: 'daily',
      },
      isLoading: false,
    });

    render(<WorkspaceUsersPage />);

    expect(screen.getByText('Users and access control')).toBeInTheDocument();
    expect(screen.getByText('Workspace baseline configuration')).toBeInTheDocument();
    expect(screen.getByText('Pat Doe')).toBeInTheDocument();
    expect(screen.getByText('Current account role: View only · Current clinical role: Patient user')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save access' })).toBeDisabled();
  });

  it('redirects unauthorized users away from the management panel', () => {
    useFirebaseMock.mockReturnValue({ firestore: {} });
    useAccountAccessMock.mockReturnValue({
      accountRole: 'viewer',
      canManageWorkspaceUsers: false,
      isLoading: false,
    });
    useCollectionMock.mockReturnValue({ data: [], isLoading: false });
    useDocMock.mockReturnValue({ data: null, isLoading: false });

    render(<WorkspaceUsersPage />);

    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });
});
