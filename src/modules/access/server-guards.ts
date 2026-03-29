import { redirect } from 'next/navigation';
import type { ModuleKey, ResolvedAccess } from '@/modules/access/access.types';
import { getResolvedAccessForUser } from '@/modules/access/access.service';
import { requireServerUser } from '@/modules/auth/server-session';

function getFallbackRoute(access: ResolvedAccess) {
  return access.routeAccess[0] ?? (access.role === 'guest' ? '/check-in' : '/dashboard');
}

async function getCurrentResolvedAccess() {
  try {
    const serverUser = await requireServerUser();
    return await getResolvedAccessForUser(serverUser.uid);
  } catch {
    redirect('/login');
  }
}

export async function requireModuleRouteAccess(moduleKey: ModuleKey) {
  const resolvedAccess = await getCurrentResolvedAccess();

  if (!resolvedAccess.visibleModules.includes(moduleKey)) {
    redirect(getFallbackRoute(resolvedAccess));
  }

  return resolvedAccess;
}

export async function requireNonGuestAppAccess() {
  const resolvedAccess = await getCurrentResolvedAccess();

  if (resolvedAccess.role === 'guest') {
    redirect('/check-in');
  }

  return resolvedAccess;
}

export async function requireWorkspaceAdminAccess() {
  const resolvedAccess = await getCurrentResolvedAccess();

  if (!resolvedAccess.actions.canCreateModules) {
    redirect(getFallbackRoute(resolvedAccess));
  }

  return resolvedAccess;
}
