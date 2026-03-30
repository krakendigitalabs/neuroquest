export const WORKSPACE_ADMIN_PATHS = ['/workspace-users', '/workspace-settings', '/workspace-audit'];
export const SUPERADMIN_COOKIE_GATED_PATHS = ['/superadmin/login', ...WORKSPACE_ADMIN_PATHS];

export function pathnameMatches(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}
