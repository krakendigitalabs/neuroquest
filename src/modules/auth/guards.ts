import { hasMinimumAccountRole } from '@/lib/account-role';
import type { AccountRole } from '@/lib/account-role';
import type { UserRole } from '@/models/user';

export function requireAuth(user: { uid?: string } | null | undefined) {
  return !!user?.uid;
}

export function requireAccountRole(
  accountRole: AccountRole | null | undefined,
  minimumRole: AccountRole
) {
  return hasMinimumAccountRole(accountRole, minimumRole);
}

export function requireUserRole(
  userRole: UserRole | null | undefined,
  allowedRoles: UserRole[]
) {
  return !!userRole && allowedRoles.includes(userRole);
}
