export type AccountRole =
  | 'owner'
  | 'manager'
  | 'administrator'
  | 'editor'
  | 'commentator'
  | 'viewer';

export const ACCOUNT_ROLE_ORDER: AccountRole[] = [
  'viewer',
  'commentator',
  'editor',
  'administrator',
  'manager',
  'owner',
];

export function isAccountRole(value: string | null | undefined): value is AccountRole {
  return ACCOUNT_ROLE_ORDER.includes(value as AccountRole);
}

export function hasMinimumAccountRole(
  currentRole: AccountRole | null | undefined,
  minimumRole: AccountRole
) {
  if (!currentRole) return false;

  return ACCOUNT_ROLE_ORDER.indexOf(currentRole) >= ACCOUNT_ROLE_ORDER.indexOf(minimumRole);
}

export function canManageWorkspaceUsers(accountRole: AccountRole | null | undefined) {
  return hasMinimumAccountRole(accountRole, 'administrator');
}

export function canEditWorkspaceContent(accountRole: AccountRole | null | undefined) {
  return hasMinimumAccountRole(accountRole, 'editor');
}

export function canCommentInWorkspace(accountRole: AccountRole | null | undefined) {
  return hasMinimumAccountRole(accountRole, 'commentator');
}

export function canViewWorkspace(accountRole: AccountRole | null | undefined) {
  return hasMinimumAccountRole(accountRole, 'viewer');
}

export function getAssignableAccountRoles(accountRole: AccountRole | null | undefined): AccountRole[] {
  switch (accountRole) {
    case 'owner':
      return [...ACCOUNT_ROLE_ORDER].reverse();
    case 'manager':
      return ['manager', 'administrator', 'editor', 'commentator', 'viewer'];
    case 'administrator':
      return ['editor', 'commentator', 'viewer'];
    default:
      return [];
  }
}
