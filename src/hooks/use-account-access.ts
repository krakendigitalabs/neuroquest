'use client';

import { useAdmin } from '@/hooks/use-admin';
import { useUserProfile } from '@/hooks/use-user-profile';
import {
  canCommentInWorkspace,
  canEditWorkspaceContent,
  canManageWorkspaceUsers,
  canViewWorkspace,
  hasMinimumAccountRole,
} from '@/lib/account-role';

export function useAccountAccess() {
  const { userProfile, isLoading: isUserProfileLoading } = useUserProfile();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();

  const accountRole = userProfile?.accountRole ?? null;
  const effectiveAccountRole = isAdmin ? 'owner' : accountRole;

  return {
    accountRole: effectiveAccountRole,
    canCommentInWorkspace: canCommentInWorkspace(effectiveAccountRole),
    canEditWorkspaceContent: canEditWorkspaceContent(effectiveAccountRole),
    canManageWorkspaceUsers: canManageWorkspaceUsers(effectiveAccountRole),
    canViewWorkspace: canViewWorkspace(effectiveAccountRole),
    hasMinimumAccountRole: (minimumRole: Parameters<typeof hasMinimumAccountRole>[1]) =>
      hasMinimumAccountRole(effectiveAccountRole, minimumRole),
    isLoading: isAdminLoading || isUserProfileLoading,
  };
}
