import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/modules/auth/server-session';
import { SUPERADMIN_COOKIE_NAME, SUPERADMIN_SESSION_COOKIE_NAME } from '@/lib/superadmin-config';
import { pathnameMatches, WORKSPACE_ADMIN_PATHS } from '@/modules/auth/permissions';

const AUTH_PROTECTED_PATHS = [
  '/dashboard',
  '/check-in',
  '/observer',
  '/exposure',
  '/reprogram',
  '/regulation',
  '/wellness',
  '/medication',
  '/grounding',
  '/progress',
  '/medical-support',
  '/superadmin',
  ...WORKSPACE_ADMIN_PATHS,
];

const PUBLIC_PATH_EXCEPTIONS = ['/superadmin/login'];
const SUPERADMIN_CONSOLE_PATHS = [
  '/superadmin/dashboard',
  '/superadmin/accounts',
  '/superadmin/modules',
  '/superadmin/themes',
  '/superadmin/invites',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isSuperadminGatePath = pathname === '/superadmin';
  const isSuperadminLoginPath = pathname.startsWith('/superadmin/login');

  if (isSuperadminGatePath) {
    return NextResponse.next();
  }

  if (isSuperadminLoginPath) {
    const unlockCookie = request.cookies.get(SUPERADMIN_COOKIE_NAME)?.value;

    if (unlockCookie) {
      return NextResponse.next();
    }

    const gateUrl = request.nextUrl.clone();
    gateUrl.pathname = '/superadmin';
    gateUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(gateUrl);
  }

  if (pathnameMatches(pathname, SUPERADMIN_CONSOLE_PATHS)) {
    const superadminSessionCookie = request.cookies.get(SUPERADMIN_SESSION_COOKIE_NAME)?.value;

    if (superadminSessionCookie) {
      return NextResponse.next();
    }

    const superadminUrl = request.nextUrl.clone();
    superadminUrl.pathname = '/superadmin';
    superadminUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(superadminUrl);
  }

  const isPublicException = pathnameMatches(pathname, PUBLIC_PATH_EXCEPTIONS);
  const requiresAuthCookie = !isPublicException && pathnameMatches(pathname, AUTH_PROTECTED_PATHS);

  if (!requiresAuthCookie) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (authCookie) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', pathname);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/check-in/:path*',
    '/observer/:path*',
    '/exposure/:path*',
    '/reprogram/:path*',
    '/regulation/:path*',
    '/wellness/:path*',
    '/medication/:path*',
    '/grounding/:path*',
    '/progress/:path*',
    '/medical-support/:path*',
    '/superadmin/:path*',
    '/workspace-users/:path*',
    '/workspace-settings/:path*',
    '/workspace-audit/:path*',
  ],
};
