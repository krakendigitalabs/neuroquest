import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import WorkspaceUsersPage from './page';

const pushMock = vi.fn();
const useFirebaseMock = vi.fn();
const useCollectionMock = vi.fn();
const useAccountAccessMock = vi.fn();
const updateDocumentNonBlockingMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('firebase/firestore', () => ({
  collection: (_firestore: unknown, ...segments: string[]) => ({ path: segments.join('/') }),
  doc: (_firestore: unknown, ...segments: string[]) => ({ path: segments.join('/') }),
  orderBy: (field: string, direction: string) => ({ field, direction }),
  query: (target: unknown) => target,
}));

vi.mock('@/firebase', () => ({
  useFirebase: () => useFirebaseMock(),
  useCollection: (...args: unknown[]) => useCollectionMock(...args),
  useMemoFirebase: (factory: () => unknown) => factory(),
}));

vi.mock('@/hooks/use-account-access', () => ({
  useAccountAccess: () => useAccountAccessMock(),
}));

vi.mock('@/firebase/non-blocking-updates', () => ({
  updateDocumentNonBlocking: (...args: unknown[]) => updateDocumentNonBlockingMock(...args),
}));

vi.mock('@/context/language-provider', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string | number>) => {
      if (key === 'loading') return 'Loading';
      if (key === 'workspaceUsers.title') return 'Users and access control';
      if (key === 'workspaceUsers.description') return 'Manage operational and clinical roles from a single view.';
      if (key === 'workspaceUsers.guardrailsTitle') return 'Hierarchical permission control';
      if (key === 'workspaceUsers.guardrailsDescription') return 'Guardrails';
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
    useFirebaseMock.mockReturnValue({ firestore: {} });
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

    render(<WorkspaceUsersPage />);

    expect(screen.getByText('Users and access control')).toBeInTheDocument();
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

    render(<WorkspaceUsersPage />);

    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });
});
